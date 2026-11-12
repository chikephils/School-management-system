import { apiClient } from "../../../lib/api/apiClient";
import type { Department } from "../../academics/api/departmentsApi";
import type { CourseCategory } from "../constants/coursesCategories";

export type Course = {
  id: string;
  departmentId: string;
  code: string;
  title: string;
  creditUnit: number;
  level: number;
  category: CourseCategory;
  department?: Department;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCourseRequest = {
  departmentId: string;
  code: string;
  title: string;
  creditUnit: number;
  level: number;
  category: CourseCategory;
};

export type UpdateCourseRequest = {
  departmentId?: string;
  code?: string;
  title?: string;
  creditUnit?: number;
  level?: number;
  category?: CourseCategory;
};

export async function getCourses() {
  const response = await apiClient.get<Course[]>("/courses");
  return response.data;
}

export async function createCourse(payload: CreateCourseRequest) {
  const response = await apiClient.post<Course>("/courses", payload);
  return response.data;
}

export async function updateCourse(id: string, payload: UpdateCourseRequest) {
  const response = await apiClient.patch<Course>(`/courses/${id}`, payload);
  return response.data;
}

export async function deleteCourse(id: string) {
  const response = await apiClient.delete<Course>(`/courses/${id}`);
  return response.data;
}
