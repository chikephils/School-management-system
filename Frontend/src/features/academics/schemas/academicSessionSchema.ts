import { z } from "zod";

export const createAcademicSessionSchema = z.object({
  name: z.string().min(1, "Academic session is required"),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isCurrent: z.boolean().optional(),
});

export type CreateAcademicSessionFormValues = z.infer<
  typeof createAcademicSessionSchema
>;
