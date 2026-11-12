import { z } from "zod";
import { genderOptions } from "../constants/genderOptions";

export const registerStudentSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  matricNumber: z.string().min(1, "Matric number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  otherName: z.string().optional(),
  gender: z.enum(genderOptions, {
    message: "Please select gender",
  }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  facultyId: z.string().min(1, "Please select a faculty"),
  departmentId: z.string().min(1, "Please select a department"),
  programmeId: z.string().min(1, "Please select a programme"),
  level: z
    .number({ message: "Level is required" })
    .int("Level must be a whole number")
    .min(100, "Level must be at least 100"),
  admissionYear: z
    .number({ message: "Admission year is required" })
    .int("Admission year must be a whole number")
    .min(1900, "Admission year is invalid"),
});

export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>;
