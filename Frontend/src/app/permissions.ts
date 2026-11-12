import type { UserRole } from "../types/auth";

export const allRoles: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "DEPARTMENT_ADMIN",
  "LECTURER",
  "STUDENT",
];

export const superAdminRoles: UserRole[] = ["SUPER_ADMIN"];

export const scoreUpdateRoles: UserRole[] = ["LECTURER"];

export const academicManagerRoles: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "DEPARTMENT_ADMIN",
];

export const resultViewerRoles: UserRole[] = [
  "STUDENT",
];

export const studentOnlyRoles: UserRole[] = ["STUDENT"];
