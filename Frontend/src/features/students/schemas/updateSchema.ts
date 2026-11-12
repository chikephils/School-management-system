import { z } from "zod";
import { registerStudentSchema } from "../../auth/schemas/registerStudentSchema";

export const updateStudentSchema = registerStudentSchema
  .omit({
    email: true,
    password: true,
  })
  .partial();

export type UpdateStudentFormValues = z.infer<typeof updateStudentSchema>;
