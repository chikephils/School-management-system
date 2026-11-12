import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";

import {
  updateStudentSchema,
  type UpdateStudentFormValues,
} from "../schemas/updateSchema";

import type { StudentProfile } from "../api/studentsApi";

import {
  formatDepartmentName,
  formatFacultyName,
} from "../../academics/constants/academicNames";

import type { Faculty } from "../../academics/api/facultiesApi";
import type { Department } from "../../academics/api/departmentsApi";
import type { Programme } from "../../academics/api/programmeApi";
import { formatProgrammeName } from "../../academics/constants/programmeAwards";
import {
  genderLabels,
  genderOptions,
} from "../../auth/constants/genderOptions";

type EditStudentModalProps = {
  student: StudentProfile;
  faculties: Faculty[];
  departments: Department[];
  programmes: Programme[];
  onClose: () => void;
  onSave: (values: UpdateStudentFormValues) => void;
  isSaving?: boolean;
};

function EditStudentModal({
  student,
  faculties,
  departments,
  programmes,
  onClose,
  onSave,
  isSaving = false,
}: EditStudentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<UpdateStudentFormValues>({
    resolver: zodResolver(updateStudentSchema),
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
      return [];
    }

    return departments.filter(
      (department) => department.faculty?.id === selectedFacultyId,
    );
  }, [departments, selectedFacultyId]);

  const filteredProgrammes = useMemo(() => {
    if (!selectedDepartmentId) {
      return [];
    }

    return programmes.filter(
      (programme) => programme.department?.id === selectedDepartmentId,
    );
  }, [programmes, selectedDepartmentId]);

  useEffect(() => {
    reset({
      matricNumber: student.matricNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      otherName: student.otherName ?? "",
      gender: student.gender,
      dateOfBirth: student.dateOfBirth.split("T")[0],
      phoneNumber: student.phoneNumber,

      facultyId: student.facultyId ?? "",
      departmentId: student.departmentId ?? "",
      programmeId: student.programmeId ?? "",

      level: student.level,
      admissionYear: student.admissionYear,
    });
  }, [student, reset]);

  const handleFacultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = event.target.value;

    setValue("facultyId", facultyId);
    setValue("departmentId", "");
    setValue("programmeId", "");
  };

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const departmentId = event.target.value;

    setValue("departmentId", departmentId);
    setValue("programmeId", "");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Edit Student
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the student's information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer rounded-md p-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Matric Number
                </label>

                <input
                  {...register("matricNumber")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.matricNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.matricNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  First Name
                </label>

                <input
                  {...register("firstName")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Last Name
                </label>

                <input
                  {...register("lastName")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Other Name
                </label>

                <input
                  {...register("otherName")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.otherName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.otherName.message}
                  </p>
                )}
              </div>

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

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date of Birth
                </label>

                <input
                  {...register("dateOfBirth")}
                  type="date"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.dateOfBirth && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>

                <input
                  {...register("phoneNumber")}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <Select
                label="Faculty"
                value={selectedFacultyId ?? ""}
                onChange={handleFacultyChange}
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
                value={selectedDepartmentId ?? ""}
                onChange={handleDepartmentChange}
              >
                <option value="">Select department</option>

                {filteredDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {formatDepartmentName(department.name)}
                  </option>
                ))}
              </Select>

              <Select label="Programme" {...register("programmeId")}>
                <option value="">Select programme</option>

                {filteredProgrammes.map((programme) => (
                  <option key={programme.id} value={programme.id}>
                    {formatProgrammeName(programme.name, programme.award)}
                  </option>
                ))}
              </Select>

              <Select
                label="Level"
                {...register("level", {
                  valueAsNumber: true,
                })}
              >
                <option value="">Select level</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
              </Select>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Admission Year
                </label>

                <input
                  {...register("admissionYear", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                {errors.admissionYear && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.admissionYear.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentModal;
