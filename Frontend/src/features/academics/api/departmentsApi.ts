import { apiClient } from "../../../lib/api/apiClient";
import type { Faculty } from "./facultiesApi";

export type Department = {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  faculty?: Faculty;
  createdAt?: string;
  updatedAt?: string;
};

export type DepartmentQueryParams = {
  facultyId?: string;
};

export type CreateDepartmentRequest = {
  name: string;
  code: string;
  facultyId: string;
};

export type UpdateDepartmentRequest = {
  name?: string;
  code?: string;
  facultyId?: string;
};

export async function getDepartments(params?: DepartmentQueryParams) {
  const response = await apiClient.get<Department[]>("/departments", {
    params,
  });
  return response.data;
}

export async function getAdminDepartments() {
  const response = await apiClient.get<Department[]>("/departments/my-faculty");
  return response.data;
}

export async function createDepartment(payload: CreateDepartmentRequest) {
  const response = await apiClient.post<Department>("/departments", payload);
  return response.data;
}

export async function updateDepartment(
  id: string,
  payload: UpdateDepartmentRequest,
) {
  const response = await apiClient.patch<Department>(
    `/departments/${id}`,
    payload,
  );

  return response.data;
}

export async function deleteDepartment(id: string) {
  const response = await apiClient.delete<Department>(`/departments/${id}`);
  return response.data;
}
