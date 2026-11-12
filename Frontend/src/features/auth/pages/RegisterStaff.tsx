import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getDepartments } from "../../academics/api/departmentsApi";
import { getFaculties } from "../../academics/api/facultiesApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import { registerStaff } from "../../auth/api/authApi";
import {
  registerStaffSchema,
  type RegisterStaffFormValues,
} from "../../auth/schemas/registerStaffSchema";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import {
  staffRegistrationRoleLabels,
  staffRegistrationRoles,
  staffTitleLabels,
  staffTitles,
} from "../../staff/constants/staffOptions";

const placeholderProfileImageUrl =
  "https://example.com/profile-placeholder.png";

function RegisterStaffPage() {
  const navigate = useNavigate();

  const { data: faculties = [], isLoading: isLoadingFaculties } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => getFaculties(),
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterStaffFormValues>({
    resolver: zodResolver(registerStaffSchema),
  });

  const selectedFaculty = useWatch({
    control,
    name: "faculty",
  });

  const filteredDepartments = useMemo(() => {
    if (!selectedFaculty) {
      return departments;
    }

    return departments.filter(
      (department) => department.faculty?.name === selectedFaculty,
    );
  }, [departments, selectedFaculty]);

  const registerStaffMutation = useMutation({
    mutationFn: registerStaff,
    onSuccess: () => {
      toast.success("Staff account created");
      navigate("/staff");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleRegisterStaff = (values: RegisterStaffFormValues) => {
    registerStaffMutation.mutate({
      email: values.email,
      password: values.password,
      staffNumber: values.staffNumber,
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      profileImageUrl: placeholderProfileImageUrl,
      otherName: values.otherName || undefined,
      role: values.role,
      faculty: values.faculty,
      department: values.department,
      phoneNumber: values.phoneNumber,
    });
  };

  return (
    <section>
      <PageHeader
        title="Register Staff"
        description="Create staff, admin, department admin, or lecturer accounts."
      />

      <Card className="max-w-4xl">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit(handleRegisterStaff)}
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
            label="Staff number"
            error={errors.staffNumber?.message}
            {...register("staffNumber")}
          />

          <Select
            label="Title"
            error={errors.title?.message}
            {...register("title")}
          >
            <option value="">Select title</option>
            {staffTitles.map((title) => (
              <option key={title} value={title}>
                {staffTitleLabels[title]}
              </option>
            ))}
          </Select>

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

          <Input
            label="Phone number"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />

          <Select
            label="Role"
            error={errors.role?.message}
            {...register("role")}
          >
            <option value="">Select role</option>
            {staffRegistrationRoles.map((role) => (
              <option key={role} value={role}>
                {staffRegistrationRoleLabels[role]}
              </option>
            ))}
          </Select>

          <Select
            label="Faculty"
            error={errors.faculty?.message}
            disabled={isLoadingFaculties}
            {...register("faculty", {
              onChange: () => {
                setValue("department", "");
              },
            })}
          >
            <option value="">Select faculty</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.name}>
                {formatFacultyName(faculty.name)}
              </option>
            ))}
          </Select>

          <Select
            label="Department"
            error={errors.department?.message}
            disabled={isLoadingDepartments}
            {...register("department")}
          >
            <option value="">Select department</option>
            {filteredDepartments.map((department) => (
              <option key={department.id} value={department.name}>
                {formatDepartmentName(department.name)}
              </option>
            ))}
          </Select>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              isLoading={registerStaffMutation.isPending}
            >
              Create Staff Account
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}

export default RegisterStaffPage;
