import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import { getMyCourseOfferings } from "../../staff/api/staffApi";
import {
  getRegisteredStudentsForOffering,
  updateRegistrationScore,
  type RegisteredStudentScore,
} from "../api/scoresApi";
import {
  updateScoreSchema,
  type UpdateScoreFormValues,
} from "../schemas/scoreSchema";
import { getGradeTone } from "../constants/gradeStyles";

function ScoresPage() {
  const [selectedOfferingId, setSelectedOfferingId] = useState("");
  const queryClient = useQueryClient();

  const { data: offerings = [], isLoading: isLoadingOfferings } = useQuery({
    queryKey: ["my-course-offerings"],
    queryFn: getMyCourseOfferings,
  });

  const {
    data: students = [],
    isLoading: isLoadingStudents,
    isError,
    error,
  } = useQuery({
    queryKey: ["offering-students", selectedOfferingId],
    queryFn: () => getRegisteredStudentsForOffering(selectedOfferingId),
    enabled: Boolean(selectedOfferingId),
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({
      registrationId,
      values,
    }: {
      registrationId: string;
      values: UpdateScoreFormValues;
    }) => updateRegistrationScore(registrationId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["offering-students", selectedOfferingId],
      });
      toast.success("Score updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <section>
      <PageHeader
        title="Scores"
        description="Select an assigned course offering and upload students scores"
      />

      <Card className="mb-6">
        <Select
          label="Course offering"
          value={selectedOfferingId}
          disabled={isLoadingOfferings}
          onChange={(event) => setSelectedOfferingId(event.target.value)}
        >
          <option value="">Select course offering</option>
          {offerings.map((offering) => (
            <option key={offering.id} value={offering.id}>
              {offering.course?.code} {offering.course?.title}
              {""} - {""}
              {offering.academicSemester?.academicSession?.name}{" "}
              {offering.academicSemester?.type}
              {""} SEMESTER
            </option>
          ))}
        </Select>
      </Card>

      {!selectedOfferingId && (
        <Card>
          <p className="text-sm text-slate-600">
            Select a course offering to view registered students.
          </p>
        </Card>
      )}

      {selectedOfferingId && isLoadingStudents && (
        <Card>
          <p className="text-sm text-slate-600">
            Loading registered students...
          </p>
        </Card>
      )}

      {selectedOfferingId && isError && (
        <Card>
          <p className="text-sm text-red-600">{getApiErrorMessage(error)}</p>
        </Card>
      )}

      {selectedOfferingId && !isLoadingStudents && students.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">
            No students have registered for this offering yet.
          </p>
        </Card>
      )}

      {students.length > 0 && (
        <div className="grid gap-4">
          {students.map((studentScore) => (
            <ScoreEntryCard
              key={studentScore.id}
              studentScore={studentScore}
              isUpdating={
                updateScoreMutation.isPending &&
                updateScoreMutation.variables?.registrationId ===
                  studentScore.id
              }
              onSubmit={(values) =>
                updateScoreMutation.mutate({
                  registrationId: studentScore.id,
                  values,
                })
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

type ScoreEntryCardProps = {
  studentScore: RegisteredStudentScore;
  isUpdating: boolean;
  onSubmit: (values: UpdateScoreFormValues) => void;
};

type ScorePillTone =
  | "slate"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "orange"
  | "red";

type ScorePillProps = {
  label: string;
  value: string | number;
  tone: ScorePillTone;
};

const scorePillClasses: Record<ScorePillTone, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  orange: "bg-orange-100 text-orange-700",
  red: "bg-red-100 text-red-700",
};

function ScorePill({ label, value, tone }: ScorePillProps) {
  return (
    <div className={`rounded-md px-3 py-1 ${scorePillClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}

function ScoreEntryCard({
  studentScore,
  isUpdating,
  onSubmit,
}: ScoreEntryCardProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateScoreFormValues>({
    resolver: zodResolver(updateScoreSchema),
    defaultValues: {
      caScore: studentScore.caScore ?? 0,
      examScore: studentScore.examScore ?? 0,
    },
  });

  useEffect(() => {
    reset({
      caScore: studentScore.caScore ?? 0,
      examScore: studentScore.examScore ?? 0,
    });
  }, [studentScore.caScore, studentScore.examScore, reset]);

  const student = studentScore.studentProfile;

  return (
    <Card>
      <div className="grid gap-4 lg:grid-cols[1fr_280px] lg:items-end">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-blue-700">
              {student.matricNumber}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {student.level} (LEVEL)
            </p>
          </div>

          <h2 className="mt-1 text-base font-semibold text-slate-950">
            {student.firstName} {student.otherName ?? ""} {student.lastName}
          </h2>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <ScorePill
              label="Total"
              value={studentScore.totalScore ?? "-"}
              tone="slate"
            />
            <ScorePill
              label="Grade"
              value={studentScore.grade ?? "-"}
              tone={getGradeTone(studentScore.grade)}
            />
            <ScorePill
              label="Point"
              value={studentScore.gradePoint ?? "-"}
              tone="slate"
            />
          </div>
        </div>
        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            label="CA"
            type="number"
            min={0}
            max={30}
            error={errors.caScore?.message}
            {...register("caScore", { valueAsNumber: true })}
          />

          <Input
            label="Exam"
            type="number"
            min={0}
            max={70}
            error={errors.examScore?.message}
            {...register("examScore", { valueAsNumber: true })}
          />

          <Button
            type="submit"
            className="h-10 self-end"
            isLoading={isUpdating}
          >
            Save
          </Button>
        </form>
      </div>
    </Card>
  );
}

export default ScoresPage;
