import { prisma } from "../../lib/prisma";
import { ITutorCategoryCreate } from "./tutorCategory.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

const addTutorToCategory = async (data: ITutorCategoryCreate): Promise<any> => {
  return prisma.tutorCategory.create({
    data,
  });
};

const getTutorCategories = async (query: Record<string, any>): Promise<any> => {
  const tutorCategoryQuery = new QueryBuilder(prisma.tutorCategory, query, {
      filterableFields: ['tutorId', 'categoryId']
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
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
  });

  return await tutorCategoryQuery.execute();
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
