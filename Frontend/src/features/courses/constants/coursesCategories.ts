export const courseCategories = ["CORE", "ELECTIVE"] as const;

export type CourseCategory = (typeof courseCategories)[number];

export const courseCategoryLabels: Record<CourseCategory, string> = {
  CORE: "Core",
  ELECTIVE: "Elective",
};
