import { CreateUserDTO, AdminCreateUserDTO, UpdateUserDTO, UpdateProfileDTO } from "../../dtos/user.dto";
import { DonorUserRepository } from "../../repositories/donorUser.repository";
import { OrganizationUserRepository } from "../../repositories/organizationUser.repository";
import { AdminUserRepository } from "../../repositories/adminUser.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../../errors/http-error";

const donorRepository = new DonorUserRepository();
const organizationRepository = new OrganizationUserRepository();
const adminRepository = new AdminUserRepository();

export class AdminUserService {
  async getAdminProfile(adminId: string) {
    const admin = await adminRepository.getAdminById(adminId);

    if (!admin) {
      throw new HttpError(404, "Admin not found");
    }

    return {
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  async changeAdminPassword(adminId: string, currentPassword: string, newPassword: string) {
    const admin = await adminRepository.getAdminById(adminId);

    if (!admin) {
      throw new HttpError(404, "Admin not found");
    }

    const isMatch = await bcryptjs.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new HttpError(400, "Current password is incorrect");
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await adminRepository.updateAdminById(adminId, { password: hashedPassword });

    return { success: true };
  }

  /* ----------------------------------
     Create User (Donor or Organization)
  ----------------------------------- */
  async createUser(data: CreateUserDTO | AdminCreateUserDTO) {
    const { email, password } = data;
    const userType = (data as any).userType;

    // Check email uniqueness across both collections
    const donorExists = await donorRepository.getDonorByEmail(email);
    const orgExists = await organizationRepository.getOrganizationByEmail(email);

    if (donorExists || orgExists) {
      throw new HttpError(409, "Email already in use");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    try {
      if (userType === "donor") {
        const newDonor = await donorRepository.createDonor({
          ...data,
          password: hashedPassword,
        });
        return newDonor;
      } else if (userType === "organization") {
        const newOrg = await organizationRepository.createOrganization({
          ...data,
          password: hashedPassword,
        });
        return newOrg;
      } else {
        throw new HttpError(400, "Invalid userType. Must be 'donor' or 'organization'");
      }
    } catch (error: any) {
      throw new HttpError(
        error.statusCode || 500,
        error.message || "Error creating user"
      );
    }
  }

  /* ----------------------------------
     Create Admin User
  ----------------------------------- */
    async createAdminUser(email: string, password: string) {
      // Check if admin already exists
      const existing = await adminRepository.getAdminByEmail(email);
      if (existing) {
        throw new HttpError(409, "Admin email already in use");
      }
      const hashedPassword = await bcryptjs.hash(password, 10);
      const newAdmin = await adminRepository.createAdmin({
        email,
        password: hashedPassword,
        role: "admin",
      });
      return newAdmin;
    }

  /* ----------------------------------
     Authenticate Admin (Login)
  ----------------------------------- */
  async authenticateAdmin(email: string, password: string) {
    const admin = await adminRepository.getAdminByEmail(email);
    if (!admin) {
      throw new HttpError(401, "Invalid admin credentials");
    }
    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) {
      throw new HttpError(401, "Invalid admin credentials");
    }
    return admin;
  }

  /* ----------------------------------
     Get All Users (Both Donors and Organizations)
  ----------------------------------- */
  async getAllUsers() {
    try {
      const donors = await donorRepository.getAllDonors();
      const organizations = await organizationRepository.getAllOrganizations();

      // Combine both arrays and sort by createdAt if available
      const allUsers = [...donors, ...organizations].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      return allUsers;
    } catch (error: any) {
      throw new HttpError(
        error.statusCode || 500,
        error.message || "Error retrieving users"
      );
    }
  }

  /* ----------------------------------
     Get Paginated Users (Both Donors and Organizations)
  ----------------------------------- */
  async getAllUsersPaginated(page: number = 1, limit: number = 10) {
    try {
      // Get paginated donors and organizations
      const donorsResult = await donorRepository.getAllDonorsPaginated(
        (page - 1) * limit,
        limit
      );
      const orgsResult = await organizationRepository.getAllOrganizationsPaginated(
        (page - 1) * limit,
        limit
      );

      // Combine results
      const allUsers = [...donorsResult.data, ...orgsResult.data].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      const totalItems = donorsResult.total + orgsResult.total;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: allUsers,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error: any) {
      throw new HttpError(
        error.statusCode || 500,
        error.message || "Error retrieving users"
      );
    }
  }

  /* ----------------------------------
     Get User by ID
  ----------------------------------- */
  async getUserById(id: string) {
    try {
      // Try to find in both collections
      const donor = await donorRepository.getDonorById(id);
      if (donor) return donor;

      const organization = await organizationRepository.getOrganizationById(id);
      if (organization) return organization;

      throw new HttpError(404, "User not found");
    } catch (error: any) {
      throw new HttpError(
        error.statusCode || 500,
        error.message || "Error retrieving user"
      );
    }
  }

  /* ----------------------------------
     Update User (Donor or Organization)
  ----------------------------------- */
  async updateUser(id: string, updateData: UpdateUserDTO) {
    try {
      // Check if user exists in either collection
      const donor = await donorRepository.getDonorById(id);
      if (donor) {
        // Hash password if provided
        if (updateData.password) {
          updateData.password = await bcryptjs.hash(updateData.password, 10);
        }
        const updated = await donorRepository.updateDonor(id, updateData);
        if (!updated) {
          throw new HttpError(404, "Donor not found");
        }
        return updated;
      }

      const organization = await organizationRepository.getOrganizationById(id);
      if (organization) {
        // Hash password if provided
        if (updateData.password) {
          updateData.password = await bcryptjs.hash(updateData.password, 10);
        }
        const updated = await organizationRepository.updateOrganization(id, updateData);
        if (!updated) {
          throw new HttpError(404, "Organization not found");
        }
        return updated;
      }

      throw new HttpError(404, "User not found");
    } catch (error: any) {
      throw new HttpError(
        error.statusCode || 500,
        error.message || "Error updating user"
      );
    }
  }

  /* ----------------------------------
     Delete User (Donor or Organization)
  ----------------------------------- */
  async deleteUser(id: string) {
    try {
      // Try to find and delete from donor collection
      const donor = await donorRepository.getDonorById(id);
      if (donor) {
        const deleted = await donorRepository.deleteDonor(id);
        return deleted;
      }

      // Try to find and delete from organization collection
      const organization = await organizationRepository.getOrganizationById(id);
      if (organization) {
        const deleted = await organizationRepository.deleteOrganization(id);
        return deleted;
      }

      throw new HttpError(404, "User not found");
    } catch (error: any) {
      throw new HttpError(
        error.statusCode || 500,
        error.message || "Error deleting user"
      );
    }
  }

  /* ----------------------------------
     Update User's Own Profile
     Called by logged-in user via PUT /api/auth/:id
  ----------------------------------- */
  async updateUserProfile(userId: string, updateData: UpdateProfileDTO) {
    try {
      // Check if user is updating their own profile
      const donor = await donorRepository.getDonorById(userId);
      if (donor) {
        const updated = await donorRepository.updateDonor(userId, updateData);
        if (!updated) {
          throw new HttpError(404, "User profile not found");
        }
        return updated;
      }

      const organization = await organizationRepository.getOrganizationById(userId);
      if (organization) {
        const updated = await organizationRepository.updateOrganization(userId, updateData);
        if (!updated) {
          throw new HttpError(404, "User profile not found");
        }
        return updated;
      }

      throw new HttpError(404, "User not found");
    } catch (error: any) {
      throw new HttpError(
        error.statusCode || 500,
        error.message || "Error updating user profile"
      );
    }
  }
}