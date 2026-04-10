import { prisma } from "../../lib/prisma";
import { ICategoryCreate, ICategoryUpdate } from "./categories.interface";

const createCategories = async (data: ICategoryCreate): Promise<any> => {
  const existing = await prisma.category.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new Error(`Category "${data.name}" already exists`);
  }

  return await prisma.category.create({
    data,
  });
};

const getAllCategory = async (): Promise<any[]> => {
  return await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      tutors: {
        select: {
          tutor: {
            select: {
              id: true,
              userId: true,
              bio: true,
              pricePerHour: true,
              experience: true,
              rating: true,
              user: {
                select: {
                  name: true,
                  image: true,
                  email: true, // optional if needed
                },
              },
            },
          },
        },
      },
    },
  });
};

const getSingleCategory = async (categoryId: string): Promise<any> => {
  const categoryData = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!categoryData) {
    throw new Error("Can not get category data!");
  }

  return await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      tutors: {
        include: {
          tutor: true,
        },
      },
    },
  });
};

const updateCategory = async (
  categoryId: string,
  data: ICategoryUpdate,
): Promise<any> => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { tutors: true },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const updateData: any = {};

  if (data.name) {
    updateData.name = data.name;
  }

  if (data.tutorIds && data.tutorIds.length > 0) {
    const existingTutorIds = category.tutors.map((t: { tutorId: string; }) => t.tutorId);
    const newTutors = data.tutorIds.filter(
      (id) => !existingTutorIds.includes(id),
    );

    if (newTutors.length > 0) {
      updateData.tutors = {
        create: newTutors.map((tutorId) => ({
          tutor: {
            connect: { id: tutorId },
          },
        })),
      };
    }
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: updateData,
    include: {
      tutors: {
        include: {
          tutor: true,
        },
      },
    },
  });
};

const deleteCategory = async (categoryId: string): Promise<any> => {
  const categoryData = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!categoryData) {
    throw new Error("Can not get category data!");
  }

  return await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};

export const categoryServices = {
  createCategories,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};

