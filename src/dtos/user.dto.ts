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


/* ----------------------------------
   Admin-specific DTOs for creating users
   Simpler than public registration (no confirmPassword, no terms required)
   For admin creating users through admin panel
----------------------------------- */
export const AdminCreateDonorDTO = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),

  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  role: z.enum(["user", "admin"]).optional().default("user"),
  userType: z.literal("donor"),
  profilePicture: z.string().optional(),
});

export type AdminCreateDonorDTO = z.infer<typeof AdminCreateDonorDTO>;

export const AdminCreateOrganizationDTO = z.object({
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  headOfOrganization: z.string().min(2, "Head of organization is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(1, "Phone number is required for organizations"),
  address: z.string().min(1, "Address is required for organizations"),
  role: z.enum(["user", "admin"]).optional().default("user"),
  userType: z.literal("organization"),
  profilePicture: z.string().optional(),
});

export type AdminCreateOrganizationDTO = z.infer<typeof AdminCreateOrganizationDTO>;

/* ----------------------------------
   Combined DTO for admin user creation
   Used by admin endpoints to create both donor and org users
----------------------------------- */
export const AdminCreateUserDTO = z.union([
  AdminCreateDonorDTO,
  AdminCreateOrganizationDTO,
]);

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;


export const LoginUserDTO = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;


/* ----------------------------------
   Admin User Creation DTO (Public Registration)
   For admin creating users (Donors or Organizations)
   Password does not need confirmation from admin
----------------------------------- */
export const CreateUserDTO = z.union([
  CreateDonorDTO,
  CreateOrganizationDTO,
]);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;


/* ----------------------------------
   Admin User Update DTO
   For admin updating user information
   Optional fields - only update what is provided
----------------------------------- */
export const UpdateUserDTO = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  profilePicture: z.string().optional(),
  
  // Donor-specific fields (optional)
  fullName: z.string().min(2).optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  dateOfBirth: z.string().optional(),
  
  // Organization-specific fields (optional)
  organizationName: z.string().min(2).optional(),
  headOfOrganization: z.string().min(2).optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;


/* ----------------------------------
   User Profile Update DTO
   For logged-in users to update their own profile
   Less restrictive than admin updates
----------------------------------- */
export const UpdateProfileDTO = z.object({
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  profilePicture: z.string().optional(),
  
  // Donor-specific fields
  fullName: z.string().min(2).optional(),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  
  // Organization-specific fields
  organizationName: z.string().min(2).optional(),
  headOfOrganization: z.string().min(2).optional(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileDTO>;
