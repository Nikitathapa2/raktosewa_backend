import { Request, Response } from 'express';
import * as campaignService from '../services/campaign.service';

export const createCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageName = req.file?.filename;
    if (!req.body.date) {
      throw new Error('Campaign date is required');
    }
    const data = await campaignService.createCampaign(req.user._id, {
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      location: req.body.location,
      targetUnits: req.body.targetUnits
        ? Number(req.body.targetUnits)
        : undefined,
      imageName,
    });
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, search, location, sortBy } = req.query;
    const data = await campaignService.getAllCampaigns(
      typeof page === 'string' ? Number(page) : undefined,
      typeof limit === 'string' ? Number(limit) : undefined,
      {
        search: typeof search === 'string' ? search : undefined,
        location: typeof location === 'string' ? location : undefined,
        sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      }
    );
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await campaignService.getOrganizationCampaigns(
      req.user._id,
      typeof page === 'string' ? Number(page) : undefined,
      typeof limit === 'string' ? Number(limit) : undefined
    );
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAppliedCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await campaignService.getDonorAppliedCampaigns(
      req.user._id,
      typeof page === 'string' ? Number(page) : undefined,
      typeof limit === 'string' ? Number(limit) : undefined
    );
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyForCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await campaignService.applyForCampaign(campaignId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Applied for campaign successfully',
      data: data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const imageName = req.file?.filename;

    const updateData: any = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.date) updateData.date = new Date(req.body.date);
    if (req.body.startTime !== undefined) updateData.startTime = req.body.startTime;
    if (req.body.endTime !== undefined) updateData.endTime = req.body.endTime;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.targetUnits !== undefined) {
      updateData.targetUnits = Number(req.body.targetUnits);
    }

    if (imageName) {
      updateData.imageName = imageName;
    }

    const data = await campaignService.updateCampaign(
      campaignId,
      req.user._id,
      updateData
    );

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await campaignService.deleteCampaign(campaignId, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCampaignParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { page, limit } = req.query;
    const data = await campaignService.getCampaignParticipants(
      campaignId,
      req.user._id,
      typeof page === 'string' ? Number(page) : undefined,
      typeof limit === 'string' ? Number(limit) : undefined
    );
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCampaignById = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await campaignService.getCampaignById(campaignId);
    if (!data) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCampaignsByMonth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month, page, limit } = req.query;

    if (!year || !month) {
      res.status(400).json({ success: false, message: 'Year and month are required' });
      return;
    }

    const data = await campaignService.getCampaignsByMonth(
      Number(year),
      Number(month),
      typeof page === 'string' ? Number(page) : undefined,
      typeof limit === 'string' ? Number(limit) : undefined
    );

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeApplicantFromCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const applicantId = Array.isArray(req.params.applicantId) ? req.params.applicantId[0] : req.params.applicantId;
    const data = await campaignService.removeApplicantFromCampaign(
      campaignId,
      req.user._id,
      applicantId
    );
    res.status(200).json({
      success: true,
      message: 'Applicant removed from campaign successfully',
      data: data,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
