import { Prisma } from "../../../../generated/prisma/client"


export const tutorAvailabilitySearchableFields = [
    'tutorId',
    'availabilityId',
]

export const tutorAvailabilityFilterableFields = [
    'tutorId',
    'availabilityId',
    'isBooked',
]

export const tutorAvailabilityIncludeConfig: Prisma.TutorAvailabilityInclude = {
    tutor: {
        include: {
            user: true,
            categories: {
                include: {
                    category: true
                }
            }
        }
    },
    availability: true
}