import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { availabilityServices } from "./availability.services";

const createAvailability = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await availabilityServices.createAvailability(payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.CREATED,
    message: "Availability slots generated successfully",
    data: result
  });
});

const getAllAvailabilities = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await availabilityServices.getAllAvailabilities(query);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Availabilities retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});

const getAvailabilityById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await availabilityServices.getAvailabilityById(id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Availability retrieved successfully",
    data: result
  });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await availabilityServices.updateAvailability(id as string, payload);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Availability updated successfully",
    data: result
  });
});

const deleteAvailability = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await availabilityServices.deleteAvailability(id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Availability deleted successfully",
  });
});

export const availabilityController = {
  createAvailability,
  getAllAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
}