import PageHeader from "../../../components/common/PageHeader";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  getAvailableCourses,
  getDraftRegistrationSummary,
  getMyRegistration,
  registerCourse,
  removeDraftRegistration,
  submitCourseRegistration,
  type DraftRegistrationSummary,
  type AvailableCourseOffering,
  type MyRegistrationSummary,
} from "../api/courseRegistrationApi";
import { courseRegistrationTypeLabels } from "../constants/courseRegistrationLabels";
import { courseOfferingScopeLabels } from "../../courses/constants/courseOfferingScopes";

function CourseRegistrationPage() {
  const queryClient = useQueryClient();

  const {
    data: myRegistration,
    isLoading: isLoadingMyRegistration,
    isError: isMyRegistrationError,
    error: myRegistrationError,
  } = useQuery<MyRegistrationSummary>({
    queryKey: ["my-registration"],
    queryFn: getMyRegistration,
  });

  const hasSubmittedRegistration =
    myRegistration?.hasSubmittedRegistration === true;

  const canRegister = myRegistration?.canRegister === true;

  const {
    data: availableCourses = [],
    isLoading: isLoadingAvailableCourses,
    isError: isAvailableCoursesError,
    error: availableCoursesError,
  } = useQuery<AvailableCourseOffering[]>({
    queryKey: ["available-course-offerings"],
    queryFn: getAvailableCourses,
    enabled: canRegister && !hasSubmittedRegistration,
  });

  const {
    data: draftSummary,
    isLoading: isLoadingDraftSummary,
    isError: isDraftSummaryError,
    error: draftSummaryError,
  } = useQuery<DraftRegistrationSummary>({
    queryKey: ["draft-registration-summary"],
    queryFn: getDraftRegistrationSummary,
  });

  const refreshRegistrationData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["my-registration"] }),
      queryClient.invalidateQueries({
        queryKey: ["available-course-offerings"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["draft-registration-summary"],
      }),
    ]);
  };
  const registerCourseMutation = useMutation({
    mutationFn: registerCourse,
    onSuccess: async () => {
      await refreshRegistrationData();
      toast.success("Course added");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const removeCourseMutation = useMutation({
    mutationFn: removeDraftRegistration,
    onSuccess: async () => {
      await refreshRegistrationData();
      toast.success("Course removed");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const submitRegistrationMutation = useMutation({
    mutationFn: submitCourseRegistration,
    onSuccess: async () => {
      await refreshRegistrationData();
      toast.success("Registration submitted");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const registeredCourseOfferingIds = new Set<string>(
    draftSummary?.courses.map((course) => course.courseOfferingId) ?? [],
  );

  return (
    <section>
      <PageHeader
        title="Course Registration"
        description="Register semester courses and add carry-over courses where needed."
      />

      {isLoadingMyRegistration && (
        <Card>
          <p className="text-sm text-slate-600">Loading registration...</p>
        </Card>
      )}

      {isMyRegistrationError && (
        <Card>
          <p className="text-sm text-red-600">
            {getApiErrorMessage(myRegistrationError)}
          </p>
        </Card>
      )}

      {!isLoadingMyRegistration && !isMyRegistrationError && (
        <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-4 lg:grid-cols-2">
            {hasSubmittedRegistration && myRegistration ? (
              myRegistration.courses.map((course) => (
                <Card
                  key={course.registrationId}
                  className="flex-h-full min-h-48"
                >
                  <div className="flex w-full flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-950">
                        {course.courseCode}
                      </h2>

                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Submitted
                      </span>

                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {courseRegistrationTypeLabels[course.registrationType]}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {course.courseTitle}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Scope:{" "}
                      <span className="font-medium">
                        {courseOfferingScopeLabels[course.scope]}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      Lecturer:{" "}
                      <span className="font-medium">
                        {course.lecturer
                          ? `${course.lecturer.title ? `${course.lecturer.title} ` : ""}${course.lecturer.firstName} ${course.lecturer.lastName}`
                          : "Not assigned"}
                      </span>
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Level: <span className="font-medium">{course.level}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {course.creditUnit} unit
                        {course.creditUnit === 1 ? "" : "s"}
                      </span>

                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        GPA units: {course.gpaCreditUnit}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        Grade: {course.grade ?? "Pending"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <>
                {isLoadingAvailableCourses && (
                  <Card className="flex-h-full min-h-40">
                    <p className="text-sm text-slate-600">
                      Loading available courses...
                    </p>
                  </Card>
                )}

                {isAvailableCoursesError && (
                  <Card className="flex-h-full min-h-40">
                    <p className="text-sm text-red-600">
                      {getApiErrorMessage(availableCoursesError)}
                    </p>
                  </Card>
                )}

                {!isLoadingAvailableCourses &&
                  !isAvailableCoursesError &&
                  availableCourses.length === 0 && (
                    <Card className="flex-h-full min-h-40">
                      <p className="text-sm text-slate-600">
                        No courses are currently available for registration.
                      </p>
                    </Card>
                  )}

                {!isLoadingAvailableCourses &&
                  !isAvailableCoursesError &&
                  availableCourses.map((offering) => {
                    const isRegistered = registeredCourseOfferingIds.has(
                      offering.id,
                    );

                    return (
                      <Card key={offering.id} className="flex-h-full min-h-48">
                        <div className="flex w-full flex-col">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-slate-950">
                              {offering.course.code}
                            </h2>

                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              {offering.level} level
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-medium text-slate-800">
                            {offering.course.title}
                          </p>

                          <p className="mt-2 text-sm text-slate-600">
                            {offering.course.creditUnit} unit
                            {offering.course.creditUnit === 1 ? "" : "s"}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            Lecturer:{" "}
                            <span className="font-medium">
                              {offering.lecturer
                                ? `${offering.lecturer.firstName} ${offering.lecturer.lastName}`
                                : "Not assigned"}
                            </span>
                          </p>

                          <div className="mt-auto pt-4">
                            <Button
                              type="button"
                              variant={isRegistered ? "secondary" : "primary"}
                              className="w-full cursor-pointer"
                              disabled={isRegistered}
                              isLoading={
                                registerCourseMutation.isPending &&
                                registerCourseMutation.variables === offering.id
                              }
                              onClick={() =>
                                registerCourseMutation.mutate(offering.id)
                              }
                            >
                              {isRegistered ? "Added to draft" : "Add course"}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </>
            )}
          </div>

          {hasSubmittedRegistration && myRegistration ? (
            <Card className="sticky top-24 h-fit">
              <h2 className="text-base font-semibold text-slate-950">
                Submitted Registration
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {myRegistration.academicSemester.academicSession.name}{" "}
                {myRegistration.academicSemester.semester}
              </p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Total courses</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {myRegistration.totalCourses}
                  </p>
                </div>

                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">Credit units</p>
                  <p className="mt-1 text-2xl font-bold text-blue-950">
                    {myRegistration.totalCreditUnits}
                  </p>
                </div>

                <div className="rounded-md bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">GPA units</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-950">
                    {myRegistration.totalGpaUnits}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium text-emerald-700">
                Your course registration has been submitted.
              </p>
            </Card>
          ) : (
            <Card className="sticky top-24 h-fit">
              <h2 className="text-base font-semibold text-slate-950">
                Draft Summary
              </h2>

              {isLoadingDraftSummary && (
                <p className="mt-4 text-sm text-slate-600">
                  Loading summary...
                </p>
              )}

              {isDraftSummaryError && (
                <p className="mt-4 text-sm text-red-600">
                  {getApiErrorMessage(draftSummaryError)}
                </p>
              )}

              {draftSummary && (
                <div className="mt-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-md bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Registered units</p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {draftSummary.registeredUnits}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Required: {draftSummary.minimumUnits} -{" "}
                        {draftSummary.maximumUnits}
                      </p>
                    </div>

                    <div className="rounded-md bg-blue-50 p-4">
                      <p className="text-sm text-blue-700">GPA units</p>
                      <p className="mt-1 text-2xl font-bold text-blue-950">
                        {draftSummary.gpaUnits}
                      </p>
                      <p className="mt-1 text-xs text-blue-700">
                        Carryover courses count extra for GPA
                      </p>
                    </div>
                  </div>

                  <p
                    className={`mt-3 text-sm font-medium ${
                      draftSummary.canSubmit
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {draftSummary.message}
                  </p>

                  <div className="mt-5 space-y-3">
                    {draftSummary.courses.map((course) => (
                      <div
                        key={course.registrationId}
                        className="rounded-md border border-slate-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {course.courseCode}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              {course.courseTitle}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                            onClick={() =>
                              removeCourseMutation.mutate(course.registrationId)
                            }
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {course.creditUnit} unit
                            {course.creditUnit === 1 ? "" : "s"}
                          </span>

                          {course.gpaCreditUnit !== course.creditUnit && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                              GPA units: {course.gpaCreditUnit}
                            </span>
                          )}

                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {
                              courseRegistrationTypeLabels[
                                course.registrationType
                              ]
                            }
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    className="mt-5 w-full cursor-pointer"
                    disabled={
                      !draftSummary.canSubmit ||
                      draftSummary.courses.length === 0
                    }
                    isLoading={submitRegistrationMutation.isPending}
                    onClick={() => submitRegistrationMutation.mutate()}
                  >
                    Submit Registration
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </section>
  );
}

export default CourseRegistrationPage;
