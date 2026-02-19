import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  address: string;
  website?: string;
  licenseNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const organizationProfileSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
}, { timestamps: true });

export const OrganizationProfileModel = mongoose.model<IOrganizationProfile>('OrganizationProfile', organizationProfileSchema);
