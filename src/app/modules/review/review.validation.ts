import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, "Student ID is required"),
    tutorId: z.string().min(1, "Tutor ID is required"),
    bookingId: z.string().min(1, "Booking ID is required"),
    rating: z.number().min(0, "Rating must be at least 0").max(5, "Rating must be at most 5"),
    comment: z.string().optional(),
  }),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    rating: z.number().min(0).max(5).optional(),
    comment: z.string().optional(),
  }),
});

export const reviewValidation = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};
