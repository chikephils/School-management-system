import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { getDepartments } from "../../academics/api/departmentsApi";
import { getFaculties } from "../../academics/api/facultiesApi";
import { getProgrammes } from "../../academics/api/programmeApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import { formatProgrammeName } from "../../academics/constants/programmeAwards";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import { genderLabels, genderOptions } from "../constants/genderOptions";
import { registerStudent } from "../api/authApi";
import {
  registerStudentSchema,
  type RegisterStudentFormValues,
} from "../schemas/registerStudentSchema";

const placeholderProfileImageUrl =
  "https://example.com/profile-placeholder.png";

function RegisterStudentPage() {
  const navigate = useNavigate();

  const { data: faculties = [], isLoading: isLoadingFaculties } = useQuery({
    queryKey: ["faculties"],
    queryFn: getFaculties,
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const { data: programmes = [], isLoading: isLoadingProgrammes } = useQuery({
    queryKey: ["programmes"],
    queryFn: getProgrammes,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterStudentFormValues>({
    resolver: zodResolver(registerStudentSchema),
  });

  const selectedFacultyId = useWatch({
    control,
    name: "facultyId",
  });

  const selectedDepartmentId = useWatch({
    control,
    name: "departmentId",
  });

  const filteredDepartments = useMemo(() => {
    if (!selectedFacultyId) {
      return departments;
    }
    return departments.filter(
      (department) => department.facultyId === selectedFacultyId,
    );
  }, [departments, selectedFacultyId]);

  const filteredProgrammes = useMemo(() => {
    if (!selectedDepartmentId) {
      return programmes;
    }

    return programmes.filter(
      (programme) => programme.departmentId === selectedDepartmentId,
    );
  }, [programmes, selectedDepartmentId]);

  const registerStudentMutation = useMutation({
    mutationFn: registerStudent,
    onSuccess: () => {
      toast.success("Registration successful, please sign in.");
      navigate("/");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleRegisterStudent = (values: RegisterStudentFormValues) => {
    registerStudentMutation.mutate({
      email: values.email,
      password: values.password,
      matricNumber: values.matricNumber,
      firstName: values.firstName,
      lastName: values.lastName,
      otherName: values.otherName || undefined,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      phoneNumber: values.phoneNumber,
      profileImageUrl: placeholderProfileImageUrl,
      programmeId: values.programmeId,
      level: values.level,
      admissionYear: values.admissionYear,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="mx-auto w-full max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-blue-700">
            Student Registration
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Create student account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Select your academic programme and complete your profile.
          </p>
        </div>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(handleRegisterStudent)}
        >
          <Input
            label="Email address"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Matric number"
            error={errors.matricNumber?.message}
            {...register("matricNumber")}
          />

          <Input
            label="Phone number"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />

          <Input
            label="First name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />

          <Input
            label="Last name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />

          <Input
            label="Other name"
            error={errors.otherName?.message}
            {...register("otherName")}
          />

          <Select
            label="Gender"
            error={errors.gender?.message}
            {...register("gender")}
          >
            <option value="">Select gender</option>
            {genderOptions.map((gender) => (
              <option key={gender} value={gender}>
                {genderLabels[gender]}
              </option>
            ))}
          </Select>

          <Input
            label="Date of birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />

          <Input
            label="Admission year"
            type="number"
            error={errors.admissionYear?.message}
            {...register("admissionYear", { valueAsNumber: true })}
          />

          <Select
            label="Faculty"
            error={errors.facultyId?.message}
            disabled={isLoadingFaculties}
            {...register("facultyId", {
              onChange: () => {
                setValue("departmentId", "");
                setValue("programmeId", "");
              },
            })}
          >
            <option value="">Select faculty</option>
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
            {...register("departmentId", {
              onChange: () => {
                setValue("programmeId", "");
              },
            })}
          >
            <option value="">Select department</option>
            {filteredDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {formatDepartmentName(department.name)}
              </option>
            ))}
          </Select>

          <Select
            label="Programme"
            error={errors.programmeId?.message}
            disabled={isLoadingProgrammes}
            {...register("programmeId")}
          >
            <option value="">Select programme</option>
            {filteredProgrammes.map((programme) => (
              <option key={programme.id} value={programme.id}>
                {formatProgrammeName(programme.name, programme.award)}
              </option>
            ))}
          </Select>

          <Input
            label="Level"
            type="number"
            min={100}
            step={100}
            error={errors.level?.message}
            {...register("level", { valueAsNumber: true })}
          />

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              isLoading={registerStudentMutation.isPending}
            >
              Create account
            </Button>

            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link className="font-semibold text-blue-700" to="/">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Card>
    </main>
  );
}

export default RegisterStudentPage;
