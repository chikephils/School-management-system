import type { UserRole } from "../../../types/auth";

export type StaffRegistrationRole = Exclude<UserRole, "STUDENT">;

export const staffRegistrationRoles: StaffRegistrationRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "DEPARTMENT_ADMIN",
  "LECTURER",
];

export const staffRegistrationRoleLabels: Record<
  StaffRegistrationRole,
  string
> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  LECTURER: "Lecturer",
};

export const staffTitles = ["MR", "MRS", "MISS", "DR", "PROF"] as const;

export type StaffTitle = (typeof staffTitles)[number];

export const staffTitleLabels: Record<StaffTitle, string> = {
  MR: "Mr",
  MRS: "Mrs",
  MISS: "Miss",
  DR: "Dr",
  PROF: "Prof",
};
