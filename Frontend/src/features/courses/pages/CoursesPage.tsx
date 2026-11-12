import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { getDepartments } from "../../academics/api/departmentsApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import { courseCategories } from "../constants/coursesCategories";
import { courseCategoryLabels } from "../constants/coursesCategories";
import {
  createCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  type Course,
} from "../api/coursesApi";
import { getAcademicCategories } from "../../academics/api/academicCategoriesApi";
import { getFaculties } from "../../academics/api/facultiesApi";
import {
  createCourseSchema,
  type CreateCourseFormValues,
} from "../schema/courseSchema";

function CoursesPage() {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const [academicCategoryId, setAcademicCategoryId] = useState("");
  const [facultyId, setFacultyId] = useState("");

  const { data: academicCategories = [] } = useQuery({
    queryKey: ["academic-categories"],
    queryFn: getAcademicCategories,
  });

  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties", academicCategoryId],
    queryFn: () =>
      getFaculties(academicCategoryId ? { academicCategoryId } : undefined),
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments", facultyId],
    queryFn: () => getDepartments(facultyId ? { facultyId } : undefined),
  });

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
  });

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      reset();
      toast.success("Course created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateCourseFormValues;
    }) =>
      updateCourse(id, {
        departmentId: values.departmentId,
        code: values.code.trim().toUpperCase(),
        title: values.title.trim(),
        creditUnit: values.creditUnit,
        level: values.level,
        category: values.category,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      setEditingCourse(null);
      reset(emptyCourseFormValues);
      toast.success("Course updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveCourse = (values: CreateCourseFormValues) => {
    if (editingCourse) {
      updateCourseMutation.mutate({
        id: editingCourse.id,
        values,
      });
      return;
    }

    createCourseMutation.mutate({
      departmentId: values.departmentId,
      code: values.code.trim().toUpperCase(),
      title: values.title.trim(),
      creditUnit: values.creditUnit,
      level: values.level,
      category: values.category,
    });
    setAcademicCategoryId("");
    setFacultyId("");
  };

  const startEditingCourse = (course: Course) => {
    setEditingCourse(course);
    reset({
      departmentId: course.departmentId,
      code: course.code,
      title: course.title,
      creditUnit: course.creditUnit,
      level: course.level,
      category: course.category,
    });
    setAcademicCategoryId("");
    setFacultyId("");
    scrollToForm();
  };

  const emptyCourseFormValues: CreateCourseFormValues = {
    departmentId: "",
    code: "",
    title: "",
    creditUnit: 1,
    level: 100,
    category: "CORE",
  };

  const cancelEditingCourse = () => {
    setEditingCourse(null);
    reset(emptyCourseFormValues);
    setAcademicCategoryId("");
    setFacultyId("");
  };

  const handleDeleteCourse = (course: Course) => {
    const confirmed = window.confirm(
      `Delete ${course.code} - ${course.title}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteCourseMutation.mutate(course.id);
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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {editingCourse ? "Edit Course" : "Create Course"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Create department-owned courses before offering them to programmes
            in a semester.
          </p>
        </div>

        <Link
          to="/course-offerings"
          className="inline-flex w-fit items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Manage Offerings
        </Link>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <div ref={formCardRef}>
          <Card className="h-fit">
            <h2 className="text-base font-semibold text-slate-950">
              Create course
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSaveCourse)}
            >
              <Select
                label="Academic category"
                value={academicCategoryId}
                onChange={(event) => {
                  setAcademicCategoryId(event.target.value);
                  setFacultyId("");
                  setValue("departmentId", "");
                }}
              >
                <option value="">All academic categories</option>

                {academicCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Faculty"
                value={facultyId}
                onChange={(event) => {
                  setFacultyId(event.target.value);
                  setValue("departmentId", "");
                }}
              >
                <option value="">All faculties</option>

                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {formatFacultyName(faculty.name)}
                  </option>
                ))}
              </Select>

              <Select
                label="Department"
                error={errors.departmentId?.message}
                disabled={isLoadingDepartments}
                {...register("departmentId")}
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {formatDepartmentName(department.name)}
                  </option>
                ))}
              </Select>

              <Input
                label="Course code"
                placeholder="CSC-201"
                error={errors.code?.message}
                {...register("code")}
              />

              <Input
                label="Course title"
                placeholder="Data Structures"
                error={errors.title?.message}
                {...register("title")}
              />

              <Input
                label="Credit unit"
                type="number"
                min={1}
                placeholder="3"
                error={errors.creditUnit?.message}
                {...register("creditUnit", { valueAsNumber: true })}
              />

              <Input
                label="level"
                type="number"
                min={100}
                step={100}
                placeholder="200"
                error={errors.level?.message}
                {...register("level", { valueAsNumber: true })}
              />

              <Select
                label="category"
                error={errors.category?.message}
                {...register("category")}
              >
                <option value="">Select Category</option>
                {courseCategories.map((category) => (
                  <option key={category} value={category}>
                    {courseCategoryLabels[category]}
                  </option>
                ))}
              </Select>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={
                  createCourseMutation.isPending ||
                  updateCourseMutation.isPending
                }
              >
                {editingCourse ? "Update Course" : "Save Course"}
              </Button>
              {editingCourse && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditingCourse}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {isLoading && (
            <Card className="flex-h-full min-h-36">
              <p className="text-sm text-slate-600">Loading courses...</p>
            </Card>
          )}

          {isError && (
            <Card className="flex-h-full min-h-36">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(error)}
              </p>
            </Card>
          )}

          {!isLoading && !isError && courses.length === 0 && (
            <Card className="flex-h-full min-h-36">
              <p className="text-sm text-slate-600">
                No courses have created yet
              </p>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            courses.map((course) => (
              <Card key={course.id} className="flex-h-full min-h-36">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">
                      {course.code}
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {courseCategoryLabels[course.category]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {course.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {course.creditUnit} unit{course.creditUnit === 1 ? "" : "s"}{" "}
                    · {course.level} level
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Department:{" "}
                    <span className="font-medium">
                      {course.department
                        ? formatDepartmentName(course.department.name)
                        : "Not attached"}
                    </span>
                  </p>
                  <div className="mt-4 flex  justify-between flex-wrap gap-2">
                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="secondary"
                      onClick={() => startEditingCourse(course)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="danger"
                      isLoading={
                        deleteCourseMutation.isPending &&
                        deleteCourseMutation.variables === course.id
                      }
                      onClick={() => handleDeleteCourse(course)}
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

export default CoursesPage;
