import mongoose, { Schema, Document } from "mongoose";
import { DonorUserType } from "../types/user.type";

const donorUserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    dateOfBirth: { type: String, required: false },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    address: { type: String, required: false },
    userType: { type: String, enum: ["donor"], default: "donor" },


    // optional
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String, sparse: true, unique: true },
    googleProfilePicture: { type: String, default: "" },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

// TypeScript interface
export interface IDonorUser extends DonorUserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Model
export const DonorUserModel = mongoose.model<IDonorUser>(
  "DonorUser",
  donorUserSchema
);
