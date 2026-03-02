import { Request, Response } from 'express';
import * as requestService from '../services/request.service';

export const createRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await requestService.createRequest(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await requestService.getOrganizationRequests(req.user._id, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAcceptedRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await requestService.getDonorAcceptedRequests(req.user._id, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, ...filters } = req.query;
    const data = await requestService.getAllRequests(filters as any, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await requestService.acceptRequest(requestId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Request accepted successfully',
      data: data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updateData: any = {};

    if (req.body.patientName !== undefined) updateData.patientName = req.body.patientName;
    if (req.body.bloodGroup !== undefined) updateData.bloodGroup = req.body.bloodGroup;
    if (req.body.unitsRequired !== undefined) updateData.unitsRequired = Number(req.body.unitsRequired);
    if (req.body.urgency !== undefined) updateData.urgency = req.body.urgency;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.contactNumber !== undefined) updateData.contactNumber = req.body.contactNumber;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    const data = await requestService.updateRequest(requestId, req.user._id, updateData);
    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await requestService.deleteRequest(requestId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Request deleted successfully',
      data: data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await requestService.getRequestById(requestId);
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRequestApplicants = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { page, limit } = req.query;
    const data = await requestService.getRequestApplicants(requestId, req.user._id, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeApplicantFromRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const applicantId = Array.isArray(req.params.applicantId) ? req.params.applicantId[0] : req.params.applicantId;
    const data = await requestService.removeApplicantFromRequest(
      requestId,
      req.user._id,
      applicantId
    );
    res.status(200).json({
      success: true,
      message: 'Applicant removed from request successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};