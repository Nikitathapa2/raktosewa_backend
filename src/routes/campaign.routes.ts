import express from 'express';
import * as campaignController from '../controllers/campaign.controller';
import { protect, authorize } from '../middlewares/auth.middleware';
import { uploadImage } from '../middlewares/uploads';

const router = express.Router();

/* =========================
   ORGANIZATION ROUTES
========================= */

// Create campaign
router.post(
  '/',
  protect,
  authorize('ORGANIZATION'),
  uploadImage.single('campaignImage'),
  campaignController.createCampaign
);

// Get campaigns created by organization
router.get(
  '/my-campaigns',
  protect,
  authorize('ORGANIZATION'),
  campaignController.getMyCampaigns
);

// Get campaign participants
router.get(
  '/:id/participants',
  protect,
  authorize('ORGANIZATION'),
  campaignController.getCampaignParticipants
);

// Remove applicant from campaign
router.delete(
  '/:id/applicants/:applicantId',
  protect,
  authorize('ORGANIZATION'),
  campaignController.removeApplicantFromCampaign
);

// Update campaign
router.put(
  '/:id',
  protect,
  authorize('ORGANIZATION'),
  uploadImage.single('campaignImage'),
  campaignController.updateCampaign
);

// Delete campaign
router.delete(
  '/:id',
  protect,
  authorize('ORGANIZATION'),
  campaignController.deleteCampaign
);

/* =========================
   DONOR ROUTES
========================= */

// Get campaigns donor applied to
router.get(
  '/my-applied',
  protect,
  authorize('DONOR'),
  campaignController.getMyAppliedCampaigns
);

// Apply for campaign
router.post(
  '/:id/apply',
  protect,
  authorize('DONOR'),
  campaignController.applyForCampaign
);

/* =========================
   COMMON ROUTES
========================= */

// Get campaigns by month (for calendar view)
router.get(
  '/by-month',
  protect,
  campaignController.getCampaignsByMonth
);

// Get all campaigns (public - no auth required)
router.get(
  '/',
  campaignController.getAllCampaigns
);

// Get single campaign by ID
router.get(
  '/:id',
  protect,
  campaignController.getCampaignById
);

export default router;