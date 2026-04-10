import { prisma } from "../../lib/prisma";
import { IAnalyticsStats, IDashboardData } from "./adminAnalytic.interface";

const getDashboardData = async (): Promise<IDashboardData> => {
  const totalUsers = await prisma.user.count();
  const totalStaff = await prisma.user.count({
    where: { role: "TUTOR" },
  });
  const totalBookings = await prisma.booking.count();
  const totalCategories = await prisma.category.count();

  return {
    totalUsers,
    totalStaff,
    totalBookings,
    totalCategories,
  };
};

const getStats = async (): Promise<IAnalyticsStats> => {
  const bookingStatusStats = await prisma.booking.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const userRoleStats = await prisma.user.groupBy({
    by: ["role"],
    _count: {
      role: true,
    },
  });

  return {
    bookingStatusStats: bookingStatusStats as any,
    userRoleStats: userRoleStats as any,
  };
};

export const adminAnalyticsServices = {
  getDashboardData,
  getStats,
};

