import { Request, Response } from "express";
import { bookingServices } from "./bookings.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { tutorId, availabilityId } = req.body;

  const result = await bookingServices.createBooking(studentId, {
    tutorId,
    availabilityId,
  });

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingServices.getAllBookings(req.query);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All bookings fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await bookingServices.getBookingById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking fetched successfully",
    data: result,
  });
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const booking = await bookingServices.getBookingById(id as string);

  // Authorization Checks
  if (user.role === "STUDENT" && booking.studentId !== user.id) {
    sendResponse(res, {
      httpStatusCode: status.FORBIDDEN,
      success: false,
      message: "You can only update your own bookings",
    });
    return;
  }

  if (user.role === "TUTOR" && booking.tutorId !== user.tutorProfileId) {
    sendResponse(res, {
      httpStatusCode: status.FORBIDDEN,
      success: false,
      message: "You can only update bookings assigned to you",
    });
    return;
  }

  const result = await bookingServices.updateBooking(id as string, req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking updated successfully",
    data: result,
  });
});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await bookingServices.deleteBooking(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking deleted successfully",
  });
});

const getBookingsByTutor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const bookings = await bookingServices.getBookingsByTutor(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tutor bookings fetched successfully",
    data: bookings,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const result = await bookingServices.getBookingsByStudent(studentId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My bookings fetched successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByTutor,
  getMyBookings,
};
