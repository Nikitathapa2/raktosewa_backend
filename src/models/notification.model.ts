import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'CAMPAIGN' | 'BLOOD_REQUEST' | 'APPLICATION' | 'DONATION';
export type NotificationUserModel = 'DonorUser' | 'OrganizationUser' | 'User';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  receiverModel: NotificationUserModel;
  sender: mongoose.Types.ObjectId;
  senderModel: NotificationUserModel;
  type: NotificationType;
  message: string;
  relatedEntityId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema = new Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'receiverModel',
    },
    receiverModel: {
      type: String,
      required: true,
      enum: ['DonorUser', 'OrganizationUser', 'User'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel',
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['DonorUser', 'OrganizationUser', 'User'],
    },
    type: {
      type: String,
      enum: ['CAMPAIGN', 'BLOOD_REQUEST', 'APPLICATION', 'DONATION'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ receiver: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
