import { z } from "zod";

const BaseUserSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  password: z.string().min(6),
  address: z.string().optional(),
  role: z.enum(["user", "admin"]).default("user"), // enum role
});


export const DonorUserSchema = BaseUserSchema.extend({
  fullName: z.string().min(2),
  bloodGroup: z.enum([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ]),
  dateOfBirth: z.string().optional(),
});

export type DonorUserType = z.infer<typeof DonorUserSchema>;


export const OrganizationUserSchema = BaseUserSchema.extend({
  organizationName: z.string().min(2),
  headOfOrganization: z.string().min(2),
});

export type OrganizationUserType = z.infer<typeof OrganizationUserSchema>;
