import { Role, UserStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ITutorCreatePayload, IUserProfileUpdate, IUserStatusUpdate } from "./users.interface";
import { QueryBuilder } from "../../utils/queryBuilder";
import AppError from "../../errorHelpers/appError";
import status from "http-status";
import { auth } from "../../lib/auth";

const createTutor = async (payload: ITutorCreatePayload) => {
  // Check if categories exist
  for (const categoryId of payload.categories) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError(status.NOT_FOUND, `Category with id ${categoryId} not found!`);
    }
  }

  // Check if user already exists
  const userExist = await prisma.user.findUnique({
    where: { email: payload.tutor.email },
  });

  if (userExist) {
    throw new AppError(status.BAD_REQUEST, "User with this email already exists!");
  }

  // Register user via Better Auth
  const authUser = await auth.api.signUpEmail({
    body: {
      name: payload.tutor.name,
      email: payload.tutor.email,
      password: payload.password,
      role: Role.TUTOR,
      status: UserStatus.ACTIVE,
      needPasswordChanged: true,
      image: payload.tutor.image || undefined, // Passing image to user model
    },
  });

  if (!authUser || !authUser.user) {
     throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user account");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create Tutor Profile
      const tutorProfile = await tx.tutorProfile.create({
        data: {
          userId: authUser.user.id,
          bio: payload.tutor.bio || null,
          pricePerHour: payload.tutor.pricePerHour,
          experience: payload.tutor.experience,
        },
      });

      // Create Tutor Categories
      const tutorCategoriesData = payload.categories.map((categoryId) => {
        return {
          tutorId: tutorProfile.id,
          categoryId: categoryId,
        };
      });

      await tx.tutorCategory.createMany({
        data: tutorCategoriesData,
      });

      // Fetch complete data to return
      return await tx.tutorProfile.findUnique({
        where: { id: tutorProfile.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              image: true,
              role: true,
              createdAt: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      });
    });

    return result;
  } catch (error) {
    console.error("Transaction failed, rolling back user creation:", error);
    // Rollback: Delete user if profile creation fails
    await prisma.user.delete({
      where: { id: authUser.user.id },
    }).catch(delErr => console.error("Rollback user deletion failed:", delErr));
    
    if (error instanceof AppError) throw error;
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Something went wrong during tutor registration");
  }
};

const getAllUsers = async (query: Record<string, any>): Promise<any> => {
  const userQuery = new QueryBuilder(prisma.user, query, {
    searchableFields: ["name", "email"],
    filterableFields: ["role", "status"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({
      role: { in: ["STUDENT", "TUTOR"] },
    })
    .include({
      tutorProfile: {
        include: {
          bookings: true,
          reviews: true,
        },
      },
    });

  return await userQuery.execute();
};

const getUserById = async (id: string): Promise<any> => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      tutorProfile: {
        include: {
          bookings: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) throw new AppError(status.NOT_FOUND, "User not found");

  if (user.role === Role.TUTOR && user.tutorProfile) {
    const totalReviews = user.tutorProfile.reviews.length;
    const avgRating =
      totalReviews === 0
        ? 0
        : parseFloat(
            (
              user.tutorProfile.reviews.reduce(
                (sum: number, r: { rating: number }) => sum + r.rating,
                0,
              ) / totalReviews
            ).toFixed(1),
          );

    return {
      ...user,
      tutorProfile: {
        ...user.tutorProfile,
        totalBookings: user.tutorProfile.bookings.length,
        totalReviews,
        averageRating: avgRating,
      },
    };
  }

  return user;
};

const getCurrentUser = async (id: string): Promise<any> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");
  return user;
};

const updateUserStatus = async (
  id: string,
  payload: IUserStatusUpdate,
): Promise<any> => {
  const { status: userStatus } = payload;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");

  return await prisma.user.update({
    where: { id },
    data: { status: userStatus },
  });
};

const updateUserProfile = async (
  id: string,
  data: IUserProfileUpdate,
): Promise<any> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(status.NOT_FOUND, "User not found");

  return await prisma.user.update({
    where: { id },
    data: {
      name: data.name ?? user.name,
      email: data.email ?? user.email,
      image: data.image ?? user.image,
      phone: data.phone ?? user.phone,
    },
  });
};

export const usersServices = {
  createTutor,
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUserStatus,
  updateUserProfile,
};
