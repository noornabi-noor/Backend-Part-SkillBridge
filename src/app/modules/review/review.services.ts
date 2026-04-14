import { Review } from "../../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IReviewCreate, IReviewUpdate } from "./review.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

const createReview = async (data: IReviewCreate): Promise<any> => {
  const review = await prisma.review.create({
    data,
  });

  const reviews = await prisma.review.findMany({
    where: { tutorId: data.tutorId },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / totalReviews;

  await prisma.tutorProfile.update({
    where: { id: data.tutorId },
    data: {
      rating: averageRating,
      totalReviews: totalReviews,
    },
  });

  return review;
};

const getReviews = async (query: Record<string, any>): Promise<any> => {
  const reviewQuery = new QueryBuilder(prisma.review, query, {
      filterableFields: ['tutorId', 'studentId', 'rating']
  })
  .search()
  .filter()
  .sort()
  .paginate()
  .include({
      student: true,
      tutor: {
        include: { user: true },
      },
      booking: true,
  });

  return await reviewQuery.execute();
};

const updateReview = async (
  reviewId: string,
  data: IReviewUpdate
): Promise<any> => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error("Review not found");

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data,
  });

  const reviews = await prisma.review.findMany({
    where: { tutorId: review.tutorId },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / totalReviews;

  await prisma.tutorProfile.update({
    where: { id: review.tutorId },
    data: { rating: averageRating, totalReviews },
  });

  return updated;
};


const deleteReview = async (reviewId: string): Promise<any> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) throw new Error("Review not found");

  const tutorId = review.tutorId;
  await prisma.review.delete({
    where: { id: reviewId },
  });
  const remainingReviews = await prisma.review.findMany({
    where: { tutorId },
  });

  const totalReviews = remainingReviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : remainingReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / totalReviews;
  await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: {
      rating: averageRating,
      totalReviews,
    },
  });

  return true;
};

const getReviewsByTutor = async (tutorId: string): Promise<any[]> => {
  return await prisma.review.findMany({
    where: { tutorId },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });
};

export const reviewServices = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewsByTutor
};
