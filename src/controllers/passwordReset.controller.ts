import { Request, Response } from "express";
import { PasswordResetService } from "../services/passwordReset.service";
import { HttpError } from "../errors/http-error";
import {
  ForgotPasswordDTO,
  VerifyOTPDTO,
  ResetPasswordDTO,
  ResendOTPDTO,
} from "../dtos/user.dto";
import { z } from "zod";

const passwordResetService = new PasswordResetService();

export class PasswordResetController {
  /**
   * Request password reset (send OTP)
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const parsedData = ForgotPasswordDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const { email, userType } = parsedData.data;
      const result = await passwordResetService.requestPasswordReset(
        email,
        userType
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to request password reset",
      });
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(req: Request, res: Response) {
    try {
      const parsedData = VerifyOTPDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const { email, otp, userType } = parsedData.data;
      const result = await passwordResetService.verifyOTP(
        email,
        otp,
        userType
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "OTP verification failed",
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const parsedData = ResetPasswordDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const { email, otp, newPassword, confirmPassword, userType } = parsedData.data;
      const result = await passwordResetService.resetPassword(
        email,
        otp,
        newPassword,
        confirmPassword,
        userType
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Password reset failed",
      });
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(req: Request, res: Response) {
    try {
      const parsedData = ResendOTPDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const { email, userType } = parsedData.data;
      const result = await passwordResetService.resendOTP(email, userType);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Failed to resend OTP",
      });
    }
  }
}
