import { Request, Response } from "express";
import { usersServices } from "./user.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";


const createTutor = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  if (req.file) {
    const cloudinaryResponse = await uploadFileToCloudinary(
      req.file.buffer,
      req.file.originalname,
    );
    if (cloudinaryResponse) {
      payload.tutor.image = cloudinaryResponse.secure_url;
    }
  }

  const result = await usersServices.createTutor(payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Tutor registered successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await usersServices.getAllUsers(req.query);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
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
    err.name = "NotFoundError";
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
  const { status: userStatus } = req.body;
  const updatedUser = await usersServices.updateUserStatus(id as string, { status: userStatus });
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
  createTutor,
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUserStatus,
  updateUserProfile,
};
