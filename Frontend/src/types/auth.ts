export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "DEPARTMENT_ADMIN"
  | "LECTURER"
  | "STUDENT";

export type StaffProfile = {
  faculty?: string;
  department?: string;
  staffNumber?: string;
  title?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  matricNumber?: string;
  staffNumber?: string;
  faculty?: string;
  department?: string;
  staffProfile?: StaffProfile;
};
