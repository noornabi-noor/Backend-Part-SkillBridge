import z from "zod";

const createAvailabilityZodSchema = z.object({
  body: z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format (HH:MM)",
    }),
    endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format (HH:MM)",
    }),
  })
});

const updateAvailabilityZodSchema = z.object({
  body: z.object({
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }).optional(),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }).optional(),
    startTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format (HH:MM)",
    }).optional(),
    endTime: z.string().refine((time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time), {
      message: "Invalid time format (HH:MM)",
    }).optional(),
  })
});

export const availabilityValidation = {
  createAvailabilityZodSchema,
  updateAvailabilityZodSchema
}