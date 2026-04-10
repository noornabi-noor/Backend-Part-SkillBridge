import { z } from "zod";

const createTutorCategoryValidationSchema = z.object({
  body: z.object({
    tutorId: z.string().min(1, "Tutor ID is required"),
    categoryId: z.string().min(1, "Category ID is required"),
  }),
});

export const tutorCategoryValidation = {
  createTutorCategoryValidationSchema,
};
