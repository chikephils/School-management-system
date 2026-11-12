import type { CourseGrade } from "../api/resultsApi";

type GradeBadgeProps = {
  grade: CourseGrade | null;
};

const gradeClasses: Record<CourseGrade, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  E: "bg-rose-100 text-rose-700",
  F: "bg-red-100 text-red-700",
};

function GradeBadge({ grade }: GradeBadgeProps) {
  if (!grade) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-xs font-semibold text-slate-600">
        -
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${gradeClasses[grade]}`}
    >
      {grade}
    </span>
  );
}

export default GradeBadge;
