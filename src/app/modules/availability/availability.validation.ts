import { z } from "zod";

const createAvailabilityValidationSchema = z.object({
  body: z.object({
    dayOfWeek: z.number().min(0, "Day must be at least 0 (Sunday)").max(6, "Day must be at most 6 (Saturday)"),
    startTime: z.string().min(1, "Start time is required").regex(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i, "Invalid time format. Use HH:MM or HH:MM AM/PM"),
    endTime: z.string().min(1, "End time is required").regex(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i, "Invalid time format. Use HH:MM or HH:MM AM/PM"),
  }),
});

const updateAvailabilityValidationSchema = z.object({
  body: z.object({
    dayOfWeek: z.number().min(0).max(6).optional(),
    startTime: z.string().regex(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i, "Invalid time format").optional(),
    endTime: z.string().regex(/^(\d{1,2}):(\d{2})\s?(AM|PM)?$/i, "Invalid time format").optional(),
    isBooked: z.boolean().optional(),
  }),
});

export const availabilityValidation = {
  createAvailabilityValidationSchema,
  updateBookingValidationSchema: updateAvailabilityValidationSchema, // Kept compatible name or standard
  updateAvailabilityValidationSchema,
};
