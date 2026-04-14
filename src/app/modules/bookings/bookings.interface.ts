import { BookingStatus } from "../../../../generated/prisma/enums";

export interface IBookingCreate {
  tutorId: string;
  availabilityId: string;
}

export interface IBookingUpdate {
  status?: BookingStatus;
}
