import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { OrganizationUserRepository } from "../../../repositories/organizationUser.repository";
import { OrganizationUserService } from "../../../services/organizationUser.service";
import { CreateOrganizationDTO, LoginUserDTO } from "../../../dtos/user.dto";
import { HttpError } from "../../../errors/http-error";
import { BloodInventoryModel } from "../../../models/bloodInventory.model";
import { CampaignModel } from "../../../models/campaign.model";
import { DonorUserModel } from "../../../models/DonorUser.model";

const { v4: mockUuid } = require("../../__mocks__/uuid");

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../models/bloodInventory.model");
jest.mock("../../../models/campaign.model");
jest.mock("../../../models/DonorUser.model");

describe("OrganizationUser Service Unit test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerOrganization", () => {
    test("should register a new organization successfully", async () => {
      const orgId = mockUuid();
      const orgData: Partial<CreateOrganizationDTO> = {
        organizationName: "Blood Bank XYZ",
        headOfOrganization: "Jane Doe",
        email: "org@test.com",
        password: "password123",
        phoneNumber: "9876543210",
        address: "456 Hospital Lane",
      };
      const hashedPassword = "hashedPassword123";

      jest.spyOn(OrganizationUserRepository.prototype, "getOrganizationByEmail").mockResolvedValue(null as never);
      jest.spyOn(OrganizationUserRepository.prototype, "createOrganization").mockResolvedValue({
        _id: orgId,
        ...orgData,
        password: hashedPassword,
        userType: "organization",
      } as never);
      (bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.registerOrganization(
        orgData as CreateOrganizationDTO
      );

      expect(bcryptjs.hash).toHaveBeenCalledWith("password123", 10);
      expect(result).toHaveProperty("_id");
    });

    test("should throw error if email already exists", async () => {
      const orgData: Partial<CreateOrganizationDTO> = {
        email: "existing@test.com",
        password: "password123",
      };

      jest.spyOn(OrganizationUserRepository.prototype, "getOrganizationByEmail").mockResolvedValue({
        _id: "existing-id",
      } as never);

      const organizationUserService = new OrganizationUserService();
      await expect(
        organizationUserService.registerOrganization(orgData as CreateOrganizationDTO)
      ).rejects.toThrow(HttpError);
    });
  });

  describe("loginOrganization", () => {
    test("should login organization successfully with valid credentials", async () => {
      const orgId = mockUuid();
      const loginData: LoginUserDTO = {
        email: "org@test.com",
        password: "password123",
      };
      const mockOrg = {
        _id: orgId,
        email: "org@test.com",
        password: "hashedPassword123",
        organizationName: "Blood Bank XYZ",
        headOfOrganization: "Jane Doe",
        userType: "organization",
        phoneNumber: "9876543210",
        address: "456 Hospital Lane",
        profilePicture: "org-pic.jpg",
      };
      const mockToken = "mock-jwt-token";

      jest.spyOn(OrganizationUserRepository.prototype, "getOrganizationByEmail").mockResolvedValue(mockOrg as never);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.loginOrganization(loginData);

      expect(bcryptjs.compare).toHaveBeenCalledWith(loginData.password, mockOrg.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBe(mockToken);
      expect(result.organization).toHaveProperty("email", "org@test.com");
    });

    test("should throw error if organization not found", async () => {
      const loginData: LoginUserDTO = {
        email: "notfound@test.com",
        password: "password123",
      };

      jest.spyOn(OrganizationUserRepository.prototype, "getOrganizationByEmail").mockResolvedValue(null as never);

      const organizationUserService = new OrganizationUserService();
      await expect(organizationUserService.loginOrganization(loginData)).rejects.toThrow(HttpError);
    });

    test("should throw error if password is invalid", async () => {
      const loginData: LoginUserDTO = {
        email: "org@test.com",
        password: "wrongpassword",
      };
      const mockOrg = {
        _id: mockUuid(),
        email: "org@test.com",
        password: "hashedPassword123",
      };

      jest.spyOn(OrganizationUserRepository.prototype, "getOrganizationByEmail").mockResolvedValue(mockOrg as never);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      const organizationUserService = new OrganizationUserService();
      await expect(organizationUserService.loginOrganization(loginData)).rejects.toThrow(HttpError);
    });
  });

  describe("getAllOrganizations", () => {
    test("should return all organizations", async () => {
      const mockOrgs: any[] = [
        { _id: mockUuid(), organizationName: "Org 1" },
        { _id: mockUuid(), organizationName: "Org 2" },
      ];

      jest.spyOn(OrganizationUserRepository.prototype, "getAllOrganizations").mockResolvedValue(mockOrgs as never);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.getAllOrganizations();

      expect(result).toEqual(mockOrgs);
    });
  });

  describe("getOrganizationById", () => {
    test("should return organization by id", async () => {
      const orgId = mockUuid();
      const mockOrg: any = { _id: orgId, organizationName: "Blood Bank XYZ" };

      jest.spyOn(OrganizationUserRepository.prototype, "getOrganizationById").mockResolvedValue(mockOrg as never);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.getOrganizationById(orgId);

      expect(result).toEqual(mockOrg);
    });

    test("should throw error if organization not found", async () => {
      const orgId = mockUuid();

      jest.spyOn(OrganizationUserRepository.prototype, "getOrganizationById").mockResolvedValue(null as never);

      const organizationUserService = new OrganizationUserService();
      await expect(organizationUserService.getOrganizationById(orgId)).rejects.toThrow(HttpError);
    });
  });

  describe("updateOrganization", () => {
    test("should update organization without password", async () => {
      const orgId = mockUuid();
      const updateData = { organizationName: "Updated Org Name" };
      const updatedOrg: any = { _id: orgId, ...updateData };

      jest.spyOn(OrganizationUserRepository.prototype, "updateOrganization").mockResolvedValue(updatedOrg as never);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.updateOrganization(orgId, updateData);

      expect(result).toEqual(updatedOrg);
    });

    test("should hash password when updating organization password", async () => {
      const orgId = mockUuid();
      const updateData = { organizationName: "Updated Org", password: "newPassword123" };
      const hashedPassword = "hashedNewPassword";
      const updatedOrg: any = {
        _id: orgId,
        organizationName: "Updated Org",
        password: hashedPassword,
      };

      (bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(OrganizationUserRepository.prototype, "updateOrganization").mockResolvedValue(updatedOrg as never);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.updateOrganization(orgId, updateData);

      expect(bcryptjs.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(result).toEqual(updatedOrg);
    });

    test("should throw error if organization not found during update", async () => {
      const orgId = mockUuid();
      const updateData = { organizationName: "Updated Org Name" };

      jest.spyOn(OrganizationUserRepository.prototype, "updateOrganization").mockResolvedValue(null as never);

      const organizationUserService = new OrganizationUserService();
      await expect(organizationUserService.updateOrganization(orgId, updateData)).rejects.toThrow(HttpError);
    });
  });

  describe("updateOrganizationProfilePicture", () => {
    test("should update organization profile picture", async () => {
      const orgId = mockUuid();
      const filename = "org-profile.jpg";
      const updatedOrg: any = { _id: orgId, profilePicture: filename };

      jest.spyOn(OrganizationUserRepository.prototype, "updateOrganization").mockResolvedValue(updatedOrg as never);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.updateOrganizationProfilePicture(orgId, filename);

      expect(result).toEqual(updatedOrg);
    });

    test("should throw error if organization not found when updating profile picture", async () => {
      const orgId = mockUuid();
      const filename = "org-profile.jpg";

      jest.spyOn(OrganizationUserRepository.prototype, "updateOrganization").mockResolvedValue(null as never);

      const organizationUserService = new OrganizationUserService();
      await expect(
        organizationUserService.updateOrganizationProfilePicture(orgId, filename)
      ).rejects.toThrow(HttpError);
    });
  });

  describe("getDashboardStats", () => {
    test("should return dashboard statistics successfully", async () => {
      const orgId = mockUuid();
      const mockInventoryItems = [{ quantity: 5 }, { quantity: 10 }];

      (BloodInventoryModel.find as jest.Mock).mockResolvedValue(mockInventoryItems);
      (CampaignModel.countDocuments as jest.Mock).mockResolvedValue(3);
      (DonorUserModel.countDocuments as jest.Mock).mockResolvedValue(50);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.getDashboardStats(orgId);

      expect(BloodInventoryModel.find).toHaveBeenCalledWith({ organization: orgId });
      expect(CampaignModel.countDocuments).toHaveBeenCalledWith({ organization: orgId });
      expect(DonorUserModel.countDocuments).toHaveBeenCalledWith({});
      expect(result.success).toBe(true);
      expect(result.data.totalBloodUnits).toBe(15);
      expect(result.data.totalCampaigns).toBe(3);
      expect(result.data.totalDonorsCount).toBe(50);
    });

    test("should handle error when fetching dashboard stats", async () => {
      const orgId = mockUuid();
      const error = new Error("Database error");

      (BloodInventoryModel.find as jest.Mock).mockRejectedValue(error);

      const organizationUserService = new OrganizationUserService();
      await expect(organizationUserService.getDashboardStats(orgId)).rejects.toThrow(HttpError);
    });

    test("should return zero stats when no data exists", async () => {
      const orgId = mockUuid();

      (BloodInventoryModel.find as jest.Mock).mockResolvedValue([]);
      (CampaignModel.countDocuments as jest.Mock).mockResolvedValue(0);
      (DonorUserModel.countDocuments as jest.Mock).mockResolvedValue(0);

      const organizationUserService = new OrganizationUserService();
      const result = await organizationUserService.getDashboardStats(orgId);

      expect(result.data.totalBloodUnits).toBe(0);
      expect(result.data.totalCampaigns).toBe(0);
      expect(result.data.totalDonorsCount).toBe(0);
    });
  });
});
