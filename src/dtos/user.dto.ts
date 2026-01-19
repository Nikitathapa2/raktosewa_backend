import { z } from "zod";
import { DonorUserSchema, OrganizationUserSchema } from "../types/user.type";

// DTO without userType - will be automatically set by the server
export const CreateDonorDTO = DonorUserSchema.omit({ userType: true }).extend({
  confirmPassword: z.string().min(6, "Confirm password is required"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CreateDonorDTO = z.infer<typeof CreateDonorDTO>;


// DTO without userType - will be automatically set by the server
export const CreateOrganizationDTO = OrganizationUserSchema.omit({ userType: true }).extend({
  confirmPassword: z.string().min(6, "Confirm password is required"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CreateOrganizationDTO = z.infer<typeof CreateOrganizationDTO>;


export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
