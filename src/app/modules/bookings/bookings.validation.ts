import { z } from "zod";
import { BookingStatus } from "../../../../generated/prisma/enums";

const createBookingValidationSchema = z.object({
  body: z.object({
    tutorId: z.string().uuid("Invalid Tutor ID format"),
    availabilityId: z.string().uuid("Invalid Availability ID format"),
  }),
});

const updateBookingValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus).optional(),
  }),
});

export const bookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
};
