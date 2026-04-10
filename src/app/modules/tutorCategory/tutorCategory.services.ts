import { prisma } from "../../lib/prisma";
import { ITutorCategoryCreate } from "./tutorCategory.interface";

const addTutorToCategory = async (data: ITutorCategoryCreate): Promise<any> => {
  return prisma.tutorCategory.create({
    data,
  });
};

const getTutorCategories = async (
  tutorId?: string,
  categoryId?: string,
): Promise<any[]> => {
  return prisma.tutorCategory.findMany({
    where: {
      ...(tutorId && { tutorId }),
      ...(categoryId && { categoryId }),
    },
    include: {
      tutor: {
        select: {
          id: true,
          bio: true,
          pricePerHour: true,
          experience: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const removeTutorFromCategory = async (id: string): Promise<any> => {
  const data = await prisma.tutorCategory.findUnique({
    where: { id },
  });

  if (!data) {
    throw new Error("TutorCategory not found");
  }

  return prisma.tutorCategory.delete({
    where: { id },
  });
};

export const tutorCategoryServices = {
  addTutorToCategory,
  getTutorCategories,
  removeTutorFromCategory,
};

