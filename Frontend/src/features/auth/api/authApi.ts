import { apiClient } from "../../../lib/api/apiClient";
import type { AuthUser } from "../../../types/auth";
import type { Gender } from "../constants/genderOptions";
import type {
  StaffRegistrationRole,
  StaffTitle,
} from "../../staff/constants/staffOptions";

export type RegisterStudentRequest = {
  email: string;
  password: string;
  matricNumber: string;
  firstName: string;
  lastName: string;
  otherName?: string;
  gender: Gender;
  dateOfBirth: string;
  phoneNumber: string;
  profileImageUrl: string;
  programmeId: string;
  level: number;
  admissionYear: number;
};

export type RegisterStaffRequest = {
  email: string;
  password: string;
  staffNumber: string;
  title: StaffTitle;
  firstName: string;
  lastName: string;
  otherName?: string;
  profileImageUrl: string;
  role: StaffRegistrationRole;
  faculty?: string;
  department?: string;
  phoneNumber: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export async function loginUser(payload: LoginRequest) {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function registerStudent(payload: RegisterStudentRequest) {
  const response = await apiClient.post("/auth/register-student", payload);
  return response.data;
}

export async function registerStaff(payload: RegisterStaffRequest) {
  const response = await apiClient.post("/auth/register-staff", payload);
  return response.data;
}
