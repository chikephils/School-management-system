import { apiClient } from "../../../lib/api/apiClient";
import type { CourseRegistrationType } from "../../course-registration/api/courseRegistrationApi";

export type CourseGrade = "A" | "B" | "C" | "D" | "E" | "F";

export type SemesterResultCourse = {
  registrationId: string;
  courseCode: string;
  courseTitle: string;
  creditUnit: number;
  gpaCreditUnit: number;
  registrationType: CourseRegistrationType;
  caScore: number | null;
  examScore: number | null;
  totalScore: number | null;
  grade: CourseGrade | null;
  gradePoint: number | null;
  qualityPoint: number | null;
};

export type ResultStudent = {
  id: string;
  matricNumber: string;
  firstName: string;
  otherName?: string | null;
  lastName: string;
  level: number;
  programme: string;
};

export type SemesterResult = {
  student: ResultStudent;
  academicSemesterId: string;
  totalRegisteredUnits: number;
  totalGpaUnits: number;
  totalQualityPoints: number;
  gpa: number | null;
  courses: SemesterResultCourse[];
};

export type CgpaResult = {
  student: ResultStudent;
  totalGpaUnits: number;
  totalQualityPoints: number;
  cgpa: number | null;
};

export async function getMySemesterResult(academicSemesterId?: string) {
  const response = await apiClient.get<SemesterResult>("/results/me", {
    params: {
      academicSemesterId,
    },
  });

  return response.data;
}

export async function getMyCgpa() {
  const response = await apiClient.get<CgpaResult>("/results/me/cgpa");
  return response.data;
}

export async function getStudentSemesterResult(
  studentProfileId: string,
  academicSemesterId?: string,
) {
  const response = await apiClient.get<SemesterResult>(
    `/results/students/${studentProfileId}`,
    {
      params: {
        academicSemesterId,
      },
    },
  );

  return response.data;
}

export async function getStudentCgpa(studentProfileId: string) {
  const response = await apiClient.get<CgpaResult>(
    `/results/students/${studentProfileId}/cgpa`,
  );
  return response.data;
}
