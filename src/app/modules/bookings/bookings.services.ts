import { prisma } from "../../lib/prisma";
import { IBookingCreate, IBookingUpdate } from "./bookings.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

const toMinutes = (time: string): number => {
  time = time.trim();

  // 24-hour format HH:MM
  const match24 = time.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (match24) {
    const h = Number(match24[1]);
    const m = Number(match24[2]);
    return h * 60 + m;
  }

  // 12-hour format HH:MM AM/PM
  const match12 = time.match(/^(\d{1,2}):([0-5]\d)\s?(AM|PM)$/i);
  if (match12 && match12[1] && match12[2] && match12[3]) {
    const h = Number(match12[1]);
    const m = Number(match12[2]);
    const period = match12[3].toUpperCase(); // safe now

    let hours = h === 12 ? 0 : h;
    if (period === "PM") hours += 12;
    return hours * 60 + m;
  }

  throw new Error(`Invalid time format: ${time}`);
};

const createBooking = async (
  studentId: string,
  data: IBookingCreate
): Promise<any> => {
  if (data.scheduledStart >= data.scheduledEnd) {
    throw new Error("End time must be after start time");
  }

  // Overlap check
  const overlapping = await prisma.booking.findFirst({
    where: {
      tutorId: data.tutorId,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        {
          scheduledStart: { lt: data.scheduledEnd },
          scheduledEnd: { gt: data.scheduledStart },
        },
      ],
    },
  });

  if (overlapping) {
    throw new Error("This time slot is already booked for this tutor");
  }

  return prisma.booking.create({
    data: {
      tutorId: data.tutorId,
      studentId,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      status: "PENDING",
    },
  });
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
        select: {
          id: true,
          bio: true,
          pricePerHour: true,
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
  });

  return await bookingQuery.execute();
};

const getBookingById = async (bookingId: string): Promise<any> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tutor: true,
      student: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
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
    throw new Error("Booking not found");
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
    throw new Error("Booking not found");
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
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getUpcomingBookingsByTutor = async (tutorProfileId: string): Promise<any[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.booking.findMany({
    where: {
      tutorId: tutorProfileId,
      scheduledStart: { gte: today },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { scheduledStart: "asc" },
  });
};

const getBookingsByStudent = async (studentId: string): Promise<any[]> => {
  return prisma.booking.findMany({
    where: {
      studentId: studentId,
    },
    include: {
      tutor: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: {
      scheduledStart: "desc",
    },
  });
};

export const bookingServices = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByTutor,
  getUpcomingBookingsByTutor,
  getBookingsByStudent,
};
