import { apiClient } from "../../../lib/api/apiClient";
import type { AcademicSemester } from "../../academics/api/academicSessionsApi";
import type { Programme } from "../../academics/api/programmeApi";
import type { StaffProfile } from "../../staff/api/staffApi";
import type { Course } from "../../courses/api/coursesApi";

export type CourseRegistrationType = "NORMAL" | "CARRYOVER" | "SPILLOVER";
export type RegistrationStatus = "DRAFT" | "SUBMITTED";
export type CourseRegistrationScope =
  | "UNIVERSITY"
  | "FACULTY"
  | "DEPARTMENT"
  | "PROGRAMME";

export type AvailableCourseOffering = {
  id: string;
  level: number;
  registrationOpen: boolean;
  course: Course;
  programme: Programme;
  scope: CourseRegistrationScope;
  academicSemester: AcademicSemester;
  lecturer?: StaffProfile | null;
  registrations: {
    id: string;
    status: RegistrationStatus;
  }[];
};

export type MyRegistrationSummary = {
  academicSemester: {
    id: string;
    semester: string;
    academicSession: {
      id: string;
      name: string;
    };
  };

  registrationStatus: RegistrationStatus | null;
  hasSubmittedRegistration: boolean;
  hasDraftRegistration: boolean;
  canRegister: boolean;

  minimumUnits: number;
  maximumUnits: number;
  totalCreditUnits: number;
  totalGpaUnits: number;
  totalCourses: number;

  courses: MyRegisteredCourse[];
};

export type MyRegisteredCourse = {
  registrationId: string;
  courseOfferingId: string;

  courseCode: string;
  courseTitle: string;
  level: number;
  creditUnit: number;
  gpaCreditUnit: number;

  registrationType: CourseRegistrationType;
  status: RegistrationStatus;
  registeredAt: string;
  submittedAt: string | null;
  scope: CourseRegistrationScope;

  caScore: number | null;
  examScore: number | null;
  totalScore: number | null;
  grade: string | null;
  gradePoint: number | null;

  programme: {
    id: string;
    name: string;
  };

  lecturer: {
    id: string;
    title: string | null;
    firstName: string;
    lastName: string;
  } | null;
};

export type DraftRegistrationCourse = {
  registrationId: string;
  courseOfferingId: string;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  gpaCreditUnit: number;
  registrationType: CourseRegistrationType;
  scope: CourseRegistrationScope;
  status: RegistrationStatus;
};

export type DraftRegistrationSummary = {
  academicSemesterId: string;
  minimumUnits: number;
  maximumUnits: number;
  registeredUnits: number;
  gpaUnits: number;
  canSubmit: boolean;
  message: string;
  courses: DraftRegistrationCourse[];
};

export async function getAvailableCourses() {
  const response = await apiClient.get<AvailableCourseOffering[]>(
    "/course-registrations/available",
  );
  return response.data;
}

export async function getMyRegistration() {
  const response = await apiClient.get<MyRegistrationSummary>(
    "/course-registrations/me",
  );

  return response.data;
}

export async function getDraftRegistrationSummary() {
  const response = await apiClient.get<DraftRegistrationSummary>(
    "/course-registrations/draft-summary",
  );
  return response.data;
}

export async function registerCourse(courseOfferingId: string) {
  const response = await apiClient.post("/course-registrations", {
    courseOfferingId,
  });
  return response.data;
}

export async function removeDraftRegistration(registrationId: string) {
  const response = await apiClient.delete(
    `/course-registrations/${registrationId}`,
  );
  return response.data;
}

export async function submitCourseRegistration() {
  const response = await apiClient.post("/course-registrations/submit");
  return response.data;
}
