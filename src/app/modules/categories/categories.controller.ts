import { Request, Response } from "express";
import { categoryServices } from "./categories.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryServices.createCategories(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryServices.getAllCategory();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await categoryServices.getSingleCategory(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, tutorIds } = req.body;

  const result = await categoryServices.updateCategory(id as string, { name, tutorIds });
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await categoryServices.deleteCategory(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const categoryController = {
  createCategories,
  getAllCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
