import { IDonorUser, DonorUserModel } from "../models/DonorUser.model";

export interface IDonorUserRepository {
  createDonor(donorData: Partial<IDonorUser>): Promise<IDonorUser>;
  getDonorByEmail(email: string): Promise<IDonorUser | null>;
  getDonorById(id: string): Promise<IDonorUser | null>;
  getAllDonors(): Promise<IDonorUser[]>;
  getAllDonorsPaginated(skip: number, limit: number): Promise<{ data: IDonorUser[]; total: number }>;
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

  async getAllDonorsPaginated(skip: number, limit: number): Promise<{ data: IDonorUser[]; total: number }> {
    const data = await DonorUserModel.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await DonorUserModel.countDocuments();
    return { data, total };
  }

  async updateDonor(id: string, updateData: Partial<IDonorUser>): Promise<IDonorUser | null> {
    return await DonorUserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteDonor(id: string): Promise<boolean> {
    const result = await DonorUserModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
