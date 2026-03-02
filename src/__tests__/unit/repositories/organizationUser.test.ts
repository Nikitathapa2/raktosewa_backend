import { OrganizationUserModel } from "../../../models/OrganizationUser.model";
import { OrganizationUserRepository } from "../../../repositories/organizationUser.repository";

const { v4: mockUuid } = require("../../__mocks__/uuid");

describe("OrganizationUser Repository Unit test", () => {
  let organizationUserRepository: OrganizationUserRepository;

  beforeEach(() => {
    organizationUserRepository = new OrganizationUserRepository();
    jest.restoreAllMocks();
  });

  test("should create a new organization", async () => {
    const orgData = {
      organizationName: "Test Blood Bank",
      headOfOrganization: "John Doe",
      email: "org@test.com",
      password: "securePassword123",
      phoneNumber: "9876543210",
      address: "123 Main St",
      userType: "organization",
    };

    const saveMock = jest
      .spyOn(OrganizationUserModel.prototype, "save")
      .mockResolvedValue({ _id: mockUuid(), ...orgData } as never);

    const organization = await organizationUserRepository.createOrganization(
      orgData as never
    );

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(organization).toHaveProperty("_id");
    expect((organization as any).organizationName).toBe(orgData.organizationName);
    expect((organization as any).email).toBe(orgData.email);
  });

  test("should get organization by email", async () => {
    const orgId = mockUuid();
    const mockedOrg = {
      _id: orgId,
      organizationName: "Test Blood Bank",
      email: "org@test.com",
    };

    const findOneMock = jest
      .spyOn(OrganizationUserModel, "findOne")
      .mockResolvedValue(mockedOrg as never);

    const result = await organizationUserRepository.getOrganizationByEmail(
      "org@test.com"
    );

    expect(findOneMock).toHaveBeenCalledWith({ email: "org@test.com" });
    expect(result).toEqual(mockedOrg);
  });

  test("should get organization by id", async () => {
    const orgId = mockUuid();
    const mockedOrg = {
      _id: orgId,
      organizationName: "Test Blood Bank",
      email: "org@test.com",
    };

    const findByIdMock = jest
      .spyOn(OrganizationUserModel, "findById")
      .mockResolvedValue(mockedOrg as never);

    const result = await organizationUserRepository.getOrganizationById(orgId);

    expect(findByIdMock).toHaveBeenCalledWith(orgId);
    expect(result).toEqual(mockedOrg);
  });

  test("should get all organizations", async () => {
    const mockedOrgs = [
      { _id: mockUuid(), organizationName: "Org 1" },
      { _id: mockUuid(), organizationName: "Org 2" },
    ];

    const findMock = jest
      .spyOn(OrganizationUserModel, "find")
      .mockResolvedValue(mockedOrgs as never);

    const result = await organizationUserRepository.getAllOrganizations();

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockedOrgs);
  });

  test("should get paginated organizations", async () => {
    const mockedOrgs = [{ _id: mockUuid(), organizationName: "Org 1" }];
    const skip = 0;
    const limit = 10;

    const sortMock = jest.fn().mockResolvedValue(mockedOrgs);
    const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
    const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

    const findMock = jest
      .spyOn(OrganizationUserModel, "find")
      .mockReturnValue({ skip: skipMock } as never);
    const countMock = jest
      .spyOn(OrganizationUserModel, "countDocuments")
      .mockResolvedValue(15 as never);

    const result = await organizationUserRepository.getAllOrganizationsPaginated(
      skip,
      limit
    );

    expect(findMock).toHaveBeenCalledTimes(1);
    expect(skipMock).toHaveBeenCalledWith(skip);
    expect(limitMock).toHaveBeenCalledWith(limit);
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(countMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: mockedOrgs, total: 15 });
  });

  test("should update organization", async () => {
    const orgId = mockUuid();
    const updateData = { organizationName: "Updated Org Name" };
    const updatedOrg = { _id: orgId, ...updateData };

    const updateMock = jest
      .spyOn(OrganizationUserModel, "findByIdAndUpdate")
      .mockResolvedValue(updatedOrg as never);

    const result = await organizationUserRepository.updateOrganization(
      orgId,
      updateData as never
    );

    expect(updateMock).toHaveBeenCalledWith(orgId, updateData, { new: true });
    expect(result).toEqual(updatedOrg);
  });

  test("should delete organization and return true when organization exists", async () => {
    const orgId = mockUuid();
    const deleteMock = jest
      .spyOn(OrganizationUserModel, "findByIdAndDelete")
      .mockResolvedValue({ _id: orgId } as never);

    const result = await organizationUserRepository.deleteOrganization(orgId);

    expect(deleteMock).toHaveBeenCalledWith(orgId);
    expect(result).toBe(true);
  });

  test("should delete organization and return false when organization does not exist", async () => {
    const nonExistentId = mockUuid();
    jest
      .spyOn(OrganizationUserModel, "findByIdAndDelete")
      .mockResolvedValue(null as never);

    const result = await organizationUserRepository.deleteOrganization(
      nonExistentId
    );

    expect(result).toBe(false);
  });

  test("should return null when getting non-existent organization", async () => {
    const nonExistentId = mockUuid();

    jest
      .spyOn(OrganizationUserModel, "findById")
      .mockResolvedValue(null as never);

    const result = await organizationUserRepository.getOrganizationById(
      nonExistentId
    );

    expect(result).toBeNull();
  });
});
