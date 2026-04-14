import { UserStatus } from "../../../../generated/prisma/enums";

export interface IUserStatusUpdate {
  status: UserStatus;
}

export interface IUserProfileUpdate {
  name?: string;
  email?: string;
  image?: string;
  phone?: string;
}

export interface ITutorCreatePayload {
  password: string;
  tutor: {
    name: string;
    email: string;
    bio?: string;
    image?: string;
    pricePerHour: number;
    experience: number;
  };
  categories: string[];
}
