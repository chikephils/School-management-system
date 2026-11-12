import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  type AcademicSemester,
  createAcademicSemester,
  getAcademicSemesters,
  getAcademicSessions,
  updateAcademicSemester,
} from "../api/academicSessionsApi";
import {
  createAcademicSemesterSchema,
  semesterTypes,
  type CreateAcademicSemesterFormValues,
} from "../schemas/academicSemesterSchema";
import { useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function AcademicSemestersPage() {
  const [editingSemester, setEditingSemester] =
    useState<AcademicSemester | null>(null);
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: getAcademicSessions,
  });

  const {
    data: semesters = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["academic-semesters"],
    queryFn: getAcademicSemesters,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAcademicSemesterFormValues>({
    resolver: zodResolver(createAcademicSemesterSchema),
  });

  const createSemesterMutation = useMutation({
    mutationFn: createAcademicSemester,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-semesters"] });
      reset();
      toast.success("Semester created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateSemesterMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateAcademicSemesterFormValues;
    }) =>
      updateAcademicSemester(id, {
        academicSessionId: values.academicSessionId,
        type: values.type,
        isCurrent: values.isCurrent ?? false,
        registrationOpen: values.registrationOpen ?? false,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-semesters"] });
      setEditingSemester(null);
      reset(emptySemesterFormValues);
      toast.success("Semester updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveSemester = (values: CreateAcademicSemesterFormValues) => {
    if (editingSemester) {
      updateSemesterMutation.mutate({
        id: editingSemester.id,
        values,
      });
      return;
    }

    createSemesterMutation.mutate({
      academicSessionId: values.academicSessionId,
      type: values.type,
      isCurrent: values.isCurrent ?? false,
      registrationOpen: values.registrationOpen ?? false,
    });
  };

  const startEditingSemester = (semester: AcademicSemester) => {
    setEditingSemester(semester);
    reset({
      academicSessionId: semester.academicSessionId,
      type: semester.type,
      isCurrent: semester.isCurrent ?? false,
      registrationOpen: semester.registrationOpen ?? false,
    });
    scrollToForm();
  };

  const emptySemesterFormValues: CreateAcademicSemesterFormValues = {
    academicSessionId: "",
    type: "FIRST",
    isCurrent: false,
    registrationOpen: false,
  };

  const cancelEditingSemester = () => {
    setEditingSemester(null);
    reset(emptySemesterFormValues);
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
        title="Semesters"
        description="Create semesters under academic sessions and control course registration status."
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
              Create Semester
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSaveSemester)}
            >
              <Select
                label="Academic session"
                error={errors.academicSessionId?.message}
                disabled={isLoadingSessions}
                {...register("academicSessionId")}
              >
                <option value="">Select academic session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Semester"
                error={errors.type?.message}
                {...register("type")}
              >
                <option value="">Select semester</option>
                {semesterTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  {...register("isCurrent")}
                />
                Current semester
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  {...register("registrationOpen")}
                />
                Registration open
              </label>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={
                  createSemesterMutation.isPending ||
                  updateSemesterMutation.isPending
                }
              >
                {editingSemester ? "Update Semester" : "Save Session"}
              </Button>
              {editingSemester && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditingSemester}
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
              <p className="text-sm text-slate-600">Loading semesters...</p>
            </Card>
          )}

          {isError && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(error)}
              </p>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            semesters.map((semester) => (
              <Card key={semester.id} className="flex-h-full min-h-32">
                <h2 className="text-base font-semibold text-slate-950">
                  {semester.academicSession?.name} {semester.type}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {semester.isCurrent && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      Current
                    </span>
                  )}

                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {semester.registrationOpen
                      ? "Registration open"
                      : "Registration closed"}
                  </span>
                </div>
                <div className="mt-2">
                  <Button
                    type="button"
                    className="cursor-pointer"
                    variant="secondary"
                    onClick={() => startEditingSemester(semester)}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </section>
  );
}

export default AcademicSemestersPage;
