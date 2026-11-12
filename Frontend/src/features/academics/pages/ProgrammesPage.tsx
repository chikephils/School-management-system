import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import { getDepartments } from "../api/departmentsApi";
import {
  getProgrammes,
  createProgramme,
  deleteProgramme,
  updateProgramme,
  type Programme,
} from "../api/programmeApi";
import {
  programmeAwards,
  createProgrammeSchema,
  type CreateProgrammeFormValues,
} from "../schemas/programmeSchema";
import {
  formatProgrammeAward,
  formatProgrammeName,
} from "../constants/programmeAwards";
import { formatDepartmentName } from "../constants/academicNames";
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function ProgrammesPage() {
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(
    null,
  );
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: programmes = [],
    isLoading: isLoadingProgrammes,
    isError: isProgrammesError,
    error: programmesError,
  } = useQuery({
    queryKey: ["programmes"],
    queryFn: () => getProgrammes(),
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProgrammeFormValues>({
    resolver: zodResolver(createProgrammeSchema),
  });

  const updateProgrammeMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateProgrammeFormValues;
    }) =>
      updateProgramme(id, {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        award: values.award,
        durationYears: values.durationYears,
        departmentId: values.departmentId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["programmes"] });
      setEditingProgramme(null);
      reset(emptyProgrammeFormValues);
      toast.success("Programme updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteProgrammeMutation = useMutation({
    mutationFn: deleteProgramme,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["programmes"] });
      toast.success("Programme deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const createProgrammeMutation = useMutation({
    mutationFn: createProgramme,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["programmes"] });
      reset();
      toast.success("Programme created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveProgramme = (values: CreateProgrammeFormValues) => {
    if (editingProgramme) {
      updateProgrammeMutation.mutate({
        id: editingProgramme.id,
        values,
      });
      return;
    }

    createProgrammeMutation.mutate({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      award: values.award,
      durationYears: values.durationYears,
      departmentId: values.departmentId,
    });
  };

  const startEditingProgramme = (programme: Programme) => {
    setEditingProgramme(programme);
    reset({
      name: programme.name,
      code: programme.code,
      award: programme.award,
      durationYears: programme.durationYears,
      departmentId: programme.departmentId,
    });
    scrollToForm();
  };

  const emptyProgrammeFormValues: CreateProgrammeFormValues = {
    name: "",
    code: "",
    award: "BSC",
    durationYears: 1,
    departmentId: "",
  };

  const cancelEditingProgramme = () => {
    setEditingProgramme(null);
    reset();
  };

  const handleDeleteProgramme = (programme: Programme) => {
    const confirmed = window.confirm(
      `Delete ${formatProgrammeName(programme.name, programme.award)}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteProgrammeMutation.mutate(programme.id);
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
        title="Programmes"
        description="Create programmes and attach each one to a department."
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
              {editingProgramme ? "Edit Programme" : "Create Programme"}
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSaveProgramme)}
            >
              <Select
                label="Programme award"
                error={errors.award?.message}
                {...register("award")}
              >
                <option value="">Select programme award</option>
                {programmeAwards.map((award) => (
                  <option key={award} value={award}>
                    {formatProgrammeAward(award)}
                  </option>
                ))}
              </Select>
              <Input
                label="Programme name"
                placeholder="Computer Science"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Programme code"
                placeholder="BSC-CS"
                error={errors.code?.message}
                {...register("code")}
              />
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
                label="Duration years"
                type="number"
                min={1}
                placeholder="4"
                error={errors.durationYears?.message}
                {...register("durationYears", { valueAsNumber: true })}
              />
              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={
                  createProgrammeMutation.isPending ||
                  updateProgrammeMutation.isPending
                }
              >
                {editingProgramme ? "Update Programme" : "Save Programme"}
              </Button>{" "}
              {editingProgramme && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditingProgramme}
                >
                  Cancel Edit
                </Button>
              )}
            </form>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {isLoadingProgrammes && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-slate-600">Loading programmes...</p>
            </Card>
          )}

          {isProgrammesError && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(programmesError)}
              </p>
            </Card>
          )}

          {!isLoadingProgrammes &&
            !isProgrammesError &&
            programmes.length === 0 && (
              <Card className="flex-h-full min-h-32">
                <p className="text-sm text-slate-600">
                  No programmes have been created yet.
                </p>
              </Card>
            )}

          {!isLoadingProgrammes &&
            !isProgrammesError &&
            programmes.map((programme) => (
              <Card key={programme.id} className="flex-h-full min-h-32">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className=" text-base font-semibold text-blue-700">
                      {formatProgrammeAward(programme.award)}
                    </span>
                    <h2 className="text-base font-semibold text-slate-950">
                      {programme.name}
                    </h2>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {programme.code}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    Duration:{" "}
                    <span className="font-medium">
                      {programme.durationYears} years
                    </span>
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Department:{" "}
                    <span className="font-medium">
                      {programme.department
                        ? formatDepartmentName(programme.department.name)
                        : "Not attached"}
                    </span>
                  </p>
                  <div className="mt-4 flex justify-between flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => startEditingProgramme(programme)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      className="cursor-pointer"
                      isLoading={
                        deleteProgrammeMutation.isPending &&
                        deleteProgrammeMutation.variables === programme.id
                      }
                      onClick={() => handleDeleteProgramme(programme)}
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

export default ProgrammesPage;
