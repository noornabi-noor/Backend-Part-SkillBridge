import { z } from "zod";
import { UserStatus } from "../../../../generated/prisma/enums";

const createTutorValidationSchema = z.object({
  body: z.object({
    password: z.string().min(1, "Password is required"),
    tutor: z.object({
      name: z.string().min(1, "Name is required"),
      email: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
      bio: z.string().optional(),
      image: z.string().optional(),
      pricePerHour: z.number().min(0, "Price per hour must be a positive number"),
      experience: z.number().min(0, "Experience must be a positive number"),
    }),
    categories: z.array(z.string()).min(1, "At least one category is required"),
  }),
});

const updateUserProfileValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    image: z.string().optional(),
    phone: z.string().optional(),
  }),
});

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus),
  }),
});

export const userValidation = {
  createTutorValidationSchema,
  updateUserProfileValidationSchema,
  updateUserStatusValidationSchema,
};
