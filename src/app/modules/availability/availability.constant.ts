import { Prisma } from "../../../../generated/prisma/client"

export const availabilityFilterableFields = [
    'id',
    'startDateTime',
    'endDateTime',
]

export const availabilitySearchableFields = [
    'id',
    'startDateTime',
    'endDateTime',
]

export const availabilityIncludeConfig: Prisma.AvailabilityInclude = {
    bookings: {
        include: {
            tutor: true,
            student: true,
            payment: true,
            review: true,
        }
    },
    tutorProfiles: true
}