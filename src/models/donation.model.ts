import mongoose, { Schema, Document } from 'mongoose';
import { BloodGroup } from './bloodInventory.model';

export interface IWalkinDonor {
  name: string;
  phone: string;
  bloodGroup: BloodGroup;
  age: number;
  gender: string;
}

export interface IDonation extends Document {
  _id: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  donorType: 'REGISTERED' | 'WALKIN';
  donorId?: mongoose.Types.ObjectId | null;
  walkinDonor?: IWalkinDonor;
  bloodGroup: BloodGroup;
  units: number;
  donationDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema: Schema = new Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  donorType: {
    type: String,
    enum: ['REGISTERED', 'WALKIN'],
    required: true,
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  walkinDonor: {
    name: String,
    phone: String,
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    age: Number,
    gender: String,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  units: {
    type: Number,
    required: true,
    min: 1,
  },
  donationDate: {
    type: Date,
    default: Date.now,
  },
  notes: String,
}, { timestamps: true });

export const DonationModel = mongoose.model<IDonation>('Donation', donationSchema);
