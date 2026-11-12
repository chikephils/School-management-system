import { z } from "zod";
import type { CourseOfferingScope } from "../api/courseOfferingsApi";

export const courseOfferingScopes = [
  "UNIVERSITY",
  "ACADEMIC_CATEGORY",
  "FACULTY",
  "DEPARTMENT",
  "PROGRAMME",
] as const satisfies readonly CourseOfferingScope[];

export const createCourseOfferingsSchema = z
  .object({
    courseId: z.string().min(1, "Please select a course"),
    academicSemesterId: z.string().min(1, "Please select a semester"),

    scope: z.enum(courseOfferingScopes, {
      message: "Please select a course-offering scope",
    }),

    audienceIds: z.array(z.string().uuid()).default([]),

    lecturerId: z.string().optional(),

    level: z
      .number({ message: "Level is required" })
      .int("Level must be a whole number")
      .min(100, "Level must be at least 100"),

    registrationOpen: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.scope !== "UNIVERSITY" && values.audienceIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["audienceIds"],
        message: "Select at least one audience",
      });
    }

    if (values.scope === "UNIVERSITY" && values.audienceIds.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["audienceIds"],
        message: "University-wide offerings cannot have selected audiences",
      });
    }
  });

export type CreateCourseOfferingFormValues = z.input<
  typeof createCourseOfferingsSchema
>;

export type CreateCourseOfferingFormOutput = z.output<
  typeof createCourseOfferingsSchema
>;
