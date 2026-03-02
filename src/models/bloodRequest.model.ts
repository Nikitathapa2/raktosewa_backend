import mongoose, { Schema, Document } from 'mongoose';
import { BloodGroup } from './bloodInventory.model';

export interface IBloodRequest extends Document {
  _id: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency: 'NORMAL' | 'CRITICAL';
  location: string;
  contactNumber: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
  acceptedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const bloodRequestSchema: Schema = new Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationUser',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: 1,
  },
  urgency: {
    type: String,
    enum: ['NORMAL', 'CRITICAL'],
    default: 'NORMAL',
  },
  location: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'FULFILLED', 'CANCELLED'],
    default: 'PENDING',
  },
  acceptedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonorUser',
  }],
}, { timestamps: true });

export const BloodRequestModel = mongoose.model<IBloodRequest>('BloodRequest', bloodRequestSchema);
