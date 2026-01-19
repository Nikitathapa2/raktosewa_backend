import mongoose, { Schema, Document } from "mongoose";
import { OrganizationUserType } from "../types/user.type";

const organizationUserSchema: Schema = new Schema(
  {
    organizationName: { type: String, required: true },
    headOfOrganization: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    userType: { type: String, enum: ["organization"], default: "organization" },
    // optional
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String, sparse: true, unique: true },
    googleProfilePicture: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// TypeScript interface
export interface IOrganizationUser extends OrganizationUserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Model
export const OrganizationUserModel = mongoose.model<IOrganizationUser>(
  "OrganizationUser",
  organizationUserSchema
);
