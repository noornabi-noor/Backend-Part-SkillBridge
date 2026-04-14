import { Request, Response } from "express";
import { tutorCategoryServices } from "./tutorCategory.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createTutorCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await tutorCategoryServices.addTutorToCategory(req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Tutor added to category successfully",
    data: result,
  });
});

const getTutorCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await tutorCategoryServices.getTutorCategories(req.query);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor categories fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const deleteTutorCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await tutorCategoryServices.removeTutorFromCategory(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor removed from category successfully",
    data: result,
  });
});

export const tutorCategoryController = {
  createTutorCategory,
  getTutorCategories,
  deleteTutorCategory,
};