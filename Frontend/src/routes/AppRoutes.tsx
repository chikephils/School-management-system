import { Route, Routes } from "react-router-dom";
import {
  academicManagerRoles,
  allRoles,
  resultViewerRoles,
  scoreUpdateRoles,
  studentOnlyRoles,
  superAdminRoles,
} from "../app/permissions";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import AppLayout from "../components/Layout/AppLayout";
import StudentsPage from "../features/students/pages/StudentsPage";
import StaffPage from "../features/staff/pages/StaffPage";
import AcademicsPage from "../features/academics/pages/AcademicsPage";
import CoursesPage from "../features/courses/pages/CoursesPage";
import CourseRegistrationPage from "../features/course-registration/pages/CourseRegistrationPage";
import ResultsPage from "../features/results/pages/ResultsPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import FacultiesPage from "../features/academics/pages/FacultiesPage";
import DepartmentsPage from "../features/academics/pages/DepartmentsPage";
import ProgrammesPage from "../features/academics/pages/ProgrammesPage";
import AcademicSessionsPage from "../features/academics/pages/AcademicSessionsPage";
import AcademicSemestersPage from "../features/academics/pages/AcademicSemestersPage";
import CourseOfferingsPage from "../features/courses/pages/CourseOfferingsPage";
import ScoresPage from "../features/scores/pages/ScoresPage";
import RegisterStudentPage from "../features/auth/pages/RegisterStudentPage";
import RegisterStaffPage from "../features/auth/pages/RegisterStaff";
import NotFoundPage from "./NotFoundPage";
import StudentDetailsPage from "../features/students/pages/StudentDetailsPage";
import AcademicCategoriesPage from "../features/academics/pages/AcademicCategoriesPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register-student" element={<RegisterStudentPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            element={<RoleProtectedRoute allowedRoles={superAdminRoles} />}
          >
            <Route path="/academics" element={<AcademicsPage />} />
            <Route
              path="/academics/categories"
              element={<AcademicCategoriesPage />}
            />
            <Route path="/academics/faculties" element={<FacultiesPage />} />
            <Route
              path="/academics/departments"
              element={<DepartmentsPage />}
            />
            <Route path="/academics/programmes" element={<ProgrammesPage />} />
            <Route
              path="/academics/sessions"
              element={<AcademicSessionsPage />}
            />
            <Route
              path="/academics/semesters"
              element={<AcademicSemestersPage />}
            />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/staff/register" element={<RegisterStaffPage />} />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={academicManagerRoles} />}
          >
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course-offerings" element={<CourseOfferingsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route
              path="/students/:studentId"
              element={<StudentDetailsPage />}
            />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={scoreUpdateRoles} />}
          >
            <Route path="/scores" element={<ScoresPage />} />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={allRoles} />}
          ></Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={studentOnlyRoles} />}
          >
            <Route
              path="/course-registration"
              element={<CourseRegistrationPage />}
            />
          </Route>

          <Route
            element={<RoleProtectedRoute allowedRoles={resultViewerRoles} />}
          >
            <Route path="/results" element={<ResultsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
