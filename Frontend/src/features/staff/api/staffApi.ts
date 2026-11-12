import { apiClient } from "../../../lib/api/apiClient";
import type { UserRole } from "../../../types/auth";
import type { CourseOffering } from "../../courses/api/courseOfferingsApi";
import type {
  StaffRegistrationRole,
  StaffTitle,
} from "../constants/staffOptions";

export type StaffUser = {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type StaffProfile = {
  id: string;
  email: string;
  staffNumber: string;
  title: StaffTitle;
  firstName: string;
  lastName: string;
  otherName?: string | null;
  phoneNumber: string;
  faculty?: string | null;
  department?: string | null;
  user: {
    id: string;
    email: string;
    role: StaffRegistrationRole;
    isActive: boolean;
  };
};

export type UpdateStaffRequest = {
  email?: string;
  staffNumber?: string;
  title?: StaffTitle;
  firstName?: string;
  lastName?: string;
  otherName?: string;
  role?: StaffRegistrationRole;
  faculty?: string | null;
  department?: string | null;
  phoneNumber?: string;
};

export type UpdateStaffResponse = {
  message: string;
  staff: StaffProfile;
};

export type StaffQueryParams = {
  role?: UserRole;
  faculty?: string;
  department?: string;
};

export async function getLecturers() {
  const response = await apiClient.get<StaffProfile[]>("/staff?role=LECTURER");
  return response.data;
}

export async function getMyCourseOfferings() {
  const response = await apiClient.get<CourseOffering[]>(
    "/staff/me/course-offerings",
  );
  return response.data;
}

export async function getStaff(params?: StaffQueryParams) {
  const response = await apiClient.get<StaffProfile[]>("/staff", { params });
  return response.data;
}

export async function updateStaff(id: string, payload: UpdateStaffRequest) {
  const response = await apiClient.patch<UpdateStaffResponse>(
    `/staff/${id}`,
    payload,
  );

  return response.data;
}
