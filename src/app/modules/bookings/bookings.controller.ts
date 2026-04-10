import { Request, Response } from "express";
import { bookingServices } from "./bookings.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const combineDateAndTime = (dateStr: string, timeStr: string): Date => {
  const date = new Date(dateStr);
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i);
  
  if (!timeMatch) return date;
  
  let hours = parseInt(timeMatch[1] || "0");
  const minutes = parseInt(timeMatch[2] || "0");
  const period = timeMatch[3];

  if (period) {
    if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
  }
  
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const { tutorId, date, startTime, endTime } = req.body;

  if (!tutorId || !date || !startTime || !endTime) {
    sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: "Tutor ID, date, start time, and end time are required",
    });
    return;
  }

  const result = await bookingServices.createBooking(studentId, {
    tutorId: tutorId as string,
    scheduledStart: combineDateAndTime(date as string, startTime as string),
    scheduledEnd: combineDateAndTime(date as string, endTime as string),
  });

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (_req: Request, res: Response) => {
  const result = await bookingServices.getAllBookings();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "All bookings fetched successfully",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await bookingServices.getBookingById(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Booking fetched successfully",
    data: result,
  });
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const booking = await bookingServices.getBookingById(id as string);

  // ✅ STUDENT: only own booking
  if (user.role === "STUDENT" && booking.studentId !== user.id) {
    sendResponse(res, {
      httpStatusCode: 403,
      success: false,
      message: "Forbidden",
    });
    return;
  }

  // ✅ TUTOR: must match TutorProfile ID
  if (user.role === "TUTOR" && booking.tutorId !== user.tutorProfileId) {
    sendResponse(res, {
      httpStatusCode: 403,
      success: false,
      message: "Forbidden",
    });
    return;
  }

  // ✅ STATUS RULES
  const allowedStatus: Record<string, string[]> = {
    STUDENT: ["CANCELLED"],
    TUTOR: ["CONFIRMED", "COMPLETED", "CANCELLED"],
    ADMIN: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
  };

  if (req.body.status && !allowedStatus[user.role]?.includes(req.body.status)) {
    sendResponse(res, {
      httpStatusCode: 403,
      success: false,
      message: "Invalid status change",
    });
    return;
  }

  const result = await bookingServices.updateBooking(id as string, req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Booking updated successfully",
    data: result,
  });
});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await bookingServices.deleteBooking(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Booking deleted successfully",
    data: result,
  });
});

const getBookingsByTutor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const bookings = await bookingServices.getBookingsByTutor(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor bookings fetched successfully",
    data: bookings,
  });
});

const getUpcomingBookingsByTutor = catchAsync(async (req: Request, res: Response) => {
  const tutorId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  if (!tutorId) {
    sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: "Tutor ID is required",
    });
    return;
  }

  const result = await bookingServices.getUpcomingBookingsByTutor(tutorId as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Upcoming bookings fetched successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user!.id;
  const result = await bookingServices.getBookingsByStudent(studentId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "My bookings fetched successfully",
    data: result,
  });
});

const getTutorPublicBookings = catchAsync(async (req: Request, res: Response) => {
  const { tutorId } = req.params;
  if (!tutorId) {
    sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: "Tutor ID is required",
    });
    return;
  }

  const result = await bookingServices.getUpcomingBookingsByTutor(tutorId as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor public bookings fetched successfully",
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
  getUpcomingBookingsByTutor,
  getMyBookings,
  getTutorPublicBookings,
};
