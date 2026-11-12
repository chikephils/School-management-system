import type { CourseGrade } from "../../results/api/resultsApi";

export type GradeTone =
  | "emerald"
  | "blue"
  | "amber"
  | "rose"
  | "slate"
  | "orange"
  | "red";

export const gradeTones: Record<CourseGrade, GradeTone> = {
  A: "emerald",
  B: "blue",
  C: "amber",
  D: "orange",
  E: "rose",
  F: "red",
};

export function getGradeTone(grade: CourseGrade | null) {
  if (!grade) {
    return "slate";
  }

  return gradeTones[grade];
}
