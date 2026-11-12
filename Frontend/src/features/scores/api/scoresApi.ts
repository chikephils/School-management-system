import { apiClient } from "../../../lib/api/apiClient";
import type { CourseOffering } from "../../courses/api/courseOfferingsApi";
import type { CourseGrade } from "../../results/api/resultsApi";

export type RegisteredStudentScore = {
  id: string;
  studentProfile: {
    id: string;
    matricNumber: string;
    firstName: string;
    otherName?: string;
    lastName: string;
    level: number;
    programme: string;
  };
  courseOffering: CourseOffering;
  caScore: number | null;
  examScore: number | null;
  totalScore: number | null;
  grade: CourseGrade | null;
  gradePoint: number | null;
};

export type UpdateScoreRequest = {
  caScore: number;
  examScore: number;
};

export async function getRegisteredStudentsForOffering(
  courseOfferingId: string,
) {
  const response = await apiClient.get<RegisteredStudentScore[]>(
    `/scores/course-offerings/${courseOfferingId}/students`,
  );
  return response.data;
}

export async function updateRegistrationScore(
  registrationId: string,
  payload: UpdateScoreRequest,
) {
  const response = await apiClient.patch<RegisteredStudentScore>(
    `/scores/registrations/${registrationId}`,
    payload,
  );
  return response.data;
}
