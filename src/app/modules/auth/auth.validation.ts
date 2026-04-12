import { z } from "zod";
import { Role } from "../../../../generated/prisma/enums";

const tutorProfileSchema = z.object({
  pricePerHour: z.number().min(0).optional(),
  experience: z.number().min(0).optional(),
  bio: z.string().optional(),
});

const registerUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters string"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.nativeEnum(Role).optional().default(Role.STUDENT),
    tutorProfile: tutorProfileSchema.optional(),
  }),
});

const signInUserValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().min(1, "OTP is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const getNewTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
    "better-auth.session_token": z.string().optional(),
  }),
});

export const authValidation = {
  registerUserValidationSchema,
  signInUserValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  getNewTokenValidationSchema,
};
