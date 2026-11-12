import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { getAcademicSemesters } from "../../academics/api/academicSessionsApi";
import { getFaculties } from "../../academics/api/facultiesApi";
import { getProgrammes } from "../../academics/api/programmeApi";
import { getDepartments } from "../../academics/api/departmentsApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import { formatProgrammeName } from "../../academics/constants/programmeAwards";
import { getLecturers } from "../../staff/api/staffApi";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  createCourseOffering,
  getCourseOfferings,
  deleteCourseOffering,
  updateCourseOffering,
  type CourseOffering,
} from "../api/courseOfferingsApi";
import { getAcademicCategories } from "../../academics/api/academicCategoriesApi";
import { getCourses } from "../api/coursesApi";
import {
  type CreateCourseOfferingFormOutput,
  type CreateCourseOfferingFormValues,
  createCourseOfferingsSchema,
} from "../schema/courseOfferingsSchema";
import {
  courseOfferingScopeLabels,
  courseOfferingScopes,
  formatCourseOfferingTarget,
} from "../constants/courseOfferingScopes";

function CourseOfferingsPage() {
  const [editingOffering, setEditingOffering] = useState<CourseOffering | null>(
    null,
  );
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data: academicCategories = [] } = useQuery({
    queryKey: ["academic-categories"],
    queryFn: getAcademicCategories,
  });

  const { data: courses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => getFaculties(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  });

  const { data: programmes = [] } = useQuery({
    queryKey: ["programmes"],
    queryFn: () => getProgrammes(),
  });

  const { data: semesters = [], isLoading: isLoadingSemesters } = useQuery({
    queryKey: ["academic-semesters"],
    queryFn: getAcademicSemesters,
  });

  const { data: lecturers = [], isLoading: isLoadingLecturers } = useQuery({
    queryKey: ["lecturers"],
    queryFn: getLecturers,
  });
  console.log("Lecturers returned:", lecturers);

  const {
    data: offerings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["course-offerings"],
    queryFn: getCourseOfferings,
  });
  console.log(offerings);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseOfferingFormValues, CreateCourseOfferingFormOutput>({
    resolver: zodResolver(createCourseOfferingsSchema),
    defaultValues: {
      scope: "UNIVERSITY",
      audienceIds: [],
      courseId: "",
      academicSemesterId: "",
      lecturerId: "",
      level: 100,
      registrationOpen: false,
    },
  });

  const selectedScope = useWatch({ control, name: "scope" });

  const selectedAudienceIds = useWatch({
    control,
    name: "audienceIds",
  });

  const selectedCourseId = useWatch({
    control,
    name: "courseId",
  });

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  console.log("Selected course:", selectedCourse);
  console.log("Course department:", selectedCourse?.department?.name);

  console.log(
    "Lecturer departments:",
    lecturers.map((lecturer) => lecturer.department),
  );
  const filteredLecturers = useMemo(() => {
    if (!selectedCourse?.department?.name) return [];

    return lecturers.filter(
      (lecturer) =>
        lecturer.department?.trim().toLowerCase() ===
        selectedCourse?.department?.name.trim().toLowerCase(),
    );
  }, [lecturers, selectedCourse]);

  const audienceOptions = useMemo(() => {
    if (selectedScope === "ACADEMIC_CATEGORY") {
      return academicCategories.map((category) => ({
        id: category.id,
        label: category.name,
      }));
    }

    if (selectedScope === "FACULTY") {
      return faculties.map((faculty) => ({
        id: faculty.id,
        label: formatFacultyName(faculty.name),
      }));
    }

    if (selectedScope === "DEPARTMENT") {
      return departments.map((department) => ({
        id: department.id,
        label: formatDepartmentName(department.name),
      }));
    }

    if (selectedScope === "PROGRAMME") {
      return programmes.map((programme) => ({
        id: programme.id,
        label: formatProgrammeName(programme.name, programme.award),
      }));
    }

    return [];
  }, [academicCategories, departments, faculties, programmes, selectedScope]);

  const toggleAudience = (audienceId: string) => {
    const currentIds = selectedAudienceIds ?? [];

    setValue(
      "audienceIds",
      currentIds.includes(audienceId)
        ? currentIds.filter((id) => id !== audienceId)
        : [...currentIds, audienceId],
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const createOfferingMutation = useMutation({
    mutationFn: createCourseOffering,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-offerings"] });
      reset(emptyOfferingFormValues);
      toast.success("course offering created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const buildOfferingPayload = (values: CreateCourseOfferingFormValues) => ({
    courseId: values.courseId,
    academicSemesterId: values.academicSemesterId,
    scope: values.scope,
    audienceIds: values.scope === "UNIVERSITY" ? undefined : values.audienceIds,
    lecturerId: values.lecturerId || undefined,
    level: values.level,
    registrationOpen: values.registrationOpen ?? false,
  });

  const updateOfferingMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateCourseOfferingFormValues;
    }) => updateCourseOffering(id, buildOfferingPayload(values)),

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-offerings"] });

      setEditingOffering(null);
      reset(emptyOfferingFormValues);
      toast.success("Course offering updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteOfferingMutation = useMutation({
    mutationFn: deleteCourseOffering,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-offerings"] });
      toast.success("Course offering deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveOffering = (values: CreateCourseOfferingFormValues) => {
    if (editingOffering) {
      updateOfferingMutation.mutate({
        id: editingOffering.id,
        values,
      });
      return;
    }
    createOfferingMutation.mutate(buildOfferingPayload(values));
  };

  const startEditingOffering = (offering: CourseOffering) => {
    setEditingOffering(offering);
    reset({
      courseId: offering.courseId,
      academicSemesterId: offering.academicSemesterId,
      lecturerId: offering.lecturerId ?? "",
      scope: offering.scope,
      level: offering.level,
      registrationOpen: offering.registrationOpen,
      audienceIds: offering.audiences.flatMap((audience) => {
        switch (offering.scope) {
          case "ACADEMIC_CATEGORY":
            return audience.academicCategoryId
              ? [audience.academicCategoryId]
              : [];

          case "FACULTY":
            return audience.facultyId ? [audience.facultyId] : [];

          case "DEPARTMENT":
            return audience.departmentId ? [audience.departmentId] : [];

          case "PROGRAMME":
            return audience.programmeId ? [audience.programmeId] : [];

          default:
            return [];
        }
      }),
    });
    scrollToForm();
  };

  const emptyOfferingFormValues: CreateCourseOfferingFormValues = {
    scope: "UNIVERSITY",
    audienceIds: [],
    courseId: "",
    academicSemesterId: "",
    lecturerId: "",
    level: 100,
    registrationOpen: false,
  };

  const cancelEditingOffering = () => {
    setEditingOffering(null);
    reset(emptyOfferingFormValues);
  };

  const handleDeleteOffering = (offering: CourseOffering) => {
    const confirmed = window.confirm(
      `Delete offering for ${offering.course?.code ?? "this course"}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteOfferingMutation.mutate(offering.id);
  };

  const scrollToForm = () => {
    const formTop = formCardRef.current?.getBoundingClientRect().top ?? 0;
    const scrollTop = window.scrollY + formTop - 96;

    window.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <PageHeader
        title="Course Offerings"
        description="Offer courses to programmes for a specific academic semester"
      />

      <div className="grid items-start gap-6 xl:grid-cols-[420px_1fr]">
        <div ref={formCardRef}>
          <Card className="h-fit">
            <h2 className="text-base font-semibold text-slate-950">
              {editingOffering
                ? "Edit Course Offering"
                : "Create Course Offering"}
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSaveOffering)}
            >
              <Select
                label="Course"
                error={errors.courseId?.message}
                disabled={isLoadingCourses}
                {...register("courseId", {
                  onChange: () => {
                    setValue("lecturerId", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  },
                })}
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </Select>

              <Select
                label="Scope"
                error={errors.scope?.message}
                {...register("scope")}
              >
                <option value="">Select scope</option>{" "}
                {courseOfferingScopes.map((scope) => (
                  <option key={scope} value={scope}>
                    {" "}
                    {courseOfferingScopeLabels[scope]}
                  </option>
                ))}
              </Select>

              {selectedScope !== "UNIVERSITY" && (
                <fieldset>
                  <legend className="text-sm font-medium text-slate-700">
                    {courseOfferingScopeLabels[selectedScope]}
                  </legend>

                  <div className="mt-2 max-h-52 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3">
                    {audienceOptions.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={(selectedAudienceIds ?? []).includes(
                            option.id,
                          )}
                          onChange={() => toggleAudience(option.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}

                    {audienceOptions.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No available audience records found.
                      </p>
                    )}
                  </div>

                  {errors.audienceIds?.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.audienceIds.message}
                    </p>
                  )}
                </fieldset>
              )}

              <Select
                label="Academic Semester"
                error={errors.academicSemesterId?.message}
                disabled={isLoadingSemesters}
                {...register("academicSemesterId")}
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.academicSession?.name} {semester.type}
                  </option>
                ))}
              </Select>

              <Select
                label="Lecturer"
                error={errors.lecturerId?.message}
                disabled={!selectedCourse || isLoadingLecturers}
                {...register("lecturerId")}
              >
                <option value="">
                  {!selectedCourse
                    ? "Select a course first"
                    : filteredLecturers.length === 0
                      ? "No lecturers in this department"
                      : "Assign later"}
                </option>

                {filteredLecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.title} {lecturer.firstName} {lecturer.lastName}
                  </option>
                ))}
              </Select>

              <Input
                label="Level"
                type="number"
                min={100}
                step={100}
                placeholder="200"
                error={errors.level?.message}
                {...register("level", { valueAsNumber: true })}
              />

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  {...register("registrationOpen")}
                />
                Open registration for offering
              </label>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={
                  createOfferingMutation.isPending ||
                  updateOfferingMutation.isPending
                }
              >
                {editingOffering ? "Update Offering" : "Save Offering"}
              </Button>
              {editingOffering && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditingOffering}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {isLoading && (
            <Card className="flex-h-full min-h-40">
              <p className="text-sm text-slate-600">Loading offerings...</p>
            </Card>
          )}

          {isError && (
            <Card className="flex-h-full min-h-40">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(error)}
              </p>
            </Card>
          )}

          {!isLoading && !isError && offerings.length === 0 && (
            <Card className="flex-h-full min-h-40">
              <p className="text-sm text-slate-600">
                No course offerings have been created yet.
              </p>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            offerings.map((offering) => (
              <Card key={offering.id} className="flex-h-full min-h-40">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">
                      {offering.course?.code ?? "Course"} -{" "}
                      {offering.course?.title ?? "Not attached"}
                    </h2>

                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {offering.registrationOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600 font-semibold">
                    Scope:{" "}
                    <span className="font-medium">
                      {courseOfferingScopeLabels[offering.scope]}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-600 font-semibold">
                    {" "}
                    Target:{" "}
                    <span className="font-medium">
                      {" "}
                      {formatCourseOfferingTarget(offering)}{" "}
                    </span>{" "}
                  </p>

                  <p className="mt-1 text-sm text-slate-600 font-semibold">
                    Semester:{" "}
                    <span className="font-medium">
                      {offering.academicSemester?.academicSession?.name}{" "}
                      {offering.academicSemester?.type}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-600 font-semibold">
                    Lecturer:{" "}
                    <span className="font-medium">
                      {offering.lecturer
                        ? `${offering.lecturer.title} ${offering.lecturer.firstName} ${offering.lecturer.lastName}`
                        : "Not assigned"}
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-600 font-semibold">
                    Level: <span className="font-medium">{offering.level}</span>
                  </p>

                  <div className="mt-4 flex justify-between flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => startEditingOffering(offering)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      className="cursor-pointer"
                      isLoading={
                        deleteOfferingMutation.isPending &&
                        deleteOfferingMutation.variables === offering.id
                      }
                      onClick={() => handleDeleteOffering(offering)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </section>
  );
}

export default CourseOfferingsPage;
