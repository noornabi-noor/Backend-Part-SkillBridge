import { Request, Response } from "express";
import { adminServices } from "./admin.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllUsers(req.query);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminServices.updateUser(id as string, req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const getAllTutor = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllTutor(req.query);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutors fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllBookings(req.query);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Bookings fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.createCategory(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminServices.updateCategory(id as string, req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await adminServices.getDashboardStats();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Dashboard stats fetched successfully",
    data: stats,
  });
});

export const adminController = {
  getAllUsers,
  updateUser,
  getAllTutor,
  getAllBookings,
  createCategory,
  updateCategory,
  getDashboardStats,
};
