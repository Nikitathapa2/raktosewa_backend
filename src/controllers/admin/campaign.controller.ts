import { Request, Response } from 'express';
import { OrganizationUserModel } from '../../models/OrganizationUser.model';
import * as campaignService from '../../services/campaign.service';

export class AdminCampaignController {
  getAllCampaigns = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const data = await campaignService.getAllCampaignsForAdmin(
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

  getCampaignById = async (req: Request, res: Response): Promise<void> => {
    try {
      const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await campaignService.getCampaignById(campaignId);

      if (!data) {
        res.status(404).json({ success: false, message: 'Campaign not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  createCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const imageName = req.file?.filename;
      const { organizationId } = req.body;

      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      const organization = await OrganizationUserModel.findById(organizationId);
      if (!organization) {
        throw new Error('Invalid organization ID');
      }

      if (!req.body.date) {
        throw new Error('Campaign date is required');
      }

      const data = await campaignService.createCampaignAsAdmin(organizationId, {
        title: req.body.title,
        description: req.body.description,
        date: new Date(req.body.date),
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        location: req.body.location,
        targetUnits: req.body.targetUnits ? Number(req.body.targetUnits) : undefined,
        imageName,
      });

      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  updateCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const imageName = req.file?.filename;

      const updateData: any = {};
      if (req.body.organizationId !== undefined) {
        const organization = await OrganizationUserModel.findById(req.body.organizationId);
        if (!organization) {
          throw new Error('Invalid organization ID');
        }
        updateData.organization = req.body.organizationId;
      }
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

      const data = await campaignService.updateCampaignAsAdmin(campaignId, updateData);

      res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        data,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  deleteCampaign = async (req: Request, res: Response): Promise<void> => {
    try {
      const campaignId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const data = await campaignService.deleteCampaignAsAdmin(campaignId);

      res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully',
        data,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
