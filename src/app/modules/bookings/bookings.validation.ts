import { z } from "zod";
import { BookingStatus } from "../../../../generated/prisma/enums";

const createBookingValidationSchema = z.object({
  body: z.object({
    tutorId: z.string().min(1, "Tutor ID is required"),
    date: z.string().min(1, "Date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
    startTime: z.string().min(1, "Start time is required").regex(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i, "Invalid time format. Use HH:MM or HH:MM AM/PM"),
    endTime: z.string().min(1, "End time is required").regex(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i, "Invalid time format. Use HH:MM or HH:MM AM/PM"),
  }),
});

const updateBookingValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    scheduledStart: z.string().datetime().optional(),
    scheduledEnd: z.string().datetime().optional(),
  }),
});

export const bookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
};
