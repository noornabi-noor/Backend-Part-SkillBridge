import { Request, Response } from "express";
import { availabilityServices } from "./availability.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createAvailability = catchAsync(async (req: Request, res: Response) => {
  const tutorId = req.user?.tutorProfileId;
  if (!tutorId) {
    sendResponse(res, {
      httpStatusCode: 401,
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const result = await availabilityServices.createAvailability(req.body, tutorId);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Availability created successfully",
    data: result,
  });
});

const getAllAvailabilty = catchAsync(async (_req: Request, res: Response) => {
  const result = await availabilityServices.getAllAvailabilty();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "All availabilities fetched successfully",
    data: result,
  });
});

const getSingleAvailability = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await availabilityServices.getSingleAvailability(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Availability fetched successfully",
    data: result,
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: "No data provided to update",
    });
    return;
  }

  const { id } = req.params;
  const result = await availabilityServices.updateAvailability(id as string, req.body);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Availability updated successfully",
    data: result,
  });
});

const deleteAvailability = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await availabilityServices.deleteAvailability(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Availability deleted successfully",
    data: result,
  });
});

const getAvailabilityByTutor = catchAsync(async (req: Request, res: Response) => {
  let tutorId = req.params.tutorId;
  if (!tutorId) {
    sendResponse(res, {
      httpStatusCode: 400,
      success: false,
      message: "Tutor ID is required",
    });
    return;
  }

  const result = await availabilityServices.getAvailabilityByTutor(tutorId as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Tutor availability fetched successfully",
    data: result,
  });
});

const getMyAvailability = catchAsync(async (req: Request, res: Response) => {
  const tutorId = req.user?.tutorProfileId;
  if (!tutorId) {
    sendResponse(res, {
      httpStatusCode: 401,
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const result = await availabilityServices.getAvailabilityByTutor(tutorId);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "My availability fetched successfully",
    data: result,
  });
});

export const availabiltyController = {
  createAvailability,
  getAllAvailabilty,
  getSingleAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailabilityByTutor,
  getMyAvailability,
};
