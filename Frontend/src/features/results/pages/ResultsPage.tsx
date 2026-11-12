import PageHeader from "../../../components/common/PageHeader";
import { useQuery } from "@tanstack/react-query";
import Card from "../../../components/ui/Card";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import { courseRegistrationTypeLabels } from "../../course-registration/constants/courseRegistrationLabels";
import { getMyCgpa, getMySemesterResult } from "../api/resultsApi";
import { getAcademicSemesters } from "../../academics/api/academicSessionsApi";
import { useState } from "react";
import Select from "../../../components/ui/Select";

function ResultsPage() {
  const [academicSemesterId, setAcademicSemesterId] = useState("");

  const { data: semesters = [], isLoading: isLoadingSemesters } = useQuery({
    queryKey: ["academic-semesters"],
    queryFn: getAcademicSemesters,
  });

  const {
    data: semesterResult,
    isLoading: isLoadingSemesterResult,
    isError: isSemesterResultError,
    error: semsterResultError,
  } = useQuery({
    queryKey: ["my-semester-result", academicSemesterId],
    queryFn: () => getMySemesterResult(academicSemesterId || undefined),
  });

  const {
    data: cgpaResult,
    isLoading: isLoadingCgpa,
    isError: isCgpaError,
    error: cgpaError,
  } = useQuery({
    queryKey: ["my-cgpa"],
    queryFn: getMyCgpa,
  });

  return (
    <section>
      <PageHeader
        title="Results"
        description="View scores, grades, GPA, and CGPA summaries."
      />

      <Card className="mb-6">
        <div className="max-w-md">
          <Select
            label="Academic semester"
            value={academicSemesterId}
            disabled={isLoadingSemesters}
            onChange={(event) => setAcademicSemesterId(event.target.value)}
          >
            <option value="">Current academic semester</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.academicSession?.name} {semester.type}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-600">SemesterGPA</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {semesterResult?.gpa ?? "_"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-600">CGPA</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {isLoadingCgpa ? "..." : (cgpaResult?.cgpa ?? "-")}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-600">GPA Units</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {semesterResult?.totalGpaUnits ?? "_"}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-slate-600">Quality points</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {semesterResult?.totalQualityPoints ?? "_"}
          </p>
        </Card>
      </div>
      <div className="mt-6">
        {isLoadingSemesterResult && (
          <Card>
            <p className="text-sm text-slate-600">Loading results...</p>
          </Card>
        )}

        {isSemesterResultError && (
          <Card>
            <p className="text-sm text-red-600">
              {getApiErrorMessage(semsterResultError)}
            </p>
          </Card>
        )}

        {isCgpaError && (
          <Card className="mt-4">
            <p className="text-sm text-red-600">
              {" "}
              {getApiErrorMessage(cgpaError)}
            </p>
          </Card>
        )}

        {!isLoadingSemesterResult &&
          !isSemesterResultError &&
          semesterResult?.courses.length === 0 && (
            <Card>
              <p className="text-sm text-slate-600">
                {" "}
                No result records are available
              </p>
            </Card>
          )}

        {semesterResult && semesterResult.courses.length > 0 && (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 ">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">GPA units</th>
                    <th className="px-4 py-3">CA</th>
                    <th className="px-4 py-3">Exam</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Point</th>
                    <th className="px-4 py-3">Quality Points</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {semesterResult.courses.map((course) => (
                    <tr key={course.registrationId}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">
                          {course.courseCode}
                        </p>
                        <p className="text-xs text-slate-950">
                          {course.courseTitle}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {courseRegistrationTypeLabels[course.registrationType]}
                      </td>
                      <td className="px-4 py-3">{course.creditUnit}</td>
                      <td className="px-4 py-3">{course.gpaCreditUnit}</td>
                      <td className="px-4 py-3">{course.caScore ?? "-"}</td>
                      <td className="px-4 py-3">{course.examScore ?? "_"}</td>
                      <td className="px-4 py-3">{course.totalScore ?? "_"}</td>
                      <td className="px-4 py-3">{course.grade ?? "_"}</td>
                      <td className="px-4 py-3">{course.gradePoint ?? "_"}</td>
                      <td className="px-4 py-3">
                        {course.qualityPoint ?? "_"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

export default ResultsPage;
