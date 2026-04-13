import { Request, Response } from "express";
import { categoryServices } from "./categories.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";

const createCategories = catchAsync(async (req: Request, res: Response) => {
  let iconUrl = undefined;
  
  if (req.file) {
    const uploadResult = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
    iconUrl = uploadResult.secure_url;
  }

  const payload = {
    ...req.body,
    icon: iconUrl,
  };

  const result = await categoryServices.createCategories(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Category created successfully!",
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
  
  let iconUrl = undefined;
  if (req.file) {
    const uploadResult = await uploadFileToCloudinary(req.file.buffer, req.file.originalname);
    iconUrl = uploadResult.secure_url;
  }

  const payload = {
    ...req.body,
    icon: iconUrl,
  };

  const result = await categoryServices.updateCategory(id as string, payload);
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
