import { Request, Response } from "express";
import { authServices } from "./auth.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.registerUser(req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.loginUser(req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    sendResponse(res, {
      httpStatusCode: 401,
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const user = await authServices.getMe({
    userId: req.user.id,
    role: req.user.role,
    email: req.user.email,
  } as any);

  if (!user) {
    sendResponse(res, {
      httpStatusCode: 404,
      success: false,
      message: "User not found",
    });
    return;
  }

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

const signOut = catchAsync(async (req: Request, res: Response) => {
  await authServices.signOut(req.headers);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Logged out successfully",
  });
});

export const authController = {
  registerUser,
  loginUser,
  getMe,
  signOut,
};
