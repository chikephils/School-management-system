import { z } from "zod";

export const programmeAwards = [
  "BSC",
  "BA",
  "BED",
  "LLB",
  "MBBS",
  "BDS",
  "PharmD",
  "BNSC",
  "BMLS",
  "MSC",
  "MA",
  "MBA",
  "PHD",
  "PGD",
] as const;

export const createProgrammeSchema = z.object({
  name: z.string().min(1, "Programme name is required"),
  code: z
    .string()
    .min(2, "Programme code must be at least 2 characters")
    .max(15, "Programme code must not be more than 15 characters"),
  award: z.enum(programmeAwards, {
    message: "Please select a programme award",
  }),
  durationYears: z
    .number({
      message: "Duration is required",
    })
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 year"),
  departmentId: z.string().min(1, "Please select a department"),
});

export type ProgrammeAward = (typeof programmeAwards)[number];

export type CreateProgrammeFormValues = z.infer<typeof createProgrammeSchema>;
