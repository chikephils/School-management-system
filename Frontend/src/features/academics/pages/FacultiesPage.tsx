import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import {
  createFacultySchema,
  type CreateFacultyFormValues,
} from "../schemas/facultySchema";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  createFaculty,
  getFaculties,
  deleteFaculty,
  updateFaculty,
  type Faculty,
} from "../api/facultiesApi";
import { getAcademicCategories } from "../api/academicCategoriesApi";
import Select from "../../../components/ui/Select";
import { formatFacultyName } from "../constants/academicNames";
import { formatFacultyCode } from "../constants/facultyCode";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function FacultiesPage() {
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: faculties = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => getFaculties(),
  });

  const { data: academicCategories = [], isLoading: isLoadingCategories } =
    useQuery({
      queryKey: ["academic-categories"],
      queryFn: getAcademicCategories,
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFacultyFormValues>({
    resolver: zodResolver(createFacultySchema),
  });

  const createFacultyMutation = useMutation({
    mutationFn: createFaculty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["faculties"] });
      reset();
      toast.success("Faculty created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateFacultyMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateFacultyFormValues;
    }) =>
      updateFaculty(id, {
        name: formatFacultyName(values.name),
        code: formatFacultyCode(values.code),
        academicCategoryId: values.academicCategoryId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setEditingFaculty(null);
      reset(emptyFacultyFormValues);
      toast.success("Faculty updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: deleteFaculty,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["faculties"] });
      toast.success("Faculty deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveFaculty = (values: CreateFacultyFormValues) => {
    if (editingFaculty) {
      updateFacultyMutation.mutate({
        id: editingFaculty.id,
        values,
      });
      return;
    }

    createFacultyMutation.mutate({
      name: formatFacultyName(values.name),
      code: formatFacultyCode(values.code),
      academicCategoryId: values.academicCategoryId,
    });
  };

  const startEditingFaculty = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    reset({
      name: formatFacultyName(faculty.name),
      code: faculty.code,
      academicCategoryId: faculty.academicCategoryId,
    });
    scrollToForm();
  };

  const emptyFacultyFormValues: CreateFacultyFormValues = {
    name: "",
    code: "",
    academicCategoryId: "",
  };

  const cancelEditingFaculty = () => {
    setEditingFaculty(null);
    reset(emptyFacultyFormValues);
  };

  const handleDeleteFaculty = (faculty: Faculty) => {
    const confirmed = window.confirm(
      `Delete ${formatFacultyName(faculty.name)}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteFacultyMutation.mutate(faculty.id);
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
        title="Faculties"
        description="Create and manage the faculties used to organize departments and programmes."
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

      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <div ref={formCardRef}>
          <Card className="h-fit">
            <h2 className="text-base font-semibold text-slate-950">
              {editingFaculty ? "Edit Faculty" : "Create Faculty"}
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSaveFaculty)}
            >
              <Input
                label="Faculty name"
                placeholder="Faculty of Computing"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Faculty code"
                placeholder="FCOM"
                error={errors.code?.message}
                {...register("code")}
              />

              <Select
                label="Academic category"
                error={errors.academicCategoryId?.message}
                disabled={isLoadingCategories}
                {...register("academicCategoryId")}
              >
                <option value="">Select academic category</option>

                {academicCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={
                  createFacultyMutation.isPending ||
                  updateFacultyMutation.isPending
                }
              >
                {editingFaculty ? "Update Faculty" : "Save Faculty"}
              </Button>
              {editingFaculty && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditingFaculty}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {isLoading && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-slate-600">Loading faculties...</p>
            </Card>
          )}

          {isError && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(error)}
              </p>
            </Card>
          )}

          {!isLoading && !isError && faculties.length === 0 && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-slate-600">
                No faculties have been created yet.
              </p>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            faculties.map((faculty) => (
              <Card key={faculty.id} className="flex-h-full min-h-32">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    {faculty.code}
                  </p>
                  <h2 className="mt-2 text-base font-semibold text-slate-950">
                    {faculty.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Academic category:{" "}
                    <span className="font-medium">
                      {faculty.academicCategory?.name ?? "Not attached"}
                    </span>
                  </p>
                  <div className="mt-4 flex flex-wrap justify-between gap-2">
                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="secondary"
                      onClick={() => startEditingFaculty(faculty)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="danger"
                      isLoading={
                        deleteFacultyMutation.isPending &&
                        deleteFacultyMutation.variables === faculty.id
                      }
                      onClick={() => handleDeleteFaculty(faculty)}
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

export default FacultiesPage;
