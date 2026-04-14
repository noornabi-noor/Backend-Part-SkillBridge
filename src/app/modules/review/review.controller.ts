import { Request, Response } from "express";
import { reviewServices } from "./review.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewServices.createReview(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewServices.getReviews(req.query);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedReview = await reviewServices.updateReview(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Review updated successfully",
    data: updatedReview,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await reviewServices.deleteReview(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Review deleted successfully",
  });
});

const getReviewsByTutor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const reviews = await reviewServices.getReviewsByTutor(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor reviews fetched successfully",
    data: reviews,
  });
});

export const reviewController = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewsByTutor,
};
