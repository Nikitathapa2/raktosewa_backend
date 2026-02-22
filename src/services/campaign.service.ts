import { CampaignModel, ICampaign } from '../models/campaign.model';
import mongoose from 'mongoose';
import * as notificationService from './notification.service';
import { parsePaginationParams, createPaginatedResponse, PaginatedResponse } from '../utils/pagination';

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

interface CampaignData {
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  imageName?: string;
  targetUnits?: number;
}

export const createCampaign = async (
  organizationId: string | mongoose.Types.ObjectId,
  campaignData: CampaignData
): Promise<ICampaign> => {
  const campaign = await CampaignModel.create({
    organization: organizationId,
    ...campaignData,
  });
  const populatedCampaign = await campaign.populate(
    'organization',
    'organizationName email phoneNumber address profilePicture'
  );

  try {
    const organizationName =
      (populatedCampaign.organization as any)?.organizationName ??
      'an organization';
    await notificationService.createNotificationsForAllDonors({
      senderId: organizationId,
      senderModel: 'OrganizationUser',
      type: 'CAMPAIGN',
      message: `New campaign '${populatedCampaign.title}' posted by ${organizationName}.`,
      relatedEntityId: populatedCampaign._id,
    });
  } catch (error) {
    console.error('Notification error (createCampaign):', error);
  }

  return populatedCampaign;
};

export const getAllCampaigns = async (
  page?: number | string,
  limit?: number | string,
  filters?: {
    search?: string;
    location?: string;
    sortBy?: string;
  }
): Promise<PaginatedResponse<ICampaign>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);
  const startOfToday = getStartOfToday();

  // Build query
  const query: any = { date: { $gte: startOfToday } };

  // Add search filter (search in title and description)
  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  // Add location filter
  if (filters?.location) {
    query.location = { $regex: filters.location, $options: 'i' };
  }

  const totalCampaigns = await CampaignModel.countDocuments(query);

  let sortOption: any = { date: 1 };
  if (filters?.sortBy === 'date-new') {
    sortOption = { date: -1 };
  } else if (filters?.sortBy === 'title') {
    sortOption = { title: 1 };
  }

  const campaigns = await CampaignModel.find(query)
    .populate('organization', 'organizationName email phoneNumber address')
    .populate('participants', 'fullName email bloodGroup')
    .skip(skip)
    .limit(pageSize)
    .sort(sortOption);

  return createPaginatedResponse(campaigns, totalCampaigns, pageNum, pageSize);
};

export const getOrganizationCampaigns = async (
  organizationId: string | mongoose.Types.ObjectId,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<ICampaign>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  const totalCampaigns = await CampaignModel.countDocuments({ organization: organizationId });

  const campaigns = await CampaignModel.find({ organization: organizationId })
    .sort({ date: -1 })
    .populate('organization', 'organizationName email phoneNumber address')
    .populate('participants', 'fullName email bloodGroup')
    .skip(skip)
    .limit(pageSize);

  return createPaginatedResponse(campaigns, totalCampaigns, pageNum, pageSize);
};

export const getDonorAppliedCampaigns = async (
  donorId: string | mongoose.Types.ObjectId,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<ICampaign>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);
  const startOfToday = getStartOfToday();

  const totalCampaigns = await CampaignModel.countDocuments({
    participants: donorId,
    date: { $gte: startOfToday },
  });

  const campaigns = await CampaignModel.find({
    participants: donorId,
    date: { $gte: startOfToday },
  })
    .sort({ date: 1 })
    .populate('organization', 'organizationName email phoneNumber address')
    .populate('participants', 'fullName email bloodGroup')
    .skip(skip)
    .limit(pageSize);

  return createPaginatedResponse(campaigns, totalCampaigns, pageNum, pageSize);
};

export const updateCampaign = async (
  campaignId: string,
  organizationId: string | mongoose.Types.ObjectId,
  updateData: Partial<CampaignData>
): Promise<ICampaign> => {
  const campaign = await CampaignModel.findOneAndUpdate(
    { _id: campaignId, organization: organizationId },
    updateData,
    { new: true } // return updated document
  ).populate(
    'organization',
    'organizationName email phoneNumber address profilePicture'
  );

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  return campaign;
};


