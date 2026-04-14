import { prisma } from "../../lib/prisma";
import { ICategoryData, ICategoryUpdateData, IUserUpdate } from "./admin.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

const getAllUsers = async (query: Record<string, any>) => {
  const userQuery = new QueryBuilder(prisma.user, query, {
      searchableFields: ['name', 'email'],
      filterableFields: ['role', 'status']
  })
  .search()
  .filter()
  .sort()
  .paginate();

  return await userQuery.execute();
};

const updateUser = async (userId: string, data: IUserUpdate) => {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
};

const getAllTutor = async (query: Record<string, any>) => {
  const tutorQuery = new QueryBuilder(prisma.tutorProfile, query, {
      searchableFields: ['bio', 'user.name', 'user.email'],
      filterableFields: ['pricePerHour', 'experience', 'rating']
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .include({
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
  });

  return await tutorQuery.execute();
};

const getAllBookings = async (query: Record<string, any>) => {
    const bookingQuery = new QueryBuilder(prisma.booking, query, {
        filterableFields: ['status', 'tutorId', 'studentId']
    })
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tutor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    });

    return await bookingQuery.execute();
};

const createCategory = async (data: ICategoryData) => {
  return prisma.category.create({
    data,
  });
};

const updateCategory = async (categoryId: string, data: ICategoryUpdateData) => {
  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
};

export const getDashboardStats = async () => {
  // Total users, students, tutors, bookings
  const totalUsers = await prisma.user.count();
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalTutors = await prisma.user.count({ where: { role: "TUTOR" } });
  const totalBookings = await prisma.booking.count();

  // New users in last 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const newUsers = await prisma.user.findMany({
    where: { createdAt: { gte: threeDaysAgo } },
    orderBy: { createdAt: "desc" },
  });

  return {
    totalUsers,
    totalStudents,
    totalTutors,
    totalBookings,
    newUsers,
  };
};

export const adminServices = {
  getAllUsers,
  updateUser,
  getAllTutor,
  getAllBookings,
  createCategory,
  updateCategory,
  getDashboardStats,
};