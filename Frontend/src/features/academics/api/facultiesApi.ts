import { apiClient } from "../../../lib/api/apiClient";
import type { AcademicCategory } from "./academicCategoriesApi";

export type Faculty = {
  id: string;
  name: string;
  code: string;
  academicCategoryId: string;
  academicCategory?: AcademicCategory;
  createdAt?: string;
  updatedAt?: string;
};

export type FacultyQueryParams = {
  academicCategoryId?: string;
};

export type CreateFacultyRequest = {
  name: string;
  code: string;
  academicCategoryId: string;
};

export type UpdateFacultyRequest = {
  name?: string;
  code?: string;
  academicCategoryId?: string;
};

export async function getFaculties(params?: FacultyQueryParams) {
  const response = await apiClient.get<Faculty[]>("/faculties", {
    params,
  });

  return response.data;
}

export async function createFaculty(payload: CreateFacultyRequest) {
  const response = await apiClient.post<Faculty>("/faculties", payload);
  return response.data;
}

export async function updateFaculty(id: string, payload: UpdateFacultyRequest) {
  const response = await apiClient.patch<Faculty>(`/faculties/${id}`, payload);

  return response.data;
}

export async function deleteFaculty(id: string) {
  const response = await apiClient.delete<Faculty>(`/faculties/${id}`);
  return response.data;
}