export const deleteCampaign = async (
  campaignId: string,
  organizationId: string | mongoose.Types.ObjectId
): Promise<ICampaign> => {
  const campaign = await CampaignModel.findOneAndDelete({
    _id: campaignId,
    organization: organizationId,
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }
  return campaign;
};

export const applyForCampaign = async (
  campaignId: string,
  donorId: string | mongoose.Types.ObjectId
): Promise<ICampaign> => {
  const campaign = await CampaignModel.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  if (campaign.participants.includes(donorId as mongoose.Types.ObjectId)) {
    throw new Error('Already registered for this campaign');
  }

  campaign.participants.push(donorId as mongoose.Types.ObjectId);
  await campaign.save();
  
  const updatedCampaign = await CampaignModel.findById(campaignId)
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('participants', 'fullName email phoneNumber bloodGroup profilePicture') as any;

  try {
    const donorName = await notificationService.buildDonorName(donorId);
    await notificationService.createNotification({
      receiverId: campaign.organization,
      receiverModel: 'OrganizationUser',
      senderId: donorId,
      senderModel: 'DonorUser',
      type: 'APPLICATION',
      message: `Donor ${donorName} has applied for your campaign '${campaign.title}'.`,
      relatedEntityId: campaign._id,
    });
  } catch (error) {
    console.error('Notification error (applyForCampaign):', error);
  }

  return updatedCampaign;
};

export const getCampaignParticipants = async (
  campaignId: string,
  organizationId: string | mongoose.Types.ObjectId,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<any>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  const campaign = await CampaignModel.findOne({
    _id: campaignId,
    organization: organizationId,
  });

  if (!campaign) throw new Error('Campaign not found or unauthorized');

  const totalParticipants = campaign.participants.length;

  // NOTE: MongoDB doesn't support pagination on populated fields with slice
  // We need to populate and slice in memory, or restructure data
  const participantsWithPaths = await CampaignModel.findOne({
    _id: campaignId,
    organization: organizationId,
  })
    .populate({
      path: 'participants',
      select: 'fullName email phoneNumber bloodGroup profilePicture',
      options: { skip, limit: pageSize },
    });

  const participants = participantsWithPaths?.participants || [];

  return createPaginatedResponse(participants, totalParticipants, pageNum, pageSize);
};

export const getCampaignById = async (campaignId: string): Promise<ICampaign | null> => {
  return await CampaignModel.findById(campaignId)
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('participants', 'fullName email phoneNumber bloodGroup profilePicture');
};

export const getAllCampaignsForAdmin = async (
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<ICampaign>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  const totalCampaigns = await CampaignModel.countDocuments({});

  const campaigns = await CampaignModel.find({})
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('participants', 'fullName email bloodGroup')
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  return createPaginatedResponse(campaigns, totalCampaigns, pageNum, pageSize);
};

export const createCampaignAsAdmin = async (
  organizationId: string,
  campaignData: CampaignData
): Promise<ICampaign> => {
  const campaign = await CampaignModel.create({
    organization: organizationId,
    ...campaignData,
  });

  return await campaign.populate(
    'organization',
    'organizationName email phoneNumber address profilePicture'
  );
};

export const updateCampaignAsAdmin = async (
  campaignId: string,
  updateData: Partial<CampaignData> & { organization?: string }
): Promise<ICampaign> => {
  const campaign = await CampaignModel.findByIdAndUpdate(campaignId, updateData, {
    new: true,
  })
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('participants', 'fullName email phoneNumber bloodGroup profilePicture');

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  return campaign;
};

export const getCampaignsByMonth = async (
  year: number,
  month: number,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<ICampaign>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  // Create date range for the month (inclusive)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const totalCampaigns = await CampaignModel.countDocuments({
    date: { $gte: startDate, $lte: endDate },
  });

  const campaigns = await CampaignModel.find({
    date: { $gte: startDate, $lte: endDate },
  })
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('participants', 'fullName email bloodGroup')
    .skip(skip)
    .limit(pageSize)
    .sort({ date: 1 });

  return createPaginatedResponse(campaigns, totalCampaigns, pageNum, pageSize);
};

export const deleteCampaignAsAdmin = async (campaignId: string): Promise<ICampaign> => {
  const campaign = await CampaignModel.findByIdAndDelete(campaignId);

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  return campaign;
};

export const removeApplicantFromCampaign = async (
  campaignId: string,
  organizationId: string | mongoose.Types.ObjectId,
  applicantId: string | mongoose.Types.ObjectId
): Promise<ICampaign> => {
  const campaign = await CampaignModel.findOne({
    _id: campaignId,
    organization: organizationId,
  });

  if (!campaign) {
    throw new Error('Campaign not found or unauthorized');
  }

  // Check if applicant exists in participants
  if (!campaign.participants.includes(applicantId as mongoose.Types.ObjectId)) {
    throw new Error('Applicant not found in this campaign');
  }

  // Remove the applicant
  campaign.participants = campaign.participants.filter(
    (id) => !id.equals(applicantId as mongoose.Types.ObjectId)
  );

  await campaign.save();

  // Return the updated campaign with populated data
  const updatedCampaign = await CampaignModel.findById(campaignId)
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('participants', 'fullName email phoneNumber bloodGroup profilePicture');

  return updatedCampaign as ICampaign;
};
