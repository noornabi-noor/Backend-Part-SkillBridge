import { addHours, addMinutes, format } from "date-fns";
import { Prisma, Availability } from "../../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateAvailabilityPayload, IUpdateAvailabilityPayload } from "./availability.interface";
import { convertDateTime } from "./availability.utils";
import { availabilityFilterableFields, availabilityIncludeConfig, availabilitySearchableFields } from "./availability.constant";
import { QueryBuilder } from "../../utils/queryBuilder";

const createAvailability = async (payload: ICreateAvailabilityPayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const interval = 30; // 30 minute slots

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  const availabilities = [];

  while (currentDate <= lastDate) {
    const dateOnly = new Date(`${format(currentDate, "yyyy-MM-dd")}T00:00:00`);

    const startDateTime = addMinutes(
      addHours(
        dateOnly,
        Number(startTime.split(":")[0])
      ),
      Number(startTime.split(":")[1])
    );

    const endDateTime = addMinutes(
      addHours(
        dateOnly,
        Number(endTime.split(":")[0])
      ),
      Number(endTime.split(":")[1])
    );

    while (startDateTime < endDateTime) {
      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, interval));

      const availabilityData = {
        startDateTime: s,
        endDateTime: e
      }

      const existingAvailability = await prisma.availability.findFirst({
        where: {
          startDateTime: availabilityData.startDateTime,
          endDateTime: availabilityData.endDateTime
        }
      })

      if (!existingAvailability) {
        const result = await prisma.availability.create({
          data: availabilityData
        })
        availabilities.push(result);
      }

      startDateTime.setMinutes(startDateTime.getMinutes() + interval)
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availabilities;
}

const getAllAvailabilities = async (query: Record<string, any>) => {
  const queryBuilder = new QueryBuilder<Availability, Prisma.AvailabilityWhereInput, Prisma.AvailabilityInclude>(
    prisma.availability,
    query,
    {
      searchableFields: availabilitySearchableFields,
      filterableFields: availabilityFilterableFields
    }
  )

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include(availabilityIncludeConfig) // Changed from dynamicInclude to include if QueryBuilder supports it
    .sort()
    .execute();

  return result;
}

const getAvailabilityById = async (id: string) => {
  const availability = await prisma.availability.findUnique({
    where: { id },
    include: availabilityIncludeConfig
  });
  return availability;
}

const updateAvailability = async (id: string, payload: IUpdateAvailabilityPayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const startDateOnly = new Date(`${format(new Date(startDate), 'yyyy-MM-dd')}T00:00:00`);
  const endDateOnly = new Date(`${format(new Date(endDate), 'yyyy-MM-dd')}T00:00:00`);

  const startDateTime = addMinutes(
    addHours(
      startDateOnly,
      Number(startTime.split(':')[0])
    ),
    Number(startTime.split(':')[1])
  );

  const endDateTime = addMinutes(
    addHours(
      endDateOnly,
      Number(endTime.split(':')[0])
    ),
    Number(endTime.split(':')[1])
  );

  const updatedAvailability = await prisma.availability.update({
    where: { id },
    data: {
      startDateTime: startDateTime,
      endDateTime: endDateTime
    }
  });

  return updatedAvailability;
}

const deleteAvailability = async (id: string) => {
  await prisma.availability.delete({
    where: { id }
  });
  return true;
}

export const availabilityServices = {
  createAvailability,
  getAllAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability
}