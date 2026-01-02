import { IOrganizationUser, OrganizationUserModel } from "../models/OrganizationUser.model";

export interface IOrganizationUserRepository {
  createOrganization(orgData: Partial<IOrganizationUser>): Promise<IOrganizationUser>;
  getOrganizationByEmail(email: string): Promise<IOrganizationUser | null>;
  getOrganizationById(id: string): Promise<IOrganizationUser | null>;
  getAllOrganizations(): Promise<IOrganizationUser[]>;
  updateOrganization(id: string, updateData: Partial<IOrganizationUser>): Promise<IOrganizationUser | null>;
  deleteOrganization(id: string): Promise<boolean>;
}

export class OrganizationUserRepository implements IOrganizationUserRepository {
  async createOrganization(orgData: Partial<IOrganizationUser>): Promise<IOrganizationUser> {
    const organization = new OrganizationUserModel(orgData);
    await organization.save();
    return organization;
  }

  async getOrganizationByEmail(email: string): Promise<IOrganizationUser | null> {
    return await OrganizationUserModel.findOne({ email });
  }

  async getOrganizationById(id: string): Promise<IOrganizationUser | null> {
    return await OrganizationUserModel.findById(id);
  }

  async getAllOrganizations(): Promise<IOrganizationUser[]> {
    return await OrganizationUserModel.find();
  }

  async updateOrganization(id: string, updateData: Partial<IOrganizationUser>): Promise<IOrganizationUser | null> {
    return await OrganizationUserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const result = await OrganizationUserModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
