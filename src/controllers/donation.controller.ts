import { Request, Response } from 'express';
import * as donationService from '../services/donation.service';

export const registerWalkin = async (req: Request, res: Response): Promise<void> => {
  try {
    const donationData = {
      ...req.body,
      donorType: 'WALKIN' as const,
      donorId: null
    };
    const data = await donationService.registerDonation(req.user._id, donationData);
    res.status(201).json({
      success: true,
      message: 'Walk-in donation recorded successfully',
      data: data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const registerRegisteredDonation = async (req: Request, res: Response): Promise<void> => {
  try {
    const donationData = {
      ...req.body,
      donorType: 'REGISTERED' as const
    };
    const data = await donationService.registerDonation(req.user._id, donationData);
    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: data
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const data = await donationService.getHistory(req.user._id, req.user.role, page ? Number(page) : undefined, limit ? Number(limit) : undefined);
    res.status(200).json({
      success: true,
      ...data
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
