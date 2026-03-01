import { AdminUserModel } from "../../../models/AdminUser.model";
import { AdminUserRepository } from "../../../repositories/adminUser.repository";

const { v4: mockUuid } = require("../../__mocks__/uuid");

describe("AdminUser Repository Unit test", () => {
  let adminUserRepository: AdminUserRepository;

  beforeEach(() => {
    adminUserRepository = new AdminUserRepository();
    jest.restoreAllMocks();
  });

  test("should create a new admin", async () => {
    const adminData = {
      email: "admin@test.com",
      password: "securePassword123",
      role: "admin",
    };

    const saveMock = jest
      .spyOn(AdminUserModel.prototype, "save")
      .mockResolvedValue({ _id: mockUuid(), ...adminData } as never);

    const admin = await adminUserRepository.createAdmin(adminData as never);

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(admin).toHaveProperty("_id");
    expect((admin as any).email).toBe(adminData.email);
    expect((admin as any).role).toBe(adminData.role);
  });

  test("should get admin by email", async () => {
    const adminId = mockUuid();
    const mockedAdmin = {
      _id: adminId,
      email: "admin@test.com",
      role: "admin",
    };

    const findOneMock = jest
      .spyOn(AdminUserModel, "findOne")
      .mockResolvedValue(mockedAdmin as never);

    const result = await adminUserRepository.getAdminByEmail("admin@test.com");

    expect(findOneMock).toHaveBeenCalledWith({ email: "admin@test.com" });
    expect(result).toEqual(mockedAdmin);
  });

  test("should get admin by id", async () => {
    const adminId = mockUuid();
    const mockedAdmin = {
      _id: adminId,
      email: "admin@test.com",
      role: "admin",
    };

    const findByIdMock = jest
      .spyOn(AdminUserModel, "findById")
      .mockResolvedValue(mockedAdmin as never);

    const result = await adminUserRepository.getAdminById(adminId);

    expect(findByIdMock).toHaveBeenCalledWith(adminId);
    expect(result).toEqual(mockedAdmin);
  });

  test("should update admin by id", async () => {
    const adminId = mockUuid();
    const updateData = { email: "newemail@admin.com" };
    const updatedAdmin = {
      _id: adminId,
      ...updateData,
      role: "admin",
    };

    const updateMock = jest
      .spyOn(AdminUserModel, "findByIdAndUpdate")
      .mockResolvedValue(updatedAdmin as never);

    const result = await adminUserRepository.updateAdminById(adminId, updateData as never);

    expect(updateMock).toHaveBeenCalledWith(adminId, updateData, { new: true });
    expect(result).toEqual(updatedAdmin);
  });

  test("should return null when getting non-existent admin", async () => {
    const nonExistentId = mockUuid();

    jest.spyOn(AdminUserModel, "findById").mockResolvedValue(null as never);

    const result = await adminUserRepository.getAdminById(nonExistentId);

    expect(result).toBeNull();
  });

  test("should return null when updating non-existent admin", async () => {
    const nonExistentId = mockUuid();
    const updateData = { email: "test@admin.com" };

    jest
      .spyOn(AdminUserModel, "findByIdAndUpdate")
      .mockResolvedValue(null as never);

    const result = await adminUserRepository.updateAdminById(nonExistentId, updateData as never);

    expect(result).toBeNull();
  });
});
