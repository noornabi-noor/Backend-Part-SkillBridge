import { z } from "zod";

const createTutorValidationSchema = z.object({
  body: z.object({
    bio: z.string().min(10, "Bio must be at least 10 characters long"),
    pricePerHour: z.number().min(0, "Price per hour must be at least 0"),
    experience: z.number().min(0, "Experience must be at least 0"),
    categories: z.array(z.string()).optional(),
  }),
});

const updateTutorValidationSchema = z.object({
  body: z.object({
    bio: z.string().min(10).optional(),
    pricePerHour: z.number().min(0).optional(),
    experience: z.number().min(0).optional(),
    categories: z.array(z.string()).optional(),
  }),
});

export const tutorValidation = {
  createTutorValidationSchema,
  updateTutorValidationSchema,
};
