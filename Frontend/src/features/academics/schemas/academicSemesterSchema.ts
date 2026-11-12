import { z } from "zod";

export const semesterTypes = ["FIRST", "SECOND"] as const;

export const createAcademicSemesterSchema = z.object({
  academicSessionId: z.string().min(1, "Please seslect an academic session"),
  type: z.enum(semesterTypes),
  isCurrent: z.boolean().optional(),
  registrationOpen: z.boolean().optional(),
});

export type SemesterType = (typeof semesterTypes)[number];

export type CreateAcademicSemesterFormValues = z.infer<
  typeof createAcademicSemesterSchema
>;
