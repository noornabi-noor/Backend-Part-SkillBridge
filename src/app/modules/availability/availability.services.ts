import { prisma } from "../../lib/prisma";
import { IAvailabilityCreate, IAvailabilityUpdate } from "./availability.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

const createAvailability = async (
  data: IAvailabilityCreate,
  tutorId: string,
): Promise<any> => {
  return await prisma.availability.create({
    data: {
      ...data,
      dayOfWeek: Number(data.dayOfWeek),
      tutorId,
    },
  });
};

const getAllAvailabilty = async (query: Record<string, any>): Promise<any> => {
  const availabilityQuery = new QueryBuilder(prisma.availability, query, {
      filterableFields: ['dayOfWeek', 'isBooked', 'tutorId']
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .include({
      tutor: {
        select: {
          id: true,
          bio: true,
          pricePerHour: true,
          experience: true,
          rating: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
  });

  return await availabilityQuery.execute();
};

const getSingleAvailability = async (availabilityId: string): Promise<any> => {
  const availabilityData = await prisma.availability.findUnique({
    where: {
      id: availabilityId,
    },
  });

  if (!availabilityData) {
    throw new Error("Cannot fetch availability data");
  }

  return await prisma.availability.findUnique({
    where: {
      id: availabilityId,
    },
    select: {
      id: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
      isBooked: true,
      createdAt: true,

      tutor: {
        select: {
          id: true,
          bio: true,
          pricePerHour: true,
          experience: true,
          rating: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
};

const updateAvailability = async (
  availabilityId: string,
  data: IAvailabilityUpdate,
): Promise<any> => {
  const availabilityData = await prisma.availability.findUnique({
    where: { id: availabilityId },
  });

  if (!availabilityData) {
    throw new Error("Cannot fetch availability data");
  }

  return prisma.availability.update({
    where: { id: availabilityId },
    data: {
      ...(data.dayOfWeek !== undefined && {
        dayOfWeek: Number(data.dayOfWeek),
      }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.endTime && { endTime: data.endTime }),
      ...(data.isBooked !== undefined && { isBooked: data.isBooked }),
    },
  });
};

const deleteAvailability = async (avilabilityId: string): Promise<any> => {
  return await prisma.availability.delete({
    where: {
      id: avilabilityId,
    },
  });
};

const getAvailabilityByTutor = async (tutorId: string): Promise<any[]> => {
  return prisma.availability.findMany({
    where: {
      tutorId,
      isBooked: false,
    },
    select: {
      id: true,
      dayOfWeek: true,
      startTime: true,
      endTime: true,
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
  });
};


export const availabilityServices = {
  createAvailability,
  getAllAvailabilty,
  getSingleAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailabilityByTutor
};
