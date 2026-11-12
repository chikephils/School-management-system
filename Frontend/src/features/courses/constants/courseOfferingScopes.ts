import type {
  CourseOffering,
  CourseOfferingScope,
} from "../api/courseOfferingsApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import { formatProgrammeName } from "../../academics/constants/programmeAwards";

export const courseOfferingScopes: CourseOfferingScope[] = [
  "UNIVERSITY",
  "ACADEMIC_CATEGORY",
  "FACULTY",
  "DEPARTMENT",
  "PROGRAMME",
];

export const courseOfferingScopeLabels: Record<CourseOfferingScope, string> = {
  ACADEMIC_CATEGORY: "Academic Category-wide",
  UNIVERSITY: "University-wide",
  FACULTY: "Faculty-wide",
  DEPARTMENT: "Department-wide",
  PROGRAMME: "Programme-specific",
};

export function formatCourseOfferingTarget(
  offering: Pick<CourseOffering, "scope" | "audiences">,
): string {
  if (offering.scope === "UNIVERSITY") return "All students";

  const targets = offering.audiences.map((audience) => {
    switch (offering.scope) {
      case "ACADEMIC_CATEGORY":
        return audience.academicCategory?.name ?? "Unknown category";
      case "FACULTY":
        return audience.faculty?.name
          ? formatFacultyName(audience.faculty.name)
          : "Unknown faculty";

      case "DEPARTMENT":
        return audience.department?.name
          ? formatDepartmentName(audience.department.name)
          : "Unknown faculty";

      case "PROGRAMME":
        return audience.programme
          ? formatProgrammeName(
              audience.programme.name,
              audience.programme.award,
            )
          : "Unknown programme";
      default:
        return "";
    }
  });
  return targets.length > 0 ? targets.join(", ") : "No Target assigned";
}
