import { z } from "zod";

export const createFacultySchema = z.object({
  name: z.string().min(1, "Faculty name is required"),
  code: z
    .string()
    .min(2, "Faculty code must be at least 2 characters")
    .max(10, "Faculty code must not be more than 10 characters"),
  academicCategoryId: z.string().uuid("Select an academic category"),
});

export type CreateFacultyFormValues = z.infer<typeof createFacultySchema>;
