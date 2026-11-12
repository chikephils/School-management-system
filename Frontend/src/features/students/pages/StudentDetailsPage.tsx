import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import PageHeader from "../../../components/common/PageHeader";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  getStudentCgpa,
  getStudentSemesterResult,
} from "../../results/api/resultsApi";
import { getStudentById } from "../api/studentsApi";
import { formatProgrammeName } from "../../academics/constants/programmeAwards";
import { getAcademicSemesters } from "../../academics/api/academicSessionsApi";
import GradeBadge from "../../results/components/GradeBadge";

function formatName(
  firstName?: string,
  otherName?: string | null,
  lastName?: string,
) {
  return [firstName, otherName, lastName].filter(Boolean).join(" ");
}

export default function StudentDetailsPage() {
  const [academicSemesterId, setAcademicSemesterId] = useState("");
  const { studentId } = useParams<{ studentId: string }>();
  const studentProfileId = studentId ?? "";
  const pageRef = useRef<HTMLDivElement | null>(null);

  const scrollToForm = () => {
    const formTop = pageRef.current?.getBoundingClientRect().top ?? 0;
    const scrollTop = window.scrollY + formTop - 96;

    window.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  };

  const { data: semesters = [] } = useQuery({
    queryKey: ["academic-semesters"],
    queryFn: getAcademicSemesters,
  });

  const {
    data: student,
    isLoading: isLoadingStudent,
    error: studentError,
  } = useQuery({
    queryKey: ["student", studentProfileId],
    queryFn: () => getStudentById(studentProfileId),
    enabled: Boolean(studentProfileId),
  });

  const {
    data: semesterResult,
    isLoading: isLoadingResult,
    error: resultError,
  } = useQuery({
    queryKey: ["student-semester-result", studentProfileId, academicSemesterId],
    queryFn: () =>
      getStudentSemesterResult(
        studentProfileId,
        academicSemesterId || undefined,
      ),
    enabled: Boolean(studentProfileId),
  });

  const { data: cgpaResult, isLoading: isLoadingCgpa } = useQuery({
    queryKey: ["student-cgpa", studentProfileId],
    queryFn: () => getStudentCgpa(studentProfileId),
    enabled: Boolean(studentProfileId),
  });

  const error = studentError ?? resultError;

  useEffect(() => {
    scrollToForm();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Details"
        description="View student profile, semester result and CGPA"
        action={
          <Link to="/students">
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </Link>
        }
      />

      <div ref={pageRef}>
        {error ? (
          <Card>
            <p className="text-sm text-red-600">{getApiErrorMessage(error)}</p>
          </Card>
        ) : null}

        <Card>
          {isLoadingStudent ? (
            <p className="text-sm text-slate-500">
              {" "}
              Loading student profile...
            </p>
          ) : student ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Student Name
                </p>
                <p className="mt-1 font-semibold text-slate-500">
                  {formatName(
                    student.firstName,
                    student.otherName,
                    student.lastName,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Matric Number
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {student.matricNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Level
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {student.level}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Faculty
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {student.faculty}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Department
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {student.department}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">
                  Programme
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {student.programmeRecord
                    ? formatProgrammeName(
                        student.programmeRecord.name,
                        student.programmeRecord.award,
                      )
                    : student.programme}
                </p>
              </div>
            </div>
          ) : null}
        </Card>
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Academic standing
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {isLoadingCgpa
                  ? "Loading..."
                  : `CGPA ${cgpaResult?.cgpa ?? "-"}`}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">
                  GPA
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {isLoadingResult ? "..." : (semesterResult?.gpa ?? "-")}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Units
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {isLoadingResult
                    ? "..."
                    : (semesterResult?.totalRegisteredUnits ?? "-")}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">
                  GPA Units
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {isLoadingResult
                    ? "..."
                    : (semesterResult?.totalGpaUnits ?? "-")}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Quality Points
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {isLoadingResult
                    ? "..."
                    : (semesterResult?.totalQualityPoints ?? "-")}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="max-w-md">
            <Select
              label="Academic semester"
              value={academicSemesterId}
              onChange={(event) => setAcademicSemesterId(event.target.value)}
            >
              <option value="">Current academic semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.academicSession?.name} - {semester.type}
                </option>
              ))}
            </Select>
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-xs font-medium uppercase text-slate-500">GPA</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoadingResult ? "..." : (semesterResult?.gpa ?? "-")}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-medium uppercase text-slate-500">CGPA</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoadingCgpa ? "..." : (cgpaResult?.cgpa ?? "-")}
            </p>
          </Card>

          <Card>
            <p className="text-xs font-medium uppercase text-slate-500">
              Registered Units
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoadingResult
                ? "..."
                : (semesterResult?.totalRegisteredUnits ?? "-")}
            </p>
          </Card>
          <Card>
            <p className="text-xs font-medium uppercase text-slate-500">
              GPA Units
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {isLoadingResult ? "..." : (semesterResult?.totalGpaUnits ?? "-")}
            </p>
          </Card>
        </div>
        <Card>
          <h2 className="text-base font-semibold text-slate-900">
            Semester Courses
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 pr-4">Code</th>
                  <th className="py-3 pr-4">Course</th>
                  <th className="py-3 pr-4">Unit</th>
                  <th className="py-3 pr-4">CA</th>
                  <th className="py-3 pr-4">Exam</th>
                  <th className="py-3 pr-4">Total</th>
                  <th className="py-3 pr-4">Grade</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {semesterResult?.courses?.length ? (
                  semesterResult.courses.map((course) => (
                    <tr key={course.registrationId}>
                      <td className="py-3 pr-4 font-medium">
                        {course.courseCode}
                      </td>
                      <td className="py-3 pr-4">{course.courseTitle}</td>
                      <td className="py-3 pr-4">{course.creditUnit}</td>
                      <td className="py-3 pr-4">{course.caScore ?? "-"}</td>
                      <td className="py-3 pr-4">{course.examScore ?? "-"}</td>
                      <td className="py-3 pr-4">{course.totalScore ?? "-"}</td>
                      <td className="py-3 pr-4">
                        <GradeBadge grade={course.grade} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 text-center text-sm text-slate-500"
                    >
                      No result found for this semester.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
