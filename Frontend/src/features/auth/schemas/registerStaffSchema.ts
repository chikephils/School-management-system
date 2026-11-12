import { z } from "zod";
import {
  staffRegistrationRoles,
  staffTitles,
} from "../../staff/constants/staffOptions";

export const registerStaffSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  staffNumber: z.string().min(1, "Staff number is required"),
  title: z.enum(staffTitles, {
    message: "Please select title",
  }),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  otherName: z.string().optional(),
  role: z.enum(staffRegistrationRoles, {
    message: "Please select staff role",
  }),
  faculty: z.string().optional(),
  department: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
});

export type RegisterStaffFormValues = z.infer<typeof registerStaffSchema>;
