import { Request, Response } from "express";
import { usersServices } from "./user.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await usersServices.getAllUsers();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await usersServices.getUserById(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

const getCurrentUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    const err = new Error("User not found!");
    err.name = "NotFoundError"; // ensures errorHandler returns 404
    throw err;
  }

  const result = await usersServices.getCurrentUser(user.id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Current user fetched successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedUser = await usersServices.updateUserStatus(id as string, status);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User status updated successfully",
    data: updatedUser,
  });
});

const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, image, phone } = req.body;

  const updatedUser = await usersServices.updateUserProfile(id as string, {
    name,
    email,
    image,
    phone,
  });

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User profile updated successfully",
    data: updatedUser,
  });
});

export const usersController = {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUserStatus,
  updateUserProfile,
};
