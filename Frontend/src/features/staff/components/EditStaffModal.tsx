import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getDepartments } from "../../academics/api/departmentsApi";
import { getFaculties } from "../../academics/api/facultiesApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import {
  staffRegistrationRoleLabels,
  staffRegistrationRoles,
  staffTitleLabels,
  staffTitles,
} from "../constants/staffOptions";
import type { StaffProfile, UpdateStaffRequest } from "../api/staffApi";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const updateStaffSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    staffNumber: z.string().min(1, "Staff number is required"),
    title: z.enum(staffTitles),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    otherName: z.string().optional(),
    role: z.enum(staffRegistrationRoles),
    faculty: z.string().optional(),
    department: z.string().optional(),
    phoneNumber: z.string().min(1, "Phone number is required"),
  })
  .superRefine((values, ctx) => {
    if (values.role === "ADMIN" && !values.faculty) {
      ctx.addIssue({
        code: "custom",
        path: ["faculty"],
        message: "Faculty admin must have a faculty",
      });
    }

    if (
      (values.role === "DEPARTMENT_ADMIN" || values.role === "LECTURER") &&
      (!values.faculty || !values.department)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["department"],
        message: "Department admin and lecturer need faculty and department",
      });
    }
  });

type UpdateStaffFormValues = z.infer<typeof updateStaffSchema>;

type EditStaffModalProps = {
  staff: StaffProfile | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (id: string, values: UpdateStaffRequest) => void;
};

function EditStaffModal({
  staff,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: EditStaffModalProps) {
  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => getFaculties(),
    enabled: isOpen,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateStaffFormValues>({
    resolver: zodResolver(updateStaffSchema),
  });

  const selectedRole = useWatch({ control, name: "role" });
  const selectedFaculty = useWatch({ control, name: "faculty" });

  const filteredDepartments = useMemo(() => {
    if (!selectedFaculty) return departments;

    return departments.filter(
      (department) => department.faculty?.name === selectedFaculty,
    );
  }, [departments, selectedFaculty]);

  useEffect(() => {
    if (!staff) return;

    reset({
      email: staff.user.email,
      staffNumber: staff.staffNumber,
      title: staff.title,
      firstName: staff.firstName,
      lastName: staff.lastName,
      otherName: staff.otherName ?? "",
      role: staff.user.role,
      faculty: staff.faculty ?? "",
      department: staff.department ?? "",
      phoneNumber: staff.phoneNumber,
    });
  }, [staff, reset]);

  if (!isOpen || !staff) return null;

  const submitForm = (values: UpdateStaffFormValues) => {
    onSubmit(staff.id, {
      ...values,
      otherName: values.otherName || undefined,
      faculty: values.role === "SUPER_ADMIN" ? null : values.faculty,
      department:
        values.role === "SUPER_ADMIN" || values.role === "ADMIN"
          ? null
          : values.department,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Edit Staff</h2>
            <p className="mt-1 text-sm text-slate-600">
              Update profile, role, and academic scope.
            </p>
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitForm)}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Email"
                error={errors.email?.message}
                {...register("email")}
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
                {staffTitles.map((title) => (
                  <option key={title} value={title}>
                    {staffTitleLabels[title]}
                  </option>
                ))}
              </Select>

              <Select
                label="Role"
                error={errors.role?.message}
                {...register("role")}
              >
                {staffRegistrationRoles.map((role) => (
                  <option key={role} value={role}>
                    {staffRegistrationRoleLabels[role]}
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

              {selectedRole !== "SUPER_ADMIN" && (
                <Select
                  label="Faculty"
                  error={errors.faculty?.message}
                  {...register("faculty", {
                    onChange: () => setValue("department", ""),
                  })}
                >
                  <option value="">Select faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.name}>
                      {formatFacultyName(faculty.name)}
                    </option>
                  ))}
                </Select>
              )}

              {selectedRole !== "SUPER_ADMIN" && selectedRole !== "ADMIN" && (
                <Select
                  label="Department"
                  error={errors.department?.message}
                  {...register("department")}
                >
                  <option value="">Select department</option>
                  {filteredDepartments.map((department) => (
                    <option key={department.id} value={department.name}>
                      {formatDepartmentName(department.name)}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button
              type="submit"
              className="cursor-pointer"
              isLoading={isSaving}
            >
              Save Changes
            </Button>

            <Button
              type="button"
              className="cursor-pointer"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStaffModal;
