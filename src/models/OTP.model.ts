import mongoose, { Schema, Document } from "mongoose";

const otpSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ["donor", "organization"],
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiryTime: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete expired documents
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for email and userType
otpSchema.index({ email: 1, userType: 1 });

export interface IOTP extends Document {
  email: string;
  otp: string;
  userType: "donor" | "organization";
  isUsed: boolean;
  expiryTime: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export const OTPModel = mongoose.model<IOTP>("OTP", otpSchema);
