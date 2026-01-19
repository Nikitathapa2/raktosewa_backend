import { Request, Response } from "express";
import { DonorUserService } from "../services/donorUser.service";
import { CreateDonorDTO, LoginUserDTO } from "../dtos/user.dto";
import { z } from "zod";
import { HttpError } from "../errors/http-error";

const donorUserService = new DonorUserService();

export class DonorUserController {
  // Register donor
  async registerDonor(req: Request, res: Response) {
    try {
      const parsedData = CreateDonorDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const newDonor = await donorUserService.registerDonor(parsedData.data);
      return res.status(201).json({
        success: true,
        message: "Donor registered successfully",
        data: newDonor,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Login donor
  async loginDonor(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        throw new HttpError(400, "Invalid credentials");
      }

      const { token, sendDonor } = await donorUserService.loginDonor(parsedData.data);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: sendDonor,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Get all donors
  async getAllDonors(req: Request, res: Response) {
    try {
      const donors = await donorUserService.getAllDonors();
      return res.status(200).json({
        success: true,
        data: donors,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Get donor by ID
  async getDonorById(req: Request, res: Response) {
    try {
      const donor = await donorUserService.getDonorById(req.params.id);
      return res.status(200).json({
        success: true,
        data: donor,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Update donor
  async updateDonor(req: Request, res: Response) {
    try {
      const updatedDonor = await donorUserService.updateDonor(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: "Donor updated successfully",
        data: updatedDonor,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
