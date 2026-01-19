import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateOrganizationDTO, LoginUserDTO } from "../dtos/user.dto";
import { OrganizationUserRepository } from "../repositories/organizationUser.repository";
import { IOrganizationUser } from "../models/OrganizationUser.model";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";

const organizationUserRepository = new OrganizationUserRepository();

export class OrganizationUserService {
  // Register organization
  async registerOrganization(orgData: CreateOrganizationDTO) {
    // Check if email exists
    const existing = await organizationUserRepository.getOrganizationByEmail(orgData.email);
    if (existing) {
      throw new HttpError(409, "Email already in use");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(orgData.password, 10);
    orgData.password = hashedPassword;

    // Remove confirmPassword and add userType before saving
    const { confirmPassword, ...dataToSave } = orgData;
    const orgWithUserType = { ...dataToSave, userType: "organization" as const };

    const newOrg = await organizationUserRepository.createOrganization(orgWithUserType);
    return newOrg;
  }

  // Login organization
  async loginOrganization(loginData: LoginUserDTO) {
    const org = await organizationUserRepository.getOrganizationByEmail(loginData.email);
    if (!org) throw new HttpError(404, "Organization not found");

    const validPassword = await bcryptjs.compare(loginData.password, org.password || "");
    if (!validPassword) throw new HttpError(401, "Invalid credentials");

    const sendOrg ={
      id: org._id,
      email:  org.email,
      organizationName: org.organizationName,
      userType: org.userType,
      phoneNumber: org.phoneNumber,
      address: org.address,
    }
    const payload = {
      id: org._id,
      email: org.email,
      organizationName: org.organizationName,
      userType: org.userType,
    };

    const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1h" });
    return { token, organization: sendOrg };
  }

  // Get all organizations
  async getAllOrganizations() {
    return await organizationUserRepository.getAllOrganizations();
  }

  // Get organization by ID
  async getOrganizationById(id: string) {
    const org = await organizationUserRepository.getOrganizationById(id);
    if (!org) throw new HttpError(404, "Organization not found");
    return org;
  }

  // Update organization
  async updateOrganization(id: string, updates: Partial<CreateOrganizationDTO>) {
    if (updates.password) {
      updates.password = await bcryptjs.hash(updates.password, 10);
    }
    const updatedOrg = await organizationUserRepository.updateOrganization(id, updates);
    if (!updatedOrg) throw new HttpError(404, "Organization not found");
    return updatedOrg;
  }
}
