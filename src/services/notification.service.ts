import mongoose from 'mongoose';
import {
  NotificationModel,
  NotificationType,
  NotificationUserModel,
} from '../models/notification.model';
import { DonorUserModel } from '../models/DonorUser.model';
import { OrganizationUserModel } from '../models/OrganizationUser.model';

let io: any;

export const setSocketIO = (socketIO: any) => {
  io = socketIO;
};

interface CreateNotificationInput {
  receiverId: string | mongoose.Types.ObjectId;
  receiverModel: NotificationUserModel;
  senderId: string | mongoose.Types.ObjectId;
  senderModel: NotificationUserModel;
  type: NotificationType;
  message: string;
  relatedEntityId?: string | mongoose.Types.ObjectId;
}

interface CreateBulkNotificationInput {
  senderId: string | mongoose.Types.ObjectId;
  senderModel: NotificationUserModel;
  type: NotificationType;
  message: string;
  relatedEntityId?: string | mongoose.Types.ObjectId;
}

/**
 * Get user model name based on userType
 */
export const getUserModelName = (user: any): NotificationUserModel => {
  const userType = user?.userType?.toLowerCase();
  if (userType === 'donor') return 'DonorUser';
  if (userType === 'organization') return 'OrganizationUser';
  return 'User';
};

/**
 * Create a single notification and emit via Socket.IO
 */
export const createNotification = async (
  input: CreateNotificationInput
) => {
  const notification = await NotificationModel.create({
    receiver: input.receiverId,
    receiverModel: input.receiverModel,
    sender: input.senderId,
    senderModel: input.senderModel,
    type: input.type,
    message: input.message,
    relatedEntityId: input.relatedEntityId,
    isRead: false,
  });

  // Emit real-time notification via Socket.IO
  if (io) {
    io.to(`user:${input.receiverId}`).emit('notification', {
      _id: notification._id.toString(),
      receiver: notification.receiver.toString(),
      sender: notification.sender.toString(),
      type: notification.type,
      message: notification.message,
      relatedEntityId: notification.relatedEntityId?.toString(),
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    });
    console.log(`📢 Notification emitted to user:${input.receiverId}`);
  }

  return notification;
};

/**
 * Create notifications for all donors (bulk) and emit via Socket.IO
 */
export const createNotificationsForAllDonors = async (
  input: CreateBulkNotificationInput
) => {
  const donors = await DonorUserModel.find({}, { _id: 1 }).lean();
  if (!donors.length) return [];

  const docs = donors.map((donor) => ({
    receiver: donor._id,
    receiverModel: 'DonorUser' as NotificationUserModel,
    sender: input.senderId,
    senderModel: input.senderModel,
    type: input.type,
    message: input.message,
    relatedEntityId: input.relatedEntityId,
    isRead: false,
  }));

  const notifications = await NotificationModel.insertMany(docs);

  // Emit real-time notifications via Socket.IO
  if (io) {
    notifications.forEach((notification) => {
      io.to(`user:${notification.receiver}`).emit('notification', {
        _id: notification._id.toString(),
        receiver: notification.receiver.toString(),
        sender: notification.sender.toString(),
        type: notification.type,
        message: notification.message,
        relatedEntityId: notification.relatedEntityId?.toString(),
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
      });
    });
    console.log(`📢 Bulk notifications emitted to ${notifications.length} donors`);
  }

  return notifications;
};

/**
 * Fetch notifications for a user
 */
export const getNotificationsForUser = async (
  receiverId: string | mongoose.Types.ObjectId,
  receiverModel: NotificationUserModel
) => {
  return await NotificationModel.find({ receiver: receiverId, receiverModel })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Helper to get organization name
 */
export const buildOrganizationName = async (
  organizationId: string | mongoose.Types.ObjectId
) => {
  const org = await OrganizationUserModel.findById(organizationId)
    .select('organizationName')
    .lean();
  return org?.organizationName ?? 'an organization';
};

/**
 * Helper to get donor name
 */
export const buildDonorName = async (
  donorId: string | mongoose.Types.ObjectId
) => {
  const donor = await DonorUserModel.findById(donorId).select('fullName').lean();
  return donor?.fullName ?? 'A donor';
};
