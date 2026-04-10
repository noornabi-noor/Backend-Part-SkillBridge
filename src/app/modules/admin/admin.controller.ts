import { Request, Response } from "express";
import { adminServices } from "./admin.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await adminServices.getAllUsers();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: users,
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

const getAllTutor = catchAsync(async (_req: Request, res: Response) => {
  const staff = await adminServices.getAllTutor();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutors fetched successfully",
    data: staff,
  });
});

const getAllBookings = catchAsync(async (_req: Request, res: Response) => {
  const bookings = await adminServices.getAllBookings();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Bookings fetched successfully",
    data: bookings,
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
