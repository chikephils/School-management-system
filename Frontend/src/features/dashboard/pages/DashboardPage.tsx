import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  School,
} from "lucide-react";
import { useAppSelector } from "../../../app/store/hooks";
import PageHeader from "../../../components/common/PageHeader";
import Card from "../../../components/ui/Card";
import type { UserRole } from "../../../types/auth";
import DashboardMetricCard from "../components/DashboardMetricCard";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../../students/api/studentsApi";
import { getCourses } from "../../courses/api/coursesApi";
import { getCourseOfferings } from "../../courses/api/courseOfferingsApi";
import {
  getAdminDepartments,
  getDepartments,
} from "../../academics/api/departmentsApi";
import { getFaculties } from "../../academics/api/facultiesApi";
import { getMyCourseOfferings } from "../../staff/api/staffApi";
import {
  getAvailableCourses,
  getMyRegistration,
  type MyRegistrationSummary,
} from "../../course-registration/api/courseRegistrationApi";

import type { LucideIcon } from "lucide-react";

type DashboardMetric = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "emerald" | "amber" | "rose";
};

function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  const role = user?.role;

  const isAcademicManager =
    role === "SUPER_ADMIN" || role === "ADMIN" || role === "DEPARTMENT_ADMIN";

  const isSuperAdmin = role === "SUPER_ADMIN";
  const isFacultyAdmin = role === "ADMIN";
  const isLecturer = role === "LECTURER";
  const isStudent = role === "STUDENT";

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents(),
    enabled: isAcademicManager,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    enabled: isAcademicManager,
  });

  const { data: offerings = [] } = useQuery({
    queryKey: ["course-offerings"],
    queryFn: getCourseOfferings,
    enabled: isAcademicManager,
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => getFaculties(),
    enabled: isSuperAdmin,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    enabled: isSuperAdmin,
  });

  const { data: adminDepartments = [] } = useQuery({
    queryKey: ["departments", "my-faculty"],
    queryFn: () => getAdminDepartments(),
    enabled: isFacultyAdmin,
  });

  const { data: lecturerCourses = [] } = useQuery({
    queryKey: ["staff", "me", "course-offerings"],
    queryFn: getMyCourseOfferings,
    enabled: isLecturer,
  });

  const { data: registrationSummary } = useQuery<MyRegistrationSummary>({
    queryKey: ["my-registration"],
    queryFn: getMyRegistration,
    enabled: isStudent,
  });

  const { data: availableCourses = [] } = useQuery({
    queryKey: ["available-course-offerings"],
    queryFn: getAvailableCourses,
    enabled: isStudent,
  });

  if (!user) {
    return null;
  }

  const assignedCoursesCount = lecturerCourses.length;

  const openAssignedCoursesCount = lecturerCourses.filter(
    (offering) => offering.registrationOpen,
  ).length;

  console.log(registrationSummary);

  const registeredCoursesCount = registrationSummary?.courses?.length ?? 0;
  const registeredUnitsCount = registrationSummary?.totalCreditUnits ?? 0;

  const metricsByRole: Record<UserRole, DashboardMetric[]> = {
    SUPER_ADMIN: [
      {
        title: "Students",
        value: students.length,
        description: "Registered student profiles",
        icon: GraduationCap,
        tone: "blue",
      },
      {
        title: "Faculties",
        value: faculties.length,
        description: "Accredited Faculties",
        icon: BookOpen,
        tone: "amber",
      },
      {
        title: "Departments",
        value: departments.length,
        description: "Accredited Departments",
        icon: ClipboardList,
        tone: "emerald",
      },
    ],

    ADMIN: [
      {
        title: "Students",
        value: students.length,
        description: "Student records in your faculty",
        icon: GraduationCap,
        tone: "blue",
      },
      {
        title: "Departments",
        value: adminDepartments.length,
        description: "Faculty departments",
        icon: School,
        tone: "emerald",
      },
      {
        title: "Courses",
        value: courses.length,
        description: "Faculty course records",
        icon: BookOpen,
        tone: "amber",
      },
    ],

    DEPARTMENT_ADMIN: [
      {
        title: "Students",
        value: students.length,
        description: "Department students",
        icon: GraduationCap,
        tone: "blue",
      },
      {
        title: "Courses",
        value: courses.length,
        description: "Department courses",
        icon: BookOpen,
        tone: "emerald",
      },
      {
        title: "Offerings",
        value: offerings.length,
        description: "Department course offerings",
        icon: ClipboardList,
        tone: "amber",
      },
    ],

    LECTURER: [
      {
        title: "Assigned Courses",
        value: assignedCoursesCount,
        description: "Courses assigned this semester",
        icon: BookOpen,
        tone: "blue",
      },
      {
        title: "Open Offerings",
        value: openAssignedCoursesCount,
        description: "Assigned courses open for registration",
        icon: ClipboardList,
        tone: "amber",
      },
      {
        title: "Score Uploads",
        value: assignedCoursesCount,
        description: "Course score sheets available",
        icon: FileText,
        tone: "emerald",
      },
    ],

    STUDENT: [
      {
        title: "Registered Courses",
        value: registeredCoursesCount,
        description: "Courses selected this semester",
        icon: ClipboardList,
        tone: "blue",
      },
      {
        title: "Total Units",
        value: registeredUnitsCount,
        description: "Total registered units",
        icon: FileText,
        tone: "emerald",
      },
      {
        title: "Available Courses",
        value: availableCourses.length,
        description: "Courses open for registration",
        icon: BookOpen,
        tone: "amber",
      },
    ],
  };

  const metrics = metricsByRole[user?.role];

  return (
    <section>
      <PageHeader
        title="Dashboard"
        description="Overview of your school management workspace."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-slate=950">
            Recent Activity
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Activity from course registration, score uploads, and result
            publishing will appear here.
          </p>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-950">
            Quick Actions
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Shortcuts will appear here based on the logged-in user role.
          </p>
        </Card>
      </div>
    </section>
  );
}

export default DashboardPage;
