import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  School,
  Users,
} from "lucide-react";
import type { UserRole } from "../types/auth";
import {
  academicManagerRoles,
  resultViewerRoles,
  studentOnlyRoles,
  allRoles,
  superAdminRoles,
  scoreUpdateRoles,
} from "./permissions";

export type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: UserRole[];
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashbord",
    path: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: allRoles,
  },
  {
    label: "Students",
    path: "/students",
    icon: GraduationCap,
    allowedRoles: academicManagerRoles,
  },
  {
    label: "Staff",
    path: "/staff",
    icon: Users,
    allowedRoles: superAdminRoles,
  },
  {
    label: "Academics",
    path: "/academics",
    icon: School,
    allowedRoles: superAdminRoles,
  },
  {
    label: "Courses",
    path: "/courses",
    icon: BookOpen,
    allowedRoles: academicManagerRoles,
  },
  {
    label: "Offerings",
    path: "/course-offerings",
    icon: ClipboardList,
    allowedRoles: academicManagerRoles,
  },
  {
    label: "Registration",
    path: "/course-registration",
    icon: ClipboardList,
    allowedRoles: studentOnlyRoles,
  },
  {
    label: "Scores",
    path: "/scores",
    icon: ClipboardList,
    allowedRoles: scoreUpdateRoles,
  },
  {
    label: "Results",
    path: "/results",
    icon: FileText,
    allowedRoles: resultViewerRoles,
  },
];
