import { z } from "zod";
import { UserStatus } from "../../../../generated/prisma/enums";

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
  updateUserProfileValidationSchema,
  updateUserStatusValidationSchema,
};
