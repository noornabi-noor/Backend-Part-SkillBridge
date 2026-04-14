import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TutorAvailabilityService } from "./tutorAvailability.services";
import { IQueryParams } from "../../interface/query.interface";
import { IRequestUser } from "../../interface/requestUser.interface";

const createMyTutorAvailability = catchAsync( async (req : Request, res : Response) => {
    const payload = req.body;
    const user = req.user as any;
    
    const requestUser: IRequestUser = {
        userId: user.id,
        role: user.role,
        email: user.email
    };

    const result = await TutorAvailabilityService.createMyTutorAvailability(requestUser, payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.CREATED,
        message: 'Tutor availability created successfully',
        data: result
    });
});

const getMyTutorAvailabilities = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as any;
    
    const requestUser: IRequestUser = {
        userId: user.id,
        role: user.role,
        email: user.email
    };

    const query = req.query;
    const result = await TutorAvailabilityService.getMyTutorAvailabilities(requestUser, query as IQueryParams);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'My availabilities retrieved successfully',
        data: result.data,
        meta: result.meta
    });
});

const getAllTutorAvailabilities = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result  = await TutorAvailabilityService.getAllTutorAvailabilities(query as IQueryParams);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'All tutor availabilities retrieved successfully',
        data: result.data,
        meta: result.meta
    });
});

const getTutorAvailabilityById = catchAsync(async (req: Request, res: Response) => {
    const { tutorId, availabilityId } = req.params;
    const result = await TutorAvailabilityService.getTutorAvailabilityById(tutorId as string, availabilityId as string);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Tutor availability fetched successfully',
        data: result
    });
});

const updateMyTutorAvailability = catchAsync( async (req : Request, res : Response) => {
    const payload = req.body;
    const user = req.user as any;

    const requestUser: IRequestUser = {
        userId: user.id,
        role: user.role,
        email: user.email
    };

    const result = await TutorAvailabilityService.updateMyTutorAvailability(requestUser, payload);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,  
        message: 'Tutor availability updated successfully',
        data: result
    });
});

const deleteMyTutorAvailability = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as any;

    const requestUser: IRequestUser = {
        userId: user.id,
        role: user.role,
        email: user.email
    };

    await TutorAvailabilityService.deleteMyTutorAvailability(id as string, requestUser);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'Tutor availability deleted successfully',
    });
});

export const TutorAvailabilityController = {
    createMyTutorAvailability,
    getMyTutorAvailabilities,
    getAllTutorAvailabilities,
    getTutorAvailabilityById,
    updateMyTutorAvailability,
    deleteMyTutorAvailability
};