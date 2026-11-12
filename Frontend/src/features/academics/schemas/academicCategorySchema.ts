import { z } from "zod";

export const academicCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  code: z.string().trim().min(2, "Category code is required"),
  description: z.string().trim().max(255).optional(),
});

export type AcademicCategoryFormValues = z.infer<typeof academicCategorySchema>;
