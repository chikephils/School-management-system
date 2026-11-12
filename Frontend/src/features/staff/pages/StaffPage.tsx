import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { getDepartments } from "../../academics/api/departmentsApi";
import { getFaculties } from "../../academics/api/facultiesApi";
import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";
import Card from "../../../components/ui/Card";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { getApiErrorMessage } from "../../../lib/api/getApiErrorMessage";
import type { UserRole } from "../../../types/auth";
import { getStaff } from "../api/staffApi";
import { Link } from "react-router-dom";
import EditStaffModal from "../components/EditStaffModal";
import {
  updateStaff,
  type StaffProfile,
  type UpdateStaffRequest,
} from "../api/staffApi";
import toast from "react-hot-toast";

type StaffRole = Exclude<UserRole, "STUDENT">;

const staffRoleOptions: StaffRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "DEPARTMENT_ADMIN",
  "LECTURER",
];

const staffRoleLabels: Record<StaffRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  LECTURER: "Lecturer",
};

function formatStaffRole(role: UserRole) {
  if (role === "STUDENT") {
    return "Student";
  }

  return staffRoleLabels[role];
}

function StaffPage() {
  const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
  const [role, setRole] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");

  const queryClient = useQueryClient();

  const { data: faculties = [] } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => getFaculties(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartments(),
  });

  const {
    data: staff = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["staff", role, faculty, department],
    queryFn: () =>
      getStaff({
        role: role ? (role as UserRole) : undefined,
        faculty: faculty || undefined,
        department: department || undefined,
      }),
  });

  const updateStaffMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateStaffRequest }) =>
      updateStaff(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["staff"] });
      setEditingStaff(null);
      toast.success("Staff updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const filteredDepartments = useMemo(() => {
    if (!faculty) {
      return departments;
    }

    return departments.filter(
      (departmentItem) => departmentItem.faculty?.name === faculty,
    );
  }, [departments, faculty]);

  const hasActiveFilters = Boolean(role || faculty || department);

  const clearFilters = () => {
    setRole("");
    setFaculty("");
    setDepartment("");
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">
            Staff
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            View admins, department admins, lecturers, and staff records.
          </p>
        </div>

        <Link
          to="/staff/register"
          className="inline-flex w-fit items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Register Staff
        </Link>
      </div>

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="">All Roles</option>
            {staffRoleOptions.map((item) => (
              <option key={item} value={item}>
                {staffRoleLabels[item]}
              </option>
            ))}
          </Select>

          <Select
            label="Faculty"
            value={faculty}
            onChange={(event) => {
              setFaculty(event.target.value);
              setDepartment("");
            }}
          >
            <option value="">All Faculties</option>
            {faculties.map((item) => (
              <option key={item.id} value={item.name}>
                {formatFacultyName(item.name)}
              </option>
            ))}
          </Select>

          <Select
            label="Department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="">All departments</option>
            {filteredDepartments.map((item) => (
              <option key={item.id} value={item.name}>
                {formatDepartmentName(item.name)}
              </option>
            ))}
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              className="cursor-pointer"
              type="button"
              variant="secondary"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading && (
          <Card className="flex-h-full min-h-40">
            <p className="text-sm text-slate-600">Loading staff...</p>
          </Card>
        )}

        {isError && (
          <Card className="flex-h-full min-h-40">
            <p className="text-sm text-red-600">{getApiErrorMessage(error)}</p>
          </Card>
        )}

        {!isLoading && !isError && staff.length === 0 && (
          <Card className="flex-h-full min-h-40">
            <p className="text-sm text-slate-600">No staff found.</p>
          </Card>
        )}

        {!isLoading &&
          !isError &&
          staff?.map((member) => (
            <Card key={member.id} className="flex-h-full min-h-40">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-700">
                  {member?.staffNumber}
                </p>

                <h2 className="mt-2 text-base font-semibold text-slate-950">
                  {member?.title} {member?.firstName} {member?.otherName ?? ""}{" "}
                  {member?.lastName}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    {formatStaffRole(member?.user.role)}
                  </span>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {member?.user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Faculty:{" "}
                  <span className="font-medium">
                    {member.faculty
                      ? formatFacultyName(member.faculty)
                      : "No Faculty"}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Department:{" "}
                  <span className="font-medium">
                    {member.department
                      ? formatDepartmentName(member.department)
                      : "No department"}
                  </span>
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  Email:{" "}
                  <span className="font-medium">{member?.user.email}</span>
                </p>
                <div className="mt-auto flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setEditingStaff(member)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>
      <EditStaffModal
        isOpen={Boolean(editingStaff)}
        staff={editingStaff}
        isSaving={updateStaffMutation.isPending}
        onClose={() => setEditingStaff(null)}
        onSubmit={(id, values) => updateStaffMutation.mutate({ id, values })}
      />
    </section>
  );
}

export default StaffPage;
