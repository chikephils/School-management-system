import { apiClient } from "../../../lib/api/apiClient";

export type AcademicCategory = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAcademicCategoryRequest = {
  name: string;
  code: string;
  description?: string;
};

export type UpdateAcademicCategoryRequest = {
  name?: string;
  code?: string;
  description?: string;
};

export async function getAcademicCategories() {
  const response = await apiClient.get<AcademicCategory[]>(
    "/academic-categories",
  );

  return response.data;
}

export async function createAcademicCategory(
  payload: CreateAcademicCategoryRequest,
) {
  const response = await apiClient.post<AcademicCategory>(
    "/academic-categories",
    payload,
  );

  return response.data;
}

export async function updateAcademicCategory(
  id: string,
  payload: UpdateAcademicCategoryRequest,
) {
  const response = await apiClient.patch<AcademicCategory>(
    `/academic-categories/${id}`,
    payload,
  );

  return response.data;
}

export async function deleteAcademicCategory(id: string) {
  const response = await apiClient.delete<AcademicCategory>(
    `/academic-categories/${id}`,
  );

  return response.data;
}
