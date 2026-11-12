import { apiClient } from "../../../lib/api/apiClient";
import type { SemesterType } from "../schemas/academicSemesterSchema";

export type AcademicSession = {
  id: string;
  name: string;
  isCurrent: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAcademicSessionRequest = {
  name: string;
  startsAt?: string;
  endsAt?: string;
  isCurrent?: boolean;
};
export type UpdateAcademicSessionRequest = {
  name: string;
  startsAt?: string;
  endsAt?: string;
  isCurrent?: boolean;
};

export async function getAcademicSessions() {
  const response = await apiClient.get<AcademicSession[]>("/academic-sessions");
  return response.data;
}

export async function createAcademicSession(
  payload: CreateAcademicSessionRequest,
) {
  const response = await apiClient.post<AcademicSession>(
    "/academic-sessions",
    payload,
  );
  return response.data;
}

export async function updateAcademicSession(
  id: string,
  payload: UpdateAcademicSessionRequest,
) {
  const response = await apiClient.patch<AcademicSession>(
    `/academic-sessions/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteAcademicSession(id: string) {
  const response = await apiClient.delete<AcademicSession>(
    `/academic-sessions/${id}`,
  );
  return response.data;
}

export type AcademicSemester = {
  id: string;
  academicSessionId: string;
  type: SemesterType;
  isCurrent: boolean;
  registrationOpen: boolean;
  academicSession?: AcademicSession;
  createdAt?: string;
  updatedAt: string;
};

export type CreateAcademicSemesterRequest = {
  academicSessionId: string;
  type: SemesterType;
  isCurrent?: boolean;
  registrationOpen?: boolean;
};

export type UpdateAcademicSemesterRequest = {
  academicSessionId: string;
  type: SemesterType;
  isCurrent?: boolean;
  registrationOpen?: boolean;
};

export async function getAcademicSemesters() {
  const response = await apiClient.get<AcademicSemester[]>(
    "academic-sessions/semesters",
  );
  return response.data;
}

export async function createAcademicSemester(
  payload: CreateAcademicSemesterRequest,
) {
  const response = await apiClient.post<AcademicSemester>(
    "/academic-sessions/semester",
    payload,
  );
  return response.data;
}

export async function updateAcademicSemester(
  id: string,
  payload: UpdateAcademicSemesterRequest,
) {
  const response = await apiClient.patch<AcademicSemester>(
    `/academic-sessions/semester/${id}`,
    payload,
  );
  return response.data;
}
