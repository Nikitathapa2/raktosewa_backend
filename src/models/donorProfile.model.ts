import mongoose, { Schema, Document } from 'mongoose';
import { BloodGroup } from './bloodInventory.model';

export interface IDonorProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  address: string;
  dob: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  lastDonationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const donorProfileSchema: Schema = new Schema({
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
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
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
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER'],
    required: true,
  },
  lastDonationDate: {
    type: Date,
  },
}, { timestamps: true });

export const DonorProfileModel = mongoose.model<IDonorProfile>('DonorProfile', donorProfileSchema);
