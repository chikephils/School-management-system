import {
  Building2,
  Building,
  CalendarDays,
  GraduationCap,
  Layers,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import Card from "../../../components/ui/Card";
import type { AcademicSetupItem } from "../types/academics";

const academicSetupItems: AcademicSetupItem[] = [
  {
    title: "Academic Category",
    description: "Create and manage academic categories.",
    path: "/academics/categories",
    icon: Building,
  },
  {
    title: "Faculties",
    description: "Create and manage university faculties.",
    path: "/academics/faculties",
    icon: School,
  },
  {
    title: "Departments",
    description: "Organize departments under faculties.",
    path: "/academics/departments",
    icon: Building2,
  },
  {
    title: "Programmes",
    description: "Manage programmes students can be admitted into.",
    path: "/academics/programmes",
    icon: GraduationCap,
  },
  {
    title: "Academic Sessions",
    description: "Set academic years like 2024/2025.",
    path: "/academics/sessions",
    icon: CalendarDays,
  },
  {
    title: "Semesters",
    description: "Create semesters under academic sessions.",
    path: "/academics/semesters",
    icon: Layers,
  },
];

function AcademicsPage() {
  return (
    <section>
      <PageHeader
        title="Academics"
        description="Manage faculties, departments, programmes, sessions, and semesters."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {academicSetupItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path}>
              <Card className=" flex-h-full min-h-32 transition hover:border-blue-200 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="rounded-md bg-blue-50 p-2 text-blue-700">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default AcademicsPage;
