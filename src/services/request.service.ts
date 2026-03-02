import { BloodRequestModel, IBloodRequest } from '../models/bloodRequest.model';
import { BloodGroup } from '../models/bloodInventory.model';
import mongoose from 'mongoose';
import * as notificationService from './notification.service';
import { parsePaginationParams, createPaginatedResponse, PaginatedResponse } from '../utils/pagination';

interface RequestData {
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency?: 'NORMAL' | 'CRITICAL';
  location: string;
  contactNumber: string;
}

interface RequestFilters {
  status?: string;
  bloodGroup?: BloodGroup;
  [key: string]: any;
}

export const createRequest = async (
  organizationId: string | mongoose.Types.ObjectId,
  requestData: RequestData
): Promise<IBloodRequest> => {
  const request = await BloodRequestModel.create({
    organization: organizationId,
    ...requestData,
  });

  try {
    const organizationName = await notificationService.buildOrganizationName(
      organizationId
    );
    await notificationService.createNotificationsForAllDonors({
      senderId: organizationId,
      senderModel: 'OrganizationUser',
      type: 'BLOOD_REQUEST',
      message: `Urgent blood request: ${request.bloodGroup} blood needed at ${organizationName}.`,
      relatedEntityId: request._id,
    });
  } catch (error) {
    console.error('Notification error (createRequest):', error);
  }

  return request;
};

export const getOrganizationRequests = async (
  organizationId: string | mongoose.Types.ObjectId,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<IBloodRequest>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  const totalRequests = await BloodRequestModel.countDocuments({ organization: organizationId });

  const requests = await BloodRequestModel.find({ organization: organizationId })
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('acceptedBy', 'fullName email phoneNumber bloodGroup profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  return createPaginatedResponse(requests, totalRequests, pageNum, pageSize);
};

export const getDonorAcceptedRequests = async (
  donorId: string | mongoose.Types.ObjectId,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<IBloodRequest>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  const totalRequests = await BloodRequestModel.countDocuments({ acceptedBy: donorId });

  const requests = await BloodRequestModel.find({ acceptedBy: donorId })
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('acceptedBy', 'fullName email phoneNumber bloodGroup profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  return createPaginatedResponse(requests, totalRequests, pageNum, pageSize);
};

export const getAllRequests = async (
  filters: RequestFilters = {},
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<IBloodRequest>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);
  
  // Build query with filters
  const query: any = { status: 'PENDING' };
  
  // Add blood group filter
  if (filters.bloodGroup) {
    query.bloodGroup = filters.bloodGroup;
  }
  
  // Add urgency filter
  if (filters.urgency) {
    query.urgency = filters.urgency;
  }
  
  // Add search filter (search in patientName and location)
  if (filters.search) {
    query.$or = [
      { patientName: { $regex: filters.search, $options: 'i' } },
      { location: { $regex: filters.search, $options: 'i' } },
    ];
  }
  
  const totalRequests = await BloodRequestModel.countDocuments(query);

  const requests = await BloodRequestModel.find(query)
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('acceptedBy', 'fullName email phoneNumber bloodGroup profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  return createPaginatedResponse(requests, totalRequests, pageNum, pageSize);
};

export const acceptRequest = async (
  requestId: string,
  donorId: string | mongoose.Types.ObjectId
): Promise<IBloodRequest> => {
  const request = await BloodRequestModel.findById(requestId);
  if (!request) throw new Error('Request not found');
  if (request.status !== 'PENDING') throw new Error('Request already fulfilled or cancelled');

  if (request.acceptedBy.includes(donorId as mongoose.Types.ObjectId)) {
    throw new Error('You have already accepted this request');
  }

  request.acceptedBy.push(donorId as mongoose.Types.ObjectId);
  await request.save();

  try {
    const donorName = await notificationService.buildDonorName(donorId);
    await notificationService.createNotification({
      receiverId: request.organization,
      receiverModel: 'OrganizationUser',
      senderId: donorId,
      senderModel: 'DonorUser',
      type: 'DONATION',
      message: `Donor ${donorName} has responded to your blood request for ${request.bloodGroup} blood.`,
      relatedEntityId: request._id,
    });
  } catch (error) {
    console.error('Notification error (acceptRequest):', error);
  }

  return request;
};

export const updateRequest = async (
  requestId: string,
  organizationId: string | mongoose.Types.ObjectId,
  updateData: Partial<RequestData>
): Promise<IBloodRequest> => {
  const request = await BloodRequestModel.findOneAndUpdate(
    { _id: requestId, organization: organizationId },
    updateData,
    { new: true }
  );

  if (!request) throw new Error('Request not found');
  return request;
};

export const deleteRequest = async (
  requestId: string,
  organizationId: string | mongoose.Types.ObjectId
): Promise<IBloodRequest> => {
  const request = await BloodRequestModel.findOneAndDelete({
    _id: requestId,
    organization: organizationId,
  });

  if (!request) throw new Error('Request not found');
  return request;
};
export const getRequestById = async (requestId: string): Promise<IBloodRequest | null> => {
  return await BloodRequestModel.findById(requestId)
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('acceptedBy', 'fullName email phoneNumber bloodGroup profilePicture');
};

export const getRequestApplicants = async (
  requestId: string,
  organizationId: string | mongoose.Types.ObjectId,
  page?: number | string,
  limit?: number | string
): Promise<PaginatedResponse<any>> => {
  const { skip, limit: pageSize, page: pageNum } = parsePaginationParams(page, limit);

  const request = await BloodRequestModel.findOne({
    _id: requestId,
    organization: organizationId,
  });

  if (!request) throw new Error('Request not found or unauthorized');

  const totalApplicants = request.acceptedBy.length;

  // Use populate with slice to paginate
  const requestWithApplicants = await BloodRequestModel.findOne({
    _id: requestId,
    organization: organizationId,
  })
    .populate({
      path: 'acceptedBy',
      select: 'fullName email phoneNumber bloodGroup profilePicture',
      options: { skip, limit: pageSize },
    });

  const applicants = requestWithApplicants?.acceptedBy || [];

  return createPaginatedResponse(applicants, totalApplicants, pageNum, pageSize);
};

export const removeApplicantFromRequest = async (
  requestId: string,
  organizationId: string | mongoose.Types.ObjectId,
  applicantId: string | mongoose.Types.ObjectId
): Promise<IBloodRequest> => {
  const request = await BloodRequestModel.findOne({
    _id: requestId,
    organization: organizationId,
  });

  if (!request) {
    throw new Error('Request not found or unauthorized');
  }

  // Check if applicant exists in acceptedBy
  if (!request.acceptedBy.includes(applicantId as mongoose.Types.ObjectId)) {
    throw new Error('Applicant not found in this request');
  }

  // Remove the applicant
  request.acceptedBy = request.acceptedBy.filter(
    (id) => !id.equals(applicantId as mongoose.Types.ObjectId)
  );

  await request.save();

  // Return the updated request with populated data
  const updatedRequest = await BloodRequestModel.findById(requestId)
    .populate('organization', 'organizationName email phoneNumber address profilePicture')
    .populate('acceptedBy', 'fullName email phoneNumber bloodGroup profilePicture');

  return updatedRequest as IBloodRequest;
};