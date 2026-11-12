import { z } from "zod";
import { courseCategories } from "../constants/coursesCategories";

export const createCourseSchema = z.object({
  departmentId: z.string().min(1, "Please select a department"),
  code: z.string().min(2, "Course code is required"),
  title: z.string().min(1, "Course title is required"),
  creditUnit: z
    .number({ message: "Credit unit is required" })
    .int("Credit unit must be a whole number")
    .min(1, "Credit unit must be at least 1"),
  level: z
    .number({ message: "Level is required" })
    .int("Level must be whole number")
    .min(100, "Level must be at least 100"),
  category: z.enum(courseCategories, {
    message: "Please select a course category",
  }),
});

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;
