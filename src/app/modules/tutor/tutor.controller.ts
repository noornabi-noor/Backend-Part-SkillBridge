import { Request, Response } from "express";
import { tutorServices } from "./tutor.services";
import { prisma } from "../../lib/prisma";
import { userRoles } from "../../middleware/auth";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    const err = new Error("Unauthorized");
    err.name = "UnauthorizedError";
    throw err;
  }

  if (user.role === userRoles.TUTOR) {
    const err = new Error("You are already a tutor");
    err.name = "ConflictError";
    throw err;
  }

  const tutorProfile = await tutorServices.createTutorProfile(req.body, user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { role: userRoles.TUTOR },
  });

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Tutor profile created successfully",
    data: tutorProfile,
  });
});

const getAllTutors = catchAsync(async (req: Request, res: Response) => {
  const result = await tutorServices.getAllTutors(req.query);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutors fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleTutor = catchAsync(async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const result = await tutorServices.getSingleTutor(userId as string);

  if (!result) {
    const err = new Error("Tutor not found");
    err.name = "NotFoundError";
    throw err;
  }

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor fetched successfully",
    data: result,
  });
});

const updateTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    const err = new Error("Unauthorized");
    err.name = "UnauthorizedError";
    throw err;
  }

  const updatedProfile = await tutorServices.updateTutorProfile(user.id, req.body);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor profile updated successfully",
    data: updatedProfile,
  });
});

const deleteTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await tutorServices.deleteTutorProfile(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor profile deleted successfully",
    data: result,
  });
});

const getTutorDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stats = await tutorServices.getTutorDashboardStats(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor dashboard stats fetched successfully",
    data: stats,
  });
});

const getTutorByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const tutor = await tutorServices.getSingleTutorByUserId(userId as string);

  if (!tutor) {
    const err = new Error("Tutor not found");
    err.name = "NotFoundError";
    throw err;
  }

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor fetched by User ID successfully",
    data: tutor,
  });
});

const getTopRatedTutor = catchAsync(async (req: Request, res: Response) => {
  const result = await tutorServices.getTopRatedTutor();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Top rated tutors fetched successfully",
    data: result,
  });
});

export const tutorController = {
  createTutorProfile,
  getAllTutors,
  getSingleTutor,
  updateTutorProfile,
  deleteTutorProfile,
  getTutorDashboardStats,
  getTutorByUserId,
  getTopRatedTutor,
};
