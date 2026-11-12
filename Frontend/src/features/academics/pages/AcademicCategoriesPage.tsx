import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  createAcademicCategory,
  deleteAcademicCategory,
  getAcademicCategories,
  updateAcademicCategory,
  type AcademicCategory,
} from "../api/academicCategoriesApi";
import {
  academicCategorySchema,
  type AcademicCategoryFormValues,
} from "../schemas/academicCategorySchema";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const emptyCategoryValues: AcademicCategoryFormValues = {
  name: "",
  code: "",
  description: "",
};

function AcademicCategoriesPage() {
  const [editingCategory, setEditingCategory] =
    useState<AcademicCategory | null>(null);

  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["academic-categories"],
    queryFn: getAcademicCategories,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AcademicCategoryFormValues>({
    resolver: zodResolver(academicCategorySchema),
    defaultValues: emptyCategoryValues,
  });

  const createMutation = useMutation({
    mutationFn: createAcademicCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["academic-categories"],
      });

      reset(emptyCategoryValues);
      toast.success("Academic category created");
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: AcademicCategoryFormValues;
    }) =>
      updateAcademicCategory(id, {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["academic-categories"],
      });

      setEditingCategory(null);
      reset(emptyCategoryValues);
      toast.success("Academic category updated");
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAcademicCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["academic-categories"],
      });

      toast.success("Academic category deleted");
    },
    onError: (mutationError) => {
      toast.error(getApiErrorMessage(mutationError));
    },
  });

  const scrollToForm = () => {
    const formTop = formCardRef.current?.getBoundingClientRect().top ?? 0;

    window.scrollTo({
      top: window.scrollY + formTop - 96,
      behavior: "smooth",
    });
  };

  const handleSave = (values: AcademicCategoryFormValues) => {
    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory.id,
        values,
      });
      return;
    }

    createMutation.mutate({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description?.trim() || undefined,
    });
  };

  const startEditing = (category: AcademicCategory) => {
    setEditingCategory(category);

    reset({
      name: category.name,
      code: category.code,
      description: category.description ?? "",
    });

    scrollToForm();
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    reset(emptyCategoryValues);
  };

  const handleDelete = (category: AcademicCategory) => {
    const confirmed = window.confirm(
      `Delete ${category.name}? This cannot be undone.`,
    );

    if (confirmed) {
      deleteMutation.mutate(category.id);
    }
  };

  return (
    <section>
      <PageHeader
        title="Academic Categories"
        description="Create broad academic groups for organizing faculties."
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
              {editingCategory
                ? "Edit Academic Category"
                : "Create Academic Category"}
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSave)}
            >
              <Input
                label="Category name"
                placeholder="Engineering and Technology"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Category code"
                placeholder="ENG_TECH"
                error={errors.code?.message}
                {...register("code")}
              />

              <Input
                label="Description"
                placeholder="Engineering, computing, and technology faculties"
                error={errors.description?.message}
                {...register("description")}
              />

              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editingCategory ? "Update Category" : "Save Category"}
              </Button>

              {editingCategory && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditing}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {isLoading && (
            <Card className="flex min-h-32">
              <p className="text-sm text-slate-600">
                Loading academic categories...
              </p>
            </Card>
          )}

          {isError && (
            <Card className="flex min-h-32">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(error)}
              </p>
            </Card>
          )}

          {!isLoading && !isError && categories.length === 0 && (
            <Card className="flex min-h-32">
              <p className="text-sm text-slate-600">
                No academic categories have been created yet.
              </p>
            </Card>
          )}

          {categories.map((category) => (
            <Card key={category.id} className="flex min-h-32">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-700">
                  {category.code}
                </p>

                <h2 className="mt-2 text-base font-semibold text-slate-950">
                  {category.name}
                </h2>

                {category.description && (
                  <p className="mt-2 text-sm text-slate-600">
                    {category.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap justify-between gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => startEditing(category)}
                  >
                    Edit
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    className="cursor-pointer"
                    isLoading={
                      deleteMutation.isPending &&
                      deleteMutation.variables === category.id
                    }
                    onClick={() => handleDelete(category)}
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

export default AcademicCategoriesPage;
