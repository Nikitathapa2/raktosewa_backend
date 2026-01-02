import { IDonorUser, DonorUserModel } from "../models/DonorUser.model";

export interface IDonorUserRepository {
  createDonor(donorData: Partial<IDonorUser>): Promise<IDonorUser>;
  getDonorByEmail(email: string): Promise<IDonorUser | null>;
  getDonorById(id: string): Promise<IDonorUser | null>;
  getAllDonors(): Promise<IDonorUser[]>;
  updateDonor(id: string, updateData: Partial<IDonorUser>): Promise<IDonorUser | null>;
  deleteDonor(id: string): Promise<boolean>;
}

export class DonorUserRepository implements IDonorUserRepository {
  async createDonor(donorData: Partial<IDonorUser>): Promise<IDonorUser> {
    const donor = new DonorUserModel(donorData);
    await donor.save();
    return donor;
  }

  async getDonorByEmail(email: string): Promise<IDonorUser | null> {
    return await DonorUserModel.findOne({ email });
  }

  async getDonorById(id: string): Promise<IDonorUser | null> {
    return await DonorUserModel.findById(id);
  }

  async getAllDonors(): Promise<IDonorUser[]> {
    return await DonorUserModel.find();
  }

  async updateDonor(id: string, updateData: Partial<IDonorUser>): Promise<IDonorUser | null> {
    return await DonorUserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteDonor(id: string): Promise<boolean> {
    const result = await DonorUserModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
