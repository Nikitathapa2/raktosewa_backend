import { Request, Response } from "express";
import { OrganizationUserService } from "../services/organizationUser.service";
import { CreateOrganizationDTO, LoginUserDTO } from "../dtos/user.dto";
import { z } from "zod";
import { HttpError } from "../errors/http-error";

const organizationUserService = new OrganizationUserService();

export class OrganizationUserController {
  // Register organization
  async registerOrganization(req: Request, res: Response) {
    try {
      const parsedData = CreateOrganizationDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const newOrg = await organizationUserService.registerOrganization(parsedData.data);
      return res.status(201).json({
        success: true,
        message: "Organization registered successfully",
        data: newOrg,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Login organization
  async loginOrganization(req: Request, res: Response) {
    try {
      const parsedData = LoginUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        throw new HttpError(400, "Invalid credentials");
      }

      const { token, organization } = await organizationUserService.loginOrganization(parsedData.data);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: organization,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Get all organizations
  async getAllOrganizations(req: Request, res: Response) {
    try {
      const orgs = await organizationUserService.getAllOrganizations();
      return res.status(200).json({
        success: true,
        data: orgs,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Get organization by ID
  async getOrganizationById(req: Request, res: Response) {
    try {
      const org = await organizationUserService.getOrganizationById(req.params.id);
      return res.status(200).json({
        success: true,
        data: org,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  // Update organization
  async updateOrganization(req: Request, res: Response) {
    try {
      const updatedOrg = await organizationUserService.updateOrganization(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: "Organization updated successfully",
        data: updatedOrg,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
