import { Role } from "../../../../generated/prisma/enums";

export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role: Role;
    // Optional details if registering as TUTOR
    tutorProfile?: {
        pricePerHour?: number;
        experience?: number;
        bio?: string;
    }
}

export interface ISignInUserPayload {
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface IForgotPasswordPayload {
    email: string;
}

export interface IResetPasswordPayload {
    token: string;
    newPassword: string;
}