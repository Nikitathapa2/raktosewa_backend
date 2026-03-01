import { DonorUserModel } from "../../../models/DonorUser.model";
import { DonorUserRepository } from "../../../repositories/donorUser.repository";

const { v4: mockUuid } = require("../../__mocks__/uuid");

describe("DonorUser Repository Unit test", () => {
    let donorUserRepository: DonorUserRepository;

    beforeEach(() => {
        donorUserRepository = new DonorUserRepository();
        jest.restoreAllMocks();
    });

    test("should create a new donor", async () => {
        const donorId = mockUuid();
        const donorData = {
            fullName: "Test Donor",
            email: "test@donor.com",
            password: "password123",
            bloodGroup: "A+",
            phoneNumber: "1234567890",
            address: "Test City",
            userType: "donor",
        };

        const saveMock = jest
            .spyOn(DonorUserModel.prototype, "save")
            .mockResolvedValue({ _id: donorId, ...donorData } as never);

        const donor = await donorUserRepository.createDonor(donorData as never);

        expect(saveMock).toHaveBeenCalledTimes(1);
        expect(donor).toHaveProperty("_id");
        expect((donor as any).fullName).toBe(donorData.fullName);
        expect((donor as any).email).toBe(donorData.email);
    });

    test("should get donor by email", async () => {
        const donorId = mockUuid();
        const mockedDonor = { _id: donorId, email: "test@donor.com" };

        const findOneMock = jest
            .spyOn(DonorUserModel, "findOne")
            .mockResolvedValue(mockedDonor as never);

        const result = await donorUserRepository.getDonorByEmail("test@donor.com");

        expect(findOneMock).toHaveBeenCalledWith({ email: "test@donor.com" });
        expect(result).toEqual(mockedDonor);
    });

    test("should get donor by id", async () => {
        const donorId = mockUuid();
        const mockedDonor = { _id: donorId, fullName: "By Id" };

        const findByIdMock = jest
            .spyOn(DonorUserModel, "findById")
            .mockResolvedValue(mockedDonor as never);

        const result = await donorUserRepository.getDonorById(donorId);

        expect(findByIdMock).toHaveBeenCalledWith(donorId);
        expect(result).toEqual(mockedDonor);
    });

    test("should get all donors", async () => {
        const mockedDonors = [{ _id: mockUuid() }, { _id: mockUuid() }];

        const findMock = jest
            .spyOn(DonorUserModel, "find")
            .mockResolvedValue(mockedDonors as never);

        const result = await donorUserRepository.getAllDonors();

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockedDonors);
    });

    test("should get paginated donors", async () => {
        const mockedDonors = [{ _id: mockUuid() }];
        const skip = 0;
        const limit = 10;

        const sortMock = jest.fn().mockResolvedValue(mockedDonors);
        const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
        const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

        const findMock = jest
            .spyOn(DonorUserModel, "find")
            .mockReturnValue({ skip: skipMock } as never);
        const countMock = jest
            .spyOn(DonorUserModel, "countDocuments")
            .mockResolvedValue(25 as never);

        const result = await donorUserRepository.getAllDonorsPaginated(skip, limit);

        expect(findMock).toHaveBeenCalledTimes(1);
        expect(skipMock).toHaveBeenCalledWith(skip);
        expect(limitMock).toHaveBeenCalledWith(limit);
        expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
        expect(countMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ data: mockedDonors, total: 25 });
    });

    test("should update donor", async () => {
        const donorId = mockUuid();
        const updateData = { fullName: "Updated Name" };
        const updatedDonor = { _id: donorId, ...updateData };

        const updateMock = jest
            .spyOn(DonorUserModel, "findByIdAndUpdate")
            .mockResolvedValue(updatedDonor as never);

        const result = await donorUserRepository.updateDonor(donorId, updateData as never);

        expect(updateMock).toHaveBeenCalledWith(donorId, updateData, { new: true });
        expect(result).toEqual(updatedDonor);
    });

    test("should delete donor and return true when donor exists", async () => {
        const donorId = mockUuid();
        const deleteMock = jest
            .spyOn(DonorUserModel, "findByIdAndDelete")
            .mockResolvedValue({ _id: donorId } as never);

        const result = await donorUserRepository.deleteDonor(donorId);

        expect(deleteMock).toHaveBeenCalledWith(donorId);
        expect(result).toBe(true);
    });

    test("should delete donor and return false when donor does not exist", async () => {
        jest.spyOn(DonorUserModel, "findByIdAndDelete").mockResolvedValue(null as never);

        const result = await donorUserRepository.deleteDonor("not-found-id");

        expect(result).toBe(false);
    });
});