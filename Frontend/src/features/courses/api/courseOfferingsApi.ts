import { apiClient } from "../../../lib/api/apiClient";
import type { AcademicSemester } from "../../academics/api/academicSessionsApi";
import type { AcademicCategory } from "../../academics/api/academicCategoriesApi";
import type { Faculty } from "../../academics/api/facultiesApi";
import type { Department } from "../../academics/api/departmentsApi";
import type { Programme } from "../../academics/api/programmeApi";
import type { StaffProfile } from "../../staff/api/staffApi";
import type { Course } from "./coursesApi";

export type CourseOfferingScope =
  | "UNIVERSITY"
  | "ACADEMIC_CATEGORY"
  | "FACULTY"
  | "DEPARTMENT"
  | "PROGRAMME";

export type CourseOfferingAudience = {
  id: string;
  academicCategoryId: string | null;
  facultyId: string | null;
  departmentId: string | null;
  programmeId: string | null;

  academicCategory?: AcademicCategory | null;
  faculty?: Faculty | null;
  department?: Department | null;
  programme?: Programme | null;
};

export type CourseOffering = {
  id: string;
  courseId: string;
  academicSemesterId: string;
  lecturerId?: string | null;

  scope: CourseOfferingScope;
  audiences: CourseOfferingAudience[];

  level: number;
  registrationOpen: boolean;

  course?: Course;
  academicSemester?: AcademicSemester;
  lecturer?: StaffProfile | null;
};

export type CreateCourseOfferingRequest = {
  courseId: string;
  academicSemesterId: string;
  scope: CourseOfferingScope;
  audienceIds?: string[];
  lecturerId?: string;
  level: number;
  registrationOpen?: boolean;
};

export type UpdateCourseOfferingRequest = Partial<CreateCourseOfferingRequest>;

export async function getCourseOfferings() {
  const response = await apiClient.get<CourseOffering[]>("/course-offerings");
  return response.data;
}

export async function createCourseOffering(
  payload: CreateCourseOfferingRequest,
) {
  const response = await apiClient.post<CourseOffering>(
    "/course-offerings",
    payload,
  );
  return response.data;
}

export async function updateCourseOffering(
  id: string,
  payload: UpdateCourseOfferingRequest,
) {
  const response = await apiClient.patch<CourseOffering>(
    `/course-offerings/${id}`,
    payload,
  );

  return response.data;
}

export async function deleteCourseOffering(id: string) {
  const response = await apiClient.delete<CourseOffering>(
    `/course-offerings/${id}`,
  );

  return response.data;
}
