import { prisma } from "../../lib/prisma";
import { IBookingCreate, IBookingUpdate } from "./bookings.interface";
import { QueryBuilder } from "../../utils/queryBuilder";
import AppError from "../../errorHelpers/appError";
import status from "http-status";

import { paymentServices } from "../payment/payment.services";

const createBooking = async (
  studentId: string,
  payload: IBookingCreate
): Promise<any> => {
  // 1. Find the specific availability slot for this tutor
  const tutorAvailability = await prisma.tutorAvailability.findUnique({
    where: {
      tutorId_availabilityId: {
        tutorId: payload.tutorId,
        availabilityId: payload.availabilityId,
      },
    },
    include: {
      availability: true,
      tutor: true,
    },
  });

  if (!tutorAvailability) {
    throw new AppError(status.NOT_FOUND, "This availability slot does not exist for this tutor");
  }

  if (tutorAvailability.isBooked) {
    throw new AppError(status.CONFLICT, "This time slot has already been booked");
  }

  // 2. Perform booking within a transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Create the booking
    const newBooking = await tx.booking.create({
      data: {
        tutorId: payload.tutorId,
        studentId: studentId,
        availabilityId: payload.availabilityId,
        scheduledStart: tutorAvailability.availability.startDateTime,
        scheduledEnd: tutorAvailability.availability.endDateTime,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    // Mark the tutor's slot as booked
    await tx.tutorAvailability.update({
      where: {
        tutorId_availabilityId: {
          tutorId: payload.tutorId,
          availabilityId: payload.availabilityId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    return newBooking;
  });

  // 3. Automatically initiate Stripe payment
  const amount = tutorAvailability.tutor?.pricePerHour || 0;
  // Stripe minimum is roughly $0.50 USD. For BDT, we should ensure it's at least ~60 BDT.
  if (amount < 60) {
    throw new AppError(status.BAD_REQUEST, "Tutor price is too low for Stripe payment. Minimum price must be at least 60 BDT.");
  }

  const paymentResult = await paymentServices.initiatePayment(booking.id);

  return {
    ...booking,
    paymentUrl: paymentResult.checkoutUrl,
  };
};

const getAllBookings = async (query: Record<string, any>): Promise<any> => {
  const bookingQuery = new QueryBuilder(prisma.booking, query, {
    filterableFields: ['status', 'tutorId', 'studentId']
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      tutor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      availability: true,
    });

  return await bookingQuery.execute();
};

const getBookingById = async (bookingId: string): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tutor: { include: { user: true } },
      student: true,
      availability: true,
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  return booking;
};

const updateBooking = async (
  bookingId: string,
  data: IBookingUpdate,
): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data,
  });
};

const deleteBooking = async (bookingId: string): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  // If a booking is deleted, we should probably unbook the slot
  if (booking.availabilityId) {
    await prisma.tutorAvailability.update({
      where: {
        tutorId_availabilityId: {
          tutorId: booking.tutorId,
          availabilityId: booking.availabilityId
        }
      },
      data: { isBooked: false }
    });
  }

  return prisma.booking.delete({
    where: { id: bookingId },
  });
};

const getBookingsByTutor = async (tutorProfileId: string): Promise<any[]> => {
  return prisma.booking.findMany({
    where: { tutorId: tutorProfileId },
    include: {
      student: {
        select: { id: true, name: true, email: true },
      },
      availability: true,
    },
    orderBy: { scheduledStart: "desc" },
  });
};

const getBookingsByStudent = async (studentId: string): Promise<any[]> => {
  return prisma.booking.findMany({
    where: { studentId },
    include: {
      tutor: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      availability: true,
    },
    orderBy: { scheduledStart: "desc" },
  });
};

const cancelUnpaidBookings = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Find bookings that are PENDING and have PENDING payment status and are older than 30 minutes
  const bookingsToCancel = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      paymentStatus: "PENDING",
      createdAt: {
        lt: thirtyMinutesAgo,
      },
    },
  });

  if (bookingsToCancel.length === 0) {
    return {
      message: "No unpaid bookings found to cancel",
      count: 0
    };
  }

  // Use transaction to ensure consistency
  await prisma.$transaction(async (tx) => {
    for (const booking of bookingsToCancel) {
      // 1. Update Booking status to CANCELLED
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });

      // 2. Free up the slot in TutorAvailability
      if (booking.availabilityId) {
        await tx.tutorAvailability.update({
          where: {
            tutorId_availabilityId: {
              tutorId: booking.tutorId,
              availabilityId: booking.availabilityId,
            },
          },
          data: { isBooked: false },
        });
      }
    }
  });

  return {
    message: `Successfully cancelled ${bookingsToCancel.length} unpaid bookings`,
    count: bookingsToCancel.length
  };
};

export const bookingServices = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByTutor,
  getBookingsByStudent,
  cancelUnpaidBookings,
};
