import { z } from "zod";

export const updateScoreSchema = z.object({
  caScore: z
    .number({ message: "CA score is required" })
    .min(0, "CA score cannot be less than 0")
    .max(30, "CA score cannot be more than 30"),
  examScore: z
    .number({ message: "Exam score is required" })
    .min(0, "Exam score cannot be less than 0")
    .max(70, "Exam score cannot be more than 70"),
});

export type UpdateScoreFormValues = z.infer<typeof updateScoreSchema>;
