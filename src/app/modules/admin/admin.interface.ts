import { Role, UserStatus } from "../../../../generated/prisma/enums";

export interface IUserUpdate {
  role?: Role;
  status?: UserStatus;
}

export interface ICategoryData {
  name: string;
}

export interface ICategoryUpdateData {
  name?: string;
}
