import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', protect, notificationController.getMyNotifications);

export default router;
