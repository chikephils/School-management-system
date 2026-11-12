import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  type Department,
} from "../api/departmentsApi";
import { getFaculties } from "../api/facultiesApi";
import {
  createDepartmentSchema,
  type CreateDepartmentFormValues,
} from "../schemas/departmentSchema";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../constants/academicNames";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function DepartmentsPage() {
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: departments = [],
    isLoading: isLoadingDepartments,
    isError: isDepartmentsError,
    error: departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  });

  const { data: faculties = [], isLoading: isLoadingFaculties } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => getFaculties(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
  });

  const createDepartmentMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      reset();
      toast.success("Department created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateDepartmentFormValues;
    }) =>
      updateDepartment(id, {
        name: formatDepartmentName(values.name),
        code: values.code.trim().toUpperCase(),
        facultyId: values.facultyId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      setEditingDepartment(null);
      reset(emptyDepartmentFormValues);
      toast.success("Department updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Department deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveDepartment = (values: CreateDepartmentFormValues) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({
        id: editingDepartment.id,
        values,
      });
      return;
    }

    createDepartmentMutation.mutate({
      name: formatDepartmentName(values.name),
      code: values.code.toUpperCase(),
      facultyId: values.facultyId,
    });
  };

  const startEditingDepartment = (department: Department) => {
    setEditingDepartment(department);
    reset({
      name: formatDepartmentName(department.name),
      code: department.code,
      facultyId: department.facultyId,
    });
    scrollToForm();
  };

  const emptyDepartmentFormValues: CreateDepartmentFormValues = {
    name: "",
    code: "",
    facultyId: "",
  };

  const cancelEditingDepartment = () => {
    setEditingDepartment(null);
    reset(emptyDepartmentFormValues);
  };

  const handleDeleteDepartment = (department: Department) => {
    const confirmed = window.confirm(
      `Delete ${formatDepartmentName(department.name)}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteDepartmentMutation.mutate(department.id);
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
        title="Departments"
        description="Create Departments under faculties"
        action={
          <Link to="/academics">
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

      <div className="grid items-start gap-6 xl-grid-cols-[380px_1fr]">
        <div ref={formCardRef}>
          <Card className="h-fit">
            <h2 className="text-base font-semibold text-slate-950">
              {editingDepartment ? "Edit Department" : "Create Department"}
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSaveDepartment)}
            >
              <Input
                label="Department name"
                placeholder="Department of Computer Science"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Department code"
                placeholder="CSC"
                error={errors.code?.message}
                {...register("code")}
              />

              <Select
                label="Faculty"
                error={errors.facultyId?.message}
                disabled={isLoadingFaculties}
                {...register("facultyId")}
              >
                <option value="">Select faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {formatFacultyName(faculty.name)}
                  </option>
                ))}
              </Select>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={
                  createDepartmentMutation.isPending ||
                  updateDepartmentMutation.isPending
                }
              >
                {editingDepartment ? "Update Department" : "Save Department"}
              </Button>

              {editingDepartment && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditingDepartment}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {isLoadingDepartments && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-slate-600">Loading departments...</p>
            </Card>
          )}

          {isDepartmentsError && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(departmentsError)}
              </p>
            </Card>
          )}

          {!isLoadingDepartments &&
            !isDepartmentsError &&
            departments.length === 0 && (
              <Card className="flex-h-full min-h-32">
                <p className="text-sm text-slate-600">
                  No departments have been created yet.
                </p>
              </Card>
            )}

          {!isLoadingDepartments &&
            !isDepartmentsError &&
            departments.map((department) => (
              <Card key={department.id} className="flex-h-full min-h-32">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    {department.code}
                  </p>
                  <h2 className="mt-2 text-base font-semibold text-slate-950">
                    {formatDepartmentName(department.name)}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Faculty:{" "}
                    <span className="font-medium">
                      {department.faculty
                        ? formatFacultyName(department.faculty.name)
                        : "Not attached"}
                    </span>
                  </p>
                  <div className="mt-4 flex justify-between flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => startEditingDepartment(department)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      className="cursor-pointer"
                      isLoading={
                        deleteDepartmentMutation.isPending &&
                        deleteDepartmentMutation.variables === department.id
                      }
                      onClick={() => handleDeleteDepartment(department)}
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

export default DepartmentsPage;
