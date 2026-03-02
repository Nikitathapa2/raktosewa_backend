import express from 'express';
import * as donationController from '../controllers/donation.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/walkin', protect, authorize('ORGANIZATION'), donationController.registerWalkin);
router.post('/register', protect, authorize('ORGANIZATION'), donationController.registerRegisteredDonation);

router.get('/history', protect, donationController.getHistory);

export default router;
