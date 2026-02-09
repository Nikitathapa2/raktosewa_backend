import { OTPModel, IOTP } from "../models/OTP.model";
import { DonorUserModel, IDonorUser } from "../models/DonorUser.model";
import { OrganizationUserModel, IOrganizationUser } from "../models/OrganizationUser.model";
import { HttpError } from "../errors/http-error";
import { sendOTPEmail, sendPasswordResetConfirmation } from "../utils/email";
import bcryptjs from "bcryptjs";

/**
 * Generate a random OTP (6 digits)
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP expiry time (10 minutes from now)
 */
function getOTPExpiryTime(): Date {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 10);
  return expiryTime;
}

export class PasswordResetService {
  /**
   * Request password reset (send OTP)
   */
  async requestPasswordReset(email: string, userType: "donor" | "organization") {
    try {
      // Validate user exists
      let user;
      if (userType === "donor") {
        user = await DonorUserModel.findOne({ email });
      } else if (userType === "organization") {
        user = await OrganizationUserModel.findOne({ email });
      }

      if (!user) {
        throw new HttpError(404, "User not found with this email");
      }

      // Generate OTP
      const otp = generateOTP();
      const expiryTime = getOTPExpiryTime();

      // Delete existing OTP for this email and userType
      await OTPModel.deleteMany({ email, userType });

      // Save OTP to database
      const newOTP = new OTPModel({
        email,
        otp,
        userType,
        expiryTime,
        isUsed: false,
        attempts: 0,
      });

      await newOTP.save();

      // Send OTP via email
      await sendOTPEmail(email, otp);

      return {
        success: true,
        message: "OTP sent successfully to your email",
      };
    } catch (error: any) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, otp: string, userType: "donor" | "organization") {
    try {
      // Find OTP record
      const otpRecord = await OTPModel.findOne({
        email,
        userType,
        isUsed: false,
      });

      if (!otpRecord) {
        throw new HttpError(400, "OTP not found or already used");
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiryTime) {
        await OTPModel.deleteOne({ _id: otpRecord._id });
        throw new HttpError(410, "OTP has expired. Please request a new OTP");
      }

      // Check if max attempts exceeded
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        await OTPModel.deleteOne({ _id: otpRecord._id });
        throw new HttpError(429, "Maximum OTP verification attempts exceeded. Please request a new OTP");
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        const attemptsLeft = otpRecord.maxAttempts - otpRecord.attempts;
        throw new HttpError(400, `Invalid OTP. ${attemptsLeft} attempts remaining`);
      }

      // Mark OTP as used
      otpRecord.isUsed = true;
      await otpRecord.save();

      return {
        success: true,
        message: "OTP verified successfully",
      };
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
    userType: "donor" | "organization"
  ) {
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new HttpError(400, "Passwords do not match");
      }

      // Verify OTP first
      const otpRecord = await OTPModel.findOne({
        email,
        userType,
        isUsed: true,
        otp,
      });

      if (!otpRecord) {
        throw new HttpError(400, "Invalid OTP or OTP not verified");
      }

      // Find user
      let user;
      if (userType === "donor") {
        user = await DonorUserModel.findOne({ email });
      } else if (userType === "organization") {
        user = await OrganizationUserModel.findOne({ email });
      }

      if (!user) {
        throw new HttpError(404, "User not found");
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(newPassword, 10);

      // Update password
      if (userType === "donor") {
        await DonorUserModel.updateOne({ email }, { password: hashedPassword });
      } else if (userType === "organization") {
        await OrganizationUserModel.updateOne({ email }, { password: hashedPassword });
      }

      // Delete used OTP
      await OTPModel.deleteOne({ _id: otpRecord._id });

      // Send confirmation email
      const userName = userType === "donor" ? (user as IDonorUser).fullName : (user as IOrganizationUser).organizationName;
      await sendPasswordResetConfirmation(email, userName);

      return {
        success: true,
        message: "Password reset successfully. You can now log in with your new password",
      };
    } catch (error: any) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(email: string, userType: "donor" | "organization") {
    try {
      // Validate user exists
      let user;
      if (userType === "donor") {
        user = await DonorUserModel.findOne({ email });
      } else if (userType === "organization") {
        user = await OrganizationUserModel.findOne({ email });
      }

      if (!user) {
        throw new HttpError(404, "User not found with this email");
      }

      // Generate new OTP
      const otp = generateOTP();
      const expiryTime = getOTPExpiryTime();

      // Delete existing OTP records
      await OTPModel.deleteMany({ email, userType });

      // Save new OTP
      const newOTP = new OTPModel({
        email,
        otp,
        userType,
        expiryTime,
        isUsed: false,
        attempts: 0,
      });

      await newOTP.save();

      // Send OTP via email
      await sendOTPEmail(email, otp);

      return {
        success: true,
        message: "OTP resent successfully to your email",
      };
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      throw error;
    }
  }
}
