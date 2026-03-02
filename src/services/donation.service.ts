import { DonationModel, IDonation, IWalkinDonor } from '../models/donation.model';
import { BloodGroup } from '../models/bloodInventory.model';
import { DonorProfileModel } from '../models/donorProfile.model';
import * as inventoryService from './inventory.service';
import mongoose from 'mongoose';
import { parsePaginationParams, createPaginatedResponse, PaginatedResponse } from '../utils/pagination';

interface DonationData {
  donorType: 'REGISTERED' | 'WALKIN';
  donorId?: string | mongoose.Types.ObjectId;
  walkinDonor?: IWalkinDonor;
  bloodGroup?: BloodGroup;
  units: number;
  notes?: string;
}

export const registerDonation = async (
  organizationId: string | mongoose.Types.ObjectId,
  donationData: DonationData
): Promise<IDonation> => {
  const { donorType, donorId, walkinDonor, bloodGroup, units, notes } = donationData;

  const donation = await DonationModel.create({
    organization: organizationId,
    donorType,
    donorId: donorType === 'REGISTERED' ? donorId : null,
    walkinDonor: donorType === 'WALKIN' ? walkinDonor : undefined,
    bloodGroup: donorType === 'WALKIN' && walkinDonor ? walkinDonor.bloodGroup : bloodGroup,
    units,
    notes,
  });

  // Update Inventory automatically
  await inventoryService.updateInventory(organizationId, {
    bloodGroup: donation.bloodGroup,
    quantity: units,
    operation: 'add'
  });

  // If registered donor, update last donated date
  if (donorType === 'REGISTERED' && donorId) {
    const profile = await DonorProfileModel.findOne({ user: donorId });
    if (profile) {
      profile.lastDonationDate = new Date();
      await profile.save();
    }
  }

  return donation;
};

export const getHistory = async (
  userId: string | mongoose.Types.ObjectId,
  role: string,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<IDonation>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  let query: any = {};
  if (role === 'DONOR') {
    query = { donorId: userId };
  } else if (role === 'ORGANIZATION') {
    query = { organization: userId };
  }

  const totalDonations = await DonationModel.countDocuments(query);

  const donations = await DonationModel.find(query)
    .populate('donorId', 'fullName email phoneNumber bloodGroup profilePicture')
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  return createPaginatedResponse(donations, totalDonations, pageNum, pageSize);
};
