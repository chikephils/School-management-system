import type { CourseRegistrationType } from "../api/courseRegistrationApi";

export const courseRegistrationTypeLabels: Record<
  CourseRegistrationType,
  string
> = {
  NORMAL: "Normal",
  CARRYOVER: "Carryover",
  SPILLOVER: "Spillover",
};
