import { Request, Response } from "express";
import { adminAnalyticsServices } from "./adminAnalytic.services";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const getDashboardData = catchAsync(async (req: Request, res: Response) => {
  const result = await adminAnalyticsServices.getDashboardData();

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Dashboard data fetched successfully",
    data: result,
  });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
  const result = await adminAnalyticsServices.getStats();

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Analytics stats fetched successfully",
    data: result,
  });
});

export const adminAnalyticsController = {
  getDashboardData,
  getStats,
};
