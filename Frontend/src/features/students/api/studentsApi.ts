import { apiClient } from "../../../lib/api/apiClient";
import type { Programme } from "../../academics/api/programmeApi";

export type StudentProfile = {
  id: string;
  matricNumber: string;
  firstName: string;
  otherName?: string | null;
  lastName: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  dateOfBirth: string;
  profileImageUrl?: string | null;
  user: {
    id: string;
    email: string;
  };
  faculty: string;
  academicCategoryId?: string | null;
  facultyId?: string | null;
  department: string;
  departmentId?: string | null;
  programme: string;
  programmeId?: string | null;
  programmeRecord?: Programme | null;
  level: number;
  admissionYear: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StudentQueryParams = {
  academicCategoryId?: string;
  facultyId?: string;
  departmentId?: string;
  programmeId?: string;
  level?: number;
};

export type UpdateStudentRequest = {
  matricNumber?: string;
  firstName?: string;
  lastName?: string;
  otherName?: string | null;
  gender?: "MALE" | "FEMALE";
  dateOfBirth?: string;
  phoneNumber?: string;
  programmeId?: string;
  level?: number;
  admissionYear?: number;
};

export async function getStudents(params?: StudentQueryParams) {
  const response = await apiClient.get<StudentProfile[]>("/students", {
    params,
  });
  return response.data;
}

export async function getStudentById(studentProfileId: string) {
  const response = await apiClient.get<StudentProfile>(
    `/students/${studentProfileId}`,
  );
  return response.data;
}

export async function updateStudent(id: string, payload: UpdateStudentRequest) {
  const response = await apiClient.patch<StudentProfile>(
    `/students/${id}`,
    payload,
  );
  return response.data;
}
