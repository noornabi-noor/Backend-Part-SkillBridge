import { z } from "zod";
import { Role, UserStatus } from "../../../../generated/prisma/enums";

const updateUserValidationSchema = z.object({
  body: z.object({
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").optional(),
  }),
});

export const adminValidation = {
  updateUserValidationSchema,
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
