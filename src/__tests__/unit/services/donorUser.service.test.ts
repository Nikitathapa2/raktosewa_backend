import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { DonorUserRepository } from "../../../repositories/donorUser.repository";
import { DonorUserService } from "../../../services/donorUser.service";
import { CreateDonorDTO, LoginUserDTO } from "../../../dtos/user.dto";
import { HttpError } from "../../../errors/http-error";

const { v4: mockUuid } = require("../../__mocks__/uuid");

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("DonorUser Service Unit test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerDonor", () => {
    test("should register a new donor successfully", async () => {
      const donorId = mockUuid();
      const donorData: Partial<CreateDonorDTO> = {
        fullName: "John Doe",
        email: "john@test.com",
        password: "password123",
        bloodGroup: "A+",
        phoneNumber: "1234567890",
        address: "123 Main St",
      };
      const hashedPassword = "hashedPassword123";

      jest.spyOn(DonorUserRepository.prototype, "getDonorByEmail").mockResolvedValue(null as never);
      jest.spyOn(DonorUserRepository.prototype, "createDonor").mockResolvedValue({
        _id: donorId,
        ...donorData,
        userType: "donor",
      } as never);
      (bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const donorUserService = new DonorUserService();
      const result = await donorUserService.registerDonor(donorData as CreateDonorDTO);

      expect(bcryptjs.hash).toHaveBeenCalledWith("password123", 10);
      expect(result).toHaveProperty("_id");
    });

    test("should throw error if email already exists", async () => {
      const donorData: Partial<CreateDonorDTO> = {
        email: "existing@test.com",
        password: "password123",
      };

      jest.spyOn(DonorUserRepository.prototype, "getDonorByEmail").mockResolvedValue({ _id: "existing-id" } as never);

      const donorUserService = new DonorUserService();
      await expect(donorUserService.registerDonor(donorData as CreateDonorDTO)).rejects.toThrow(HttpError);
    });
  });

  describe("loginDonor", () => {
    test("should login donor successfully with valid credentials", async () => {
      const donorId = mockUuid();
      const loginData: LoginUserDTO = {
        email: "john@test.com",
        password: "password123",
      };
      const mockDonor = {
        _id: donorId,
        email: "john@test.com",
        password: "hashedPassword123",
        fullName: "John Doe",
        userType: "donor",
        phoneNumber: "1234567890",
        dateOfBirth: "1990-01-01",
        bloodGroup: "A+",
        address: "123 Main St",
        profilePicture: "pic.jpg",
      };
      const mockToken = "mock-jwt-token";

      jest.spyOn(DonorUserRepository.prototype, "getDonorByEmail").mockResolvedValue(mockDonor as never);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const donorUserService = new DonorUserService();
      const result = await donorUserService.loginDonor(loginData);

      expect(bcryptjs.compare).toHaveBeenCalledWith(loginData.password, mockDonor.password);
      expect(jwt.sign).toHaveBeenCalled();
      expect(result.token).toBe(mockToken);
      expect(result.sendDonor).toHaveProperty("email", "john@test.com");
    });

    test("should throw error if donor not found", async () => {
      const loginData: LoginUserDTO = {
        email: "notfound@test.com",
        password: "password123",
      };

      jest.spyOn(DonorUserRepository.prototype, "getDonorByEmail").mockResolvedValue(null as never);

      const donorUserService = new DonorUserService();
      await expect(donorUserService.loginDonor(loginData)).rejects.toThrow(HttpError);
    });

    test("should throw error if password is invalid", async () => {
      const loginData: LoginUserDTO = {
        email: "john@test.com",
        password: "wrongpassword",
      };
      const mockDonor = {
        _id: mockUuid(),
        email: "john@test.com",
        password: "hashedPassword123",
      };

      jest.spyOn(DonorUserRepository.prototype, "getDonorByEmail").mockResolvedValue(mockDonor as never);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      const donorUserService = new DonorUserService();
      await expect(donorUserService.loginDonor(loginData)).rejects.toThrow(HttpError);
    });
  });

  describe("getAllDonors", () => {
    test("should return all donors", async () => {
      const mockDonors: any[] = [
        { _id: mockUuid(), fullName: "Donor 1" },
        { _id: mockUuid(), fullName: "Donor 2" },
      ];

      jest.spyOn(DonorUserRepository.prototype, "getAllDonors").mockResolvedValue(mockDonors as never);

      const donorUserService = new DonorUserService();
      const result = await donorUserService.getAllDonors();

      expect(result).toEqual(mockDonors);
    });
  });

  describe("getDonorById", () => {
    test("should return donor by id", async () => {
      const donorId = mockUuid();
      const mockDonor: any = { _id: donorId, fullName: "John Doe" };

      jest.spyOn(DonorUserRepository.prototype, "getDonorById").mockResolvedValue(mockDonor as never);

      const donorUserService = new DonorUserService();
      const result = await donorUserService.getDonorById(donorId);

      expect(result).toEqual(mockDonor);
    });

    test("should throw error if donor not found", async () => {
      const donorId = mockUuid();

      jest.spyOn(DonorUserRepository.prototype, "getDonorById").mockResolvedValue(null as never);

      const donorUserService = new DonorUserService();
      await expect(donorUserService.getDonorById(donorId)).rejects.toThrow(HttpError);
    });
  });

  describe("updateDonor", () => {
    test("should update donor without password", async () => {
      const donorId = mockUuid();
      const updateData = { fullName: "Updated Name" };
      const updatedDonor: any = { _id: donorId, ...updateData };

      jest.spyOn(DonorUserRepository.prototype, "updateDonor").mockResolvedValue(updatedDonor as never);

      const donorUserService = new DonorUserService();
      const result = await donorUserService.updateDonor(donorId, updateData);

      expect(result).toEqual(updatedDonor);
    });

    test("should hash password when updating donor password", async () => {
      const donorId = mockUuid();
      const updateData = { fullName: "Updated Name", password: "newPassword123" };
      const hashedPassword = "hashedNewPassword";
      const updatedDonor: any = { _id: donorId, fullName: "Updated Name", password: hashedPassword };

      (bcryptjs.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(DonorUserRepository.prototype, "updateDonor").mockResolvedValue(updatedDonor as never);

      const donorUserService = new DonorUserService();
      const result = await donorUserService.updateDonor(donorId, updateData);

      expect(bcryptjs.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(result).toEqual(updatedDonor);
    });

    test("should throw error if donor not found during update", async () => {
      const donorId = mockUuid();
      const updateData = { fullName: "Updated Name" };

      jest.spyOn(DonorUserRepository.prototype, "updateDonor").mockResolvedValue(null as never);

      const donorUserService = new DonorUserService();
      await expect(donorUserService.updateDonor(donorId, updateData)).rejects.toThrow(HttpError);
    });
  });

  describe("updateDonorProfilePicture", () => {
    test("should update donor profile picture", async () => {
      const donorId = mockUuid();
      const filename = "profile.jpg";
      const updatedDonor: any = { _id: donorId, profilePicture: filename };

      jest.spyOn(DonorUserRepository.prototype, "updateDonor").mockResolvedValue(updatedDonor as never);

      const donorUserService = new DonorUserService();
      const result = await donorUserService.updateDonorProfilePicture(donorId, filename);

      expect(result).toEqual(updatedDonor);
    });

    test("should throw error if donor not found when updating profile picture", async () => {
      const donorId = mockUuid();
      const filename = "profile.jpg";

      jest.spyOn(DonorUserRepository.prototype, "updateDonor").mockResolvedValue(null as never);

      const donorUserService = new DonorUserService();
      await expect(
        donorUserService.updateDonorProfilePicture(donorId, filename)
      ).rejects.toThrow(HttpError);
    });
  });
});
