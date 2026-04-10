import { prisma } from "../../lib/prisma";
import { ITutorProfileInput } from "./tutor.interface";

const createTutorProfile = async (data: ITutorProfileInput, userId: string): Promise<any> => {
  return prisma.tutorProfile.upsert({
    where: { userId },
    update: {
      ...(data.bio !== undefined && { bio: data.bio }),
      experience: data.experience,
      pricePerHour: data.pricePerHour,
      categories: {
        deleteMany: {},
        create:
          data.categories?.map((name) => ({
            category: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })) || [],
      },
    },
    create: {
      userId,
      ...(data.bio !== undefined && { bio: data.bio }),
      experience: data.experience,
      pricePerHour: data.pricePerHour,
      categories: {
        create:
          data.categories?.map((name) => ({
            category: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })) || [],
      },
    },
  });
};

const getAllTutors = async (): Promise<any[]> => {
  return await prisma.tutorProfile.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      reviews: true,
    },
  });
};

const getSingleTutor = async (id: string): Promise<any> => {
  return await prisma.tutorProfile.findFirst({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          phone: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      availability: {
        where: {
          isBooked: false,
        },
        orderBy: {
          dayOfWeek: "asc",
        },
      },
      reviews: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
};

const updateTutorProfile = async (userId: string, data: ITutorProfileInput): Promise<any> => {
  return prisma.tutorProfile.upsert({
    where: { userId },
    update: {
      ...(data.bio !== undefined && { bio: data.bio }),
      experience: data.experience,
      pricePerHour: data.pricePerHour,
      categories: {
        deleteMany: {},
        create:
          data.categories?.map((name: string) => ({
            category: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })) || [],
      },
    },
    create: {
      userId,
      ...(data.bio !== undefined && { bio: data.bio }),
      experience: data.experience,
      pricePerHour: data.pricePerHour,
      categories: {
        create:
          data.categories?.map((name: string) => ({
            category: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })) || [],
      },
    },
  });
};


const deleteTutorProfile = async (userId: string): Promise<any> => {
  const tutorData = await prisma.tutorProfile.findFirst({
    where: {
      userId,
    },
  });

  if (!tutorData) {
    throw new Error("Tutor profile not found");
  }

  return prisma.tutorProfile.delete({
    where: {
      userId,
    },
  });
};

export async function getTutorDashboardStats(userId: string): Promise<any> {
  const profile = await prisma.tutorProfile.findFirst({
    where: { userId },
    include: {
      categories: { include: { category: true } },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  });

  if (!profile) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
      },
    });

    return {
      user,
      profile: null,
      bookings: [],
      reviews: [],
      totalBookings: 0,
      totalReviews: 0,
      averageRating: 0,
      upcomingSessions: 0,
    };
  }

  const bookings = await prisma.booking.findMany({
    where: { tutorId: profile.userId },
  });

  const reviews = await prisma.review.findMany({
    where: { tutorId: profile.userId },
  });

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : parseFloat(
        (
          reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews
        ).toFixed(1),
      );

  const now = new Date();
  const upcomingSessions = bookings.filter(
    (b) => b.scheduledStart > now,
  ).length;

  return {
    user: profile.user,
    profile,
    bookings,
    reviews,
    totalBookings: bookings.length,
    totalReviews,
    averageRating,
    upcomingSessions,
  };
}

const getSingleTutorByUserId = async (userId: string): Promise<any> => {
  return await prisma.tutorProfile.findFirst({
    where: { userId },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
};

const getTopRatedTutor = async (): Promise<any[]> => {
  return await prisma.tutorProfile.findMany({
    orderBy: {
      rating: "desc",
    },
    take: 6,
    include: {
      user: true,
    },
  });
};

export const tutorServices = {
  createTutorProfile,
  getAllTutors,
  getSingleTutor,
  updateTutorProfile,
  deleteTutorProfile,
  getTutorDashboardStats,
  getSingleTutorByUserId,
  getTopRatedTutor,
};

