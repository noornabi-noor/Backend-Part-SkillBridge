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
