import { apiClient } from "../../../lib/api/apiClient";
import type { ProgrammeAward } from "../schemas/programmeSchema";
import type { Department } from "./departmentsApi";

export type Programme = {
  id: string;
  name: string;
  code: string;
  award: ProgrammeAward;
  durationYears: number;
  departmentId: string;
  department?: Department;
  createdAt?: string;
  updatedAt?: string;
};

export type ProgrammeQueryParams = {
  departmentId?: string;
};

export type CreateProgrammeRequest = {
  name: string;
  code: string;
  award: ProgrammeAward;
  durationYears: number;
  departmentId: string;
};

export type UpdateProgrammeRequest = {
  name?: string;
  code?: string;
  award?: ProgrammeAward;
  durationYears?: number;
  departmentId?: string;
};

export async function getProgrammes(params?: ProgrammeQueryParams) {
  const response = await apiClient.get<Programme[]>("/programmes", { params });
  return response.data;
}

export async function createProgramme(payload: CreateProgrammeRequest) {
  const response = await apiClient.post<Programme>("/programmes", payload);
  return response.data;
}

export async function updateProgramme(
  id: string,
  payload: UpdateProgrammeRequest,
) {
  const response = await apiClient.patch<Programme>(
    `/programmes/${id}`,
    payload,
  );

  return response.data;
}

export async function deleteProgramme(id: string) {
  const response = await apiClient.delete<Programme>(`/programmes/${id}`);
  return response.data;
}
