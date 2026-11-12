import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z
    .string()
    .min(2, "Department code must be at least 2 charaters")
    .max(10, "Department code must not be more than 10 characters"),
  facultyId: z.string().min(1, "Please select a faculty"),
});

export type CreateDepartmentFormValues = z.infer<typeof createDepartmentSchema>;
