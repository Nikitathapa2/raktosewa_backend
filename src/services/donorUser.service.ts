import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateDonorDTO, LoginUserDTO } from "../dtos/user.dto";
import { DonorUserRepository } from "../repositories/donorUser.repository";
import { IDonorUser } from "../models/DonorUser.model";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";

const donorUserRepository = new DonorUserRepository();

export class DonorUserService {
  // Register donor
  async registerDonor(donorData: CreateDonorDTO) {
    // Check if email exists
    const existing = await donorUserRepository.getDonorByEmail(donorData.email);
    if (existing) {
      throw new HttpError(409, "Email already in use");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(donorData.password, 10);
    donorData.password = hashedPassword;

    // Remove confirmPassword before saving
    const { confirmPassword, ...dataToSave } = donorData;

    const newDonor = await donorUserRepository.createDonor(dataToSave);
    return newDonor;
  }

  // Login donor
  async loginDonor(loginData: LoginUserDTO) {
    const donor = await donorUserRepository.getDonorByEmail(loginData.email);
    if (!donor) throw new HttpError(404, "Donor not found");

    const validPassword = await bcryptjs.compare(loginData.password, donor.password || "");
    if (!validPassword) throw new HttpError(401, "Invalid credentials");

    const payload = {
      id: donor._id,
      email: donor.email,
      fullName: donor.fullName,
      role: donor.role,
    };

    const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1h" });
    return { token, donor };
  }

  // Get all donors
  async getAllDonors() {
    return await donorUserRepository.getAllDonors();
  }

  // Get donor by ID
  async getDonorById(id: string) {
    const donor = await donorUserRepository.getDonorById(id);
    if (!donor) throw new HttpError(404, "Donor not found");
    return donor;
  }

  // Update donor
  async updateDonor(id: string, updates: Partial<CreateDonorDTO>) {
    if (updates.password) {
      updates.password = await bcryptjs.hash(updates.password, 10);
    }
    const updatedDonor = await donorUserRepository.updateDonor(id, updates);
    if (!updatedDonor) throw new HttpError(404, "Donor not found");
    return updatedDonor;
  }
}
