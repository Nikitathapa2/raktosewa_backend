import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const receiverModel = notificationService.getUserModelName(req.user);
    const data = await notificationService.getNotificationsForUser(
      req.user._id,
      receiverModel
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
