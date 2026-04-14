import { Prisma, TutorAvailability } from "../../../../generated/prisma/client";
import { IQueryParams } from "../../interface/query.interface";
import { IRequestUser } from "../../interface/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/queryBuilder";
import { tutorAvailabilityFilterableFields, tutorAvailabilityIncludeConfig, tutorAvailabilitySearchableFields } from "./tutorAvailability.constant";
import { ICreateTutorAvailabilityPayload, IUpdateTutorAvailabilityPayload } from "./tutorAvailability.interface";

const createMyTutorAvailability = async (user: IRequestUser, payload: ICreateTutorAvailabilityPayload) => {
    if (!payload.availabilityIds || !Array.isArray(payload.availabilityIds) || payload.availabilityIds.length === 0) {
        throw new Error("availabilityIds must be a non-empty array");
    }

    const tutorData = await prisma.tutorProfile.findUniqueOrThrow({
        where: {
            userId: user.userId
        }
    });

    const tutorAvailabilityData = payload.availabilityIds.map((availabilityId) => ({
        tutorId: tutorData.id,
        availabilityId
    }))

    await prisma.tutorAvailability.createMany({
        data: tutorAvailabilityData,
        skipDuplicates: true
    });

    const result = await prisma.tutorAvailability.findMany({
        where: {
            tutorId: tutorData.id,
            availabilityId: {
                in: payload.availabilityIds
            }
        },
        include: {
            availability: true
        }
    })

    return result;
}

const getMyTutorAvailabilities = async (user: IRequestUser, query: IQueryParams) => {
    const tutorData = await prisma.tutorProfile.findUniqueOrThrow({
        where: {
            userId: user.userId
        }
    });

    const queryBuilder = new QueryBuilder<TutorAvailability, Prisma.TutorAvailabilityWhereInput, Prisma.TutorAvailabilityInclude>(
        prisma.tutorAvailability,
        {
            tutorId: tutorData.id,
            ...query
        },
        {
            filterableFields: tutorAvailabilityFilterableFields,
            searchableFields: tutorAvailabilitySearchableFields
        })

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .include({
            availability: true,
            tutor: {
                include: {
                    user: true,
                }
            }
        })
        .sort()
        .execute();

    return result;
}

const getAllTutorAvailabilities = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<TutorAvailability, Prisma.TutorAvailabilityWhereInput, Prisma.TutorAvailabilityInclude>(
        prisma.tutorAvailability, 
        query, 
        {
            filterableFields: tutorAvailabilityFilterableFields,
            searchableFields: tutorAvailabilitySearchableFields
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .paginate()
        .include(tutorAvailabilityIncludeConfig)
        .sort()
        .execute();

    return result;
}

const getTutorAvailabilityById = async (tutorId: string, availabilityId: string) => {
    const tutorAvailability = await prisma.tutorAvailability.findUnique({
        where: {
            tutorId_availabilityId: {
                tutorId: tutorId,
                availabilityId: availabilityId
            }
        },
        include: {
            availability: true,
            tutor: {
                include: {
                    user: true
                }
            }
        }
    });
    return tutorAvailability;
}

const updateMyTutorAvailability = async (user: IRequestUser, payload: IUpdateTutorAvailabilityPayload) => {
    const tutorData = await prisma.tutorProfile.findUniqueOrThrow({
        where: {
            userId: user.userId
        }
    });

    const deleteIds = payload.availabilities.filter(a => a.shouldDelete).map(a => a.id);
    const createIds = payload.availabilities.filter(a => !a.shouldDelete).map(a => a.id);

    const result = await prisma.$transaction(async (tx) => {
        if (deleteIds.length > 0) {
            await tx.tutorAvailability.deleteMany({
                where: {
                    isBooked: false,
                    tutorId: tutorData.id,
                    availabilityId: {
                        in: deleteIds
                    }
                }
            });
        }

        if (createIds.length > 0) {
            const tutorAvailabilityData = createIds.map((availabilityId) => ({
                tutorId: tutorData.id,
                availabilityId
            }))

            await tx.tutorAvailability.createMany({
                data: tutorAvailabilityData,
                skipDuplicates: true
            });
        }

        return { message: "Availability updated successfully" };
    })

    return result;
}

const deleteMyTutorAvailability = async (availabilityId: string, user: IRequestUser) => {
    const tutorData = await prisma.tutorProfile.findUniqueOrThrow({
        where: {
            userId: user.userId
        }
    });

    await prisma.tutorAvailability.delete({
        where: {
            tutorId_availabilityId: {
                tutorId: tutorData.id,
                availabilityId: availabilityId
            }
        }
    });
}

export const TutorAvailabilityService = {
    createMyTutorAvailability,
    getAllTutorAvailabilities,
    getTutorAvailabilityById,
    updateMyTutorAvailability,
    deleteMyTutorAvailability,
    getMyTutorAvailabilities
};