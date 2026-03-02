import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  imageName?: string;
  targetUnits?: number;
  participants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema: Schema = new Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationUser',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  imageName: {
    type: String,
  },
  targetUnits: {
    type: Number,
  },
  participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorUser'
  }]
}, { timestamps: true });

export const CampaignModel = mongoose.model<ICampaign>('Campaign', campaignSchema);
