import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getFaculties } from "../../academics/api/facultiesApi";
import { getDepartments } from "../../academics/api/departmentsApi";
import { getProgrammes } from "../../academics/api/programmeApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import PageHeader from "../../../components/common/PageHeader";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  getStudents,
  type StudentProfile,
  updateStudent,
} from "../api/studentsApi";
import { formatProgrammeName } from "../../academics/constants/programmeAwards";
import { getAcademicCategories } from "../../academics/api/academicCategoriesApi";
import { useAppSelector } from "../../../app/store/hooks";
import { type UpdateStudentFormValues } from "../schemas/updateSchema";
import toast from "react-hot-toast";
import EditStudentModal from "../components/EditStudentModal";
import { Link } from "react-router-dom";

function StudentsPage() {
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(
    null,
  );
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isAdmin = user?.role === "ADMIN";
  const isDepartmentAdmin = user?.role === "DEPARTMENT_ADMIN";

  const canSelectFaculty = isSuperAdmin;
  const canSelectLevel = true;

  const [academicCategoryId, setAcademicCategoryId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [level, setLevel] = useState("");

  //Faculty Query
  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties", academicCategoryId],
    queryFn: () =>
      getFaculties(academicCategoryId ? { academicCategoryId } : undefined),
  });

  const assignedFacultyId = useMemo(
    () =>
      faculties.find((item) => item.name === user?.staffProfile?.faculty)?.id,
    [faculties, user?.staffProfile?.faculty],
  );

  const effectiveFacultyId =
    isAdmin || isDepartmentAdmin ? assignedFacultyId : facultyId || undefined;

  //Department Query
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", effectiveFacultyId],
    queryFn: () =>
      getDepartments(
        effectiveFacultyId ? { facultyId: effectiveFacultyId } : undefined,
      ),
  });

  const assignedDepartmentId = useMemo(
    () =>
      departments.find((item) => item.name === user?.staffProfile?.department)
        ?.id,
    [departments, user?.staffProfile?.department],
  );

  const effectiveDepartmentId = isDepartmentAdmin
    ? assignedDepartmentId
    : departmentId || undefined;

  //Programme Query
  const { data: programmes = [] } = useQuery({
    queryKey: ["programmes", effectiveDepartmentId],
    queryFn: () =>
      getProgrammes(
        effectiveDepartmentId
          ? { departmentId: effectiveDepartmentId }
          : undefined,
      ),
  });

  const { data: academicCategories = [] } = useQuery({
    queryKey: ["academic-categories"],
    queryFn: getAcademicCategories,
  });

  //Student Query
  const {
    data: students = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "students",
      academicCategoryId,
      effectiveFacultyId,
      effectiveDepartmentId,
      programmeId,
      level,
    ],
    queryFn: () =>
      getStudents({
        academicCategoryId: academicCategoryId || undefined,
        facultyId: effectiveFacultyId,
        departmentId: effectiveDepartmentId,
        programmeId: programmeId || undefined,
        level: level ? Number(level) : undefined,
      }),
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: UpdateStudentFormValues;
    }) =>
      updateStudent(id, {
        matricNumber: values.matricNumber?.trim(),
        firstName: values.firstName?.trim(),
        lastName: values.lastName?.trim(),
        otherName: values.otherName?.trim() || undefined,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        phoneNumber: values.phoneNumber,
        programmeId: values.programmeId,
        level: values.level,
        admissionYear: values.admissionYear,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["students"],
      });

      setEditingStudent(null);

      toast.success("Student updated");
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveStudent = (values: UpdateStudentFormValues) => {
    if (editingStudent) {
      updateStudentMutation.mutate({
        id: editingStudent.id,
        values,
      });
      return;
    }
  };

  //Filter
  const filteredProgrammes = useMemo(() => {
    return programmes.filter((programmeItem) => {
      const matchesFaculty =
        !effectiveFacultyId ||
        programmeItem.department?.facultyId === effectiveFacultyId;

      const matchesDepartment =
        !effectiveDepartmentId ||
        programmeItem.departmentId === effectiveDepartmentId;

      return matchesFaculty && matchesDepartment;
    });
  }, [programmes, effectiveFacultyId, effectiveDepartmentId]);

  const hasActiveFilters = Boolean(
    academicCategoryId || facultyId || departmentId || programmeId || level,
  );

  const clearFilters = () => {
    setAcademicCategoryId("");
    setFacultyId("");
    setDepartmentId("");
    setProgrammeId("");
    setLevel("");
  };

  return (
    <section>
      <PageHeader
        title="Students"
        description="Manage Student Profiles, admissions and academic records"
      />

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {isSuperAdmin && (
            <Select
              label="Academic category"
              value={academicCategoryId}
              onChange={(event) => {
                setAcademicCategoryId(event.target.value);
                setFacultyId("");
                setDepartmentId("");
                setProgrammeId("");
              }}
            >
              <option value="">All academic categories</option>

              {academicCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          )}

          <Select
            label="Faculty"
            value={effectiveFacultyId ?? ""}
            disabled={!canSelectFaculty}
            onChange={(event) => {
              setFacultyId(event.target.value);
              setDepartmentId("");
              setProgrammeId("");
            }}
          >
            <option value="">
              {canSelectFaculty ? "All faculties" : "Assigned faculty"}
            </option>

            {canSelectFaculty ? (
              faculties.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatFacultyName(item.name)}
                </option>
              ))
            ) : (
              <option value={effectiveFacultyId ?? ""}>
                {formatFacultyName(user?.staffProfile?.faculty ?? "")}
              </option>
            )}
          </Select>

          <Select
            label="Department"
            value={effectiveDepartmentId ?? ""}
            onChange={(event) => {
              setDepartmentId(event.target.value);
              setProgrammeId("");
            }}
          >
            <option value="">All departments</option>

            {departments.map((item) => (
              <option key={item.id} value={item.id}>
                {formatDepartmentName(item.name)}
              </option>
            ))}
          </Select>
          <Select
            label="Programme"
            value={programmeId}
            onChange={(event) => setProgrammeId(event.target.value)}
          >
            <option value="">All programmes</option>

            {filteredProgrammes.map((item) => (
              <option key={item.id} value={item.id}>
                {formatProgrammeName(item.name, item.award)}
              </option>
            ))}
          </Select>

          <Select
            label="Level"
            value={level}
            disabled={!canSelectLevel}
            onChange={(event) => setLevel(event.target.value)}
          >
            <option value="">All levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="500">500 Level</option>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              className="cursor-pointer"
              type="button"
              variant="secondary"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading && (
          <Card className="flex-h-full min-h-40">
            <p className="text-sm text-slate-600">Loading students...</p>
          </Card>
        )}

        {isError && (
          <Card className="flex-h-full min-h-40">
            <p className="text-sm text-red-600">{getApiErrorMessage(error)}</p>
          </Card>
        )}

        {!isLoading && !isError && students.length === 0 && (
          <Card className="flex-h-full min-h-40">
            <p className="text-sm text-slate-600">No students found.</p>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          students.map((student) => (
            <Card key={student.id} className="flex-h-full min-h-40">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-700">
                  {student.matricNumber}
                </p>

                <h2 className="mt-2 text-base font-semibold text-slate-950">
                  {student.firstName} {student.otherName ?? ""}{" "}
                  {student.lastName}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {student.level} Level
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {student.admissionYear}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Email:{" "}
                  <span className="font-medium">{student?.user?.email}</span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Programme:{" "}
                  <span className="font-medium">
                    {student.programmeRecord
                      ? formatProgrammeName(
                          student.programmeRecord.name,
                          student.programmeRecord.award,
                        )
                      : student.programme}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Department:{" "}
                  <span className="font-medium">
                    {formatDepartmentName(student.department)}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Faculty:{" "}
                  <span className="font-medium">
                    {formatFacultyName(student.faculty)}
                  </span>
                </p>
                <div className="mt-auto flex justify-between items-center pt-4">
                  <Link to={`/students/${student.id}`}>
                    <Button
                      className="cursor-pointer"
                      type="button"
                      variant="secondary"
                    >
                      View
                    </Button>
                  </Link>
                  {isSuperAdmin && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setEditingStudent(student)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          faculties={faculties}
          departments={departments}
          programmes={programmes}
          onClose={() => setEditingStudent(null)}
          onSave={handleSaveStudent}
          isSaving={updateStudentMutation.isPending}
        />
      )}
    </section>
  );
}

export default StudentsPage;
