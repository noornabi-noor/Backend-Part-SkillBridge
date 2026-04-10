import { BookingStatus, Role } from "../../../../generated/prisma/enums";

export interface IDashboardData {
  totalUsers: number;
  totalStaff: number;
  totalBookings: number;
  totalCategories: number;
}

export interface IBookingStatusStats {
  status: BookingStatus;
  _count: {
    status: number;
  };
}

export interface IUserRoleStats {
  role: Role;
  _count: {
    role: number;
  };
}

export interface IAnalyticsStats {
  bookingStatusStats: IBookingStatusStats[];
  userRoleStats: IUserRoleStats[];
}
