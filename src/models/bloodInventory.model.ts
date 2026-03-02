import mongoose, { Schema, Document } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface IBloodInventory extends Document {
  _id: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  bloodGroup: BloodGroup;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const bloodInventorySchema: Schema = new Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationUser',
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

// Ensure one entry per blood group per organization
bloodInventorySchema.index({ organization: 1, bloodGroup: 1 }, { unique: true });

export const BloodInventoryModel = mongoose.model<IBloodInventory>('BloodInventory', bloodInventorySchema);
