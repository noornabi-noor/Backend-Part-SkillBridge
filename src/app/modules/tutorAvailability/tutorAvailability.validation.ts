import z from "zod";

const createTutorAvailabilityZodSchema = z.object({
  body: z.object({
    availabilityIds: z.array(z.string().uuid("Invalid UUID format")).min(1, "availabilityIds must contain at least one ID")
  })
});

const updateTutorAvailabilityZodSchema = z.object({
  body: z.object({
    availabilities: z.array(
        z.object({
            id: z.string().uuid({ message: "id must be a valid UUID" }),
            shouldDelete: z.boolean()
        })
    ).min(1, { message: "availabilities must contain at least one item" })
  })
});

export const TutorAvailabilityValidation = {
    createTutorAvailabilityZodSchema,
    updateTutorAvailabilityZodSchema
};
