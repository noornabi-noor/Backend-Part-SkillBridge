import { BookingStatus } from "../../../../generated/prisma/enums";

export interface IBookingCreate {
  tutorId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
}

export interface IBookingUpdate {
  scheduledStart?: Date;
  scheduledEnd?: Date;
  status?: BookingStatus;
}
