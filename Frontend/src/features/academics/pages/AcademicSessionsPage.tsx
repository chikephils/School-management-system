import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  createAcademicSession,
  getAcademicSessions,
  deleteAcademicSession,
  updateAcademicSession,
  type AcademicSession,
} from "../api/academicSessionsApi";
import {
  createAcademicSessionSchema,
  type CreateAcademicSessionFormValues,
} from "../schemas/academicSessionSchema";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function AcademicSessionsPage() {
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(
    null,
  );
  const formCardRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["academic-sessions"],
    queryFn: getAcademicSessions,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAcademicSessionFormValues>({
    resolver: zodResolver(createAcademicSessionSchema),
  });

  const createSessionMutation = useMutation({
    mutationFn: createAcademicSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
      reset();
      toast.success("Academic session created");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CreateAcademicSessionFormValues;
    }) =>
      updateAcademicSession(id, {
        name: values.name.trim(),
        startsAt: values.startsAt || undefined,
        endsAt: values.endsAt || undefined,
        isCurrent: values.isCurrent ?? false,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
      setEditingSession(null);
      reset(emptySessionFormValues);
      toast.success("Session Updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteAcademicSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["academic-sessions"] });
      toast.success("Session deleted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSaveSession = (values: CreateAcademicSessionFormValues) => {
    if (editingSession) {
      updateSessionMutation.mutate({
        id: editingSession.id,
        values,
      });
      return;
    }

    createSessionMutation.mutate({
      name: values.name.trim(),
      startsAt: values.startsAt || undefined,
      endsAt: values.endsAt || undefined,
      isCurrent: values.isCurrent ?? false,
    });
  };

  const startEditingSession = (session: AcademicSession) => {
    setEditingSession(session);
    reset({
      name: session.name.trim(),
      startsAt: session.startsAt || undefined,
      endsAt: session.endsAt || undefined,
      isCurrent: session.isCurrent ?? false,
    });
    scrollToForm();
  };

  const emptySessionFormValues: CreateAcademicSessionFormValues = {
    name: "",
    startsAt: undefined,
    endsAt: undefined,
    isCurrent: false,
  };

  const cancelEditingSession = () => {
    setEditingSession(null);
    reset(emptySessionFormValues);
  };

  const handleDeleteSession = (session: AcademicSession) => {
    const confirmed = window.confirm(
      `Delete ${session.name}? This cannot be undone`,
    );
    if (!confirmed) {
      return;
    }
    deleteSessionMutation.mutate(session.id);
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
        title="Academic Sessions"
        description="Create academic years like 2025/2026 and mark the current session."
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
              Create Academic Session
            </h2>

            <form
              className="mt-5 space-y-4"
              onSubmit={handleSubmit(handleSaveSession)}
            >
              <Input
                label="Session name"
                placeholder="2025/2026"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Start date"
                type="date"
                error={errors.startsAt?.message}
                {...register("startsAt")}
              />

              <Input
                label="End date"
                type="date"
                error={errors.endsAt?.message}
                {...register("endsAt")}
              />

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  {...register("isCurrent")}
                />
                Current session
              </label>

              <Button
                type="submit"
                className="w-full cursor-pointer"
                isLoading={
                  createSessionMutation.isPending ||
                  updateSessionMutation.isPending
                }
              >
                {editingSession ? "Update Session" : "Save Session"}
              </Button>
              {editingSession && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full cursor-pointer"
                  onClick={cancelEditingSession}
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
              <p className="text-sm text-slate-600">Loading sessions...</p>
            </Card>
          )}

          {isError && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-red-600">
                {getApiErrorMessage(error)}
              </p>
            </Card>
          )}

          {!isLoading && !isError && sessions.length === 0 && (
            <Card className="flex-h-full min-h-32">
              <p className="text-sm text-slate-600">
                No academic sessions have been created yet.
              </p>
            </Card>
          )}

          {!isLoading &&
            !isError &&
            sessions.map((session) => (
              <Card key={session.id} className="flex-h-full min-h-32">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">
                      {session.name}
                    </h2>

                    {session.isCurrent && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Current
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    Starts: {session.startsAt?.slice(0, 10) ?? "Not set"}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Ends: {session.endsAt?.slice(0, 10) ?? "Not set"}
                  </p>
                  <div className="mt-4 flex  justify-between flex-wrap gap-2">
                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="secondary"
                      onClick={() => startEditingSession(session)}
                    >
                      Edit
                    </Button>

                    <Button
                      type="button"
                      className="cursor-pointer"
                      variant="danger"
                      isLoading={
                        deleteSessionMutation.isPending &&
                        deleteSessionMutation.variables === session.id
                      }
                      onClick={() => handleDeleteSession(session)}
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

export default AcademicSessionsPage;
