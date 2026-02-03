import { AdminCreateUserDTO, UpdateUserDTO, UpdateProfileDTO } from "../../dtos/user.dto";
import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/user.service";

let adminUserService = new AdminUserService();

export class AdminUserController {
  /* ----------------------------------
     Create User (Admin Only)
     POST /api/admin/users
  ----------------------------------- */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      // When FormData is received, Multer parses it:
      // - Files go to req.file (if single) or req.files (if multiple)
      // - Text fields go to req.body
      console.log('Create user request body:', req.body);
      console.log('Create user request file:', req.file);

      const parsedData = AdminCreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        console.error('Validation errors:', parsedData.error);
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      // Handle profile picture upload
      if (req.file) {
        parsedData.data.profilePicture = req.file.filename;
      }

      const userData: AdminCreateUserDTO = parsedData.data;
      const newUser = await adminUserService.createUser(userData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    } catch (error: Error | any) {
      console.error('Create user error:', error);
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error creating user",
      });
    }
  }

  /* ----------------------------------
     Create Admin User (Admin Registration)
     POST /api/admin/register
  ----------------------------------- */
  async registerAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }
      const admin = await adminUserService.createAdminUser(email, password);
      return res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: { email: admin.email, id: admin._id },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error registering admin",
      });
    }
  }

  /* ----------------------------------
     Get All Users (Admin Only)
     GET /api/admin/users
  ----------------------------------- */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminUserService.getAllUsers();

      return res.status(200).json({
        success: true,
        data: users,
        message: "All users retrieved successfully",
        count: users.length,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error retrieving users",
      });
    }
  }

  /* ----------------------------------
     Get User by ID (Admin Only)
     GET /api/admin/users/:id
  ----------------------------------- */
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const user = await adminUserService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error retrieving user",
      });
    }
  }

  /* ----------------------------------
     Update User (Admin Only)
     PUT /api/admin/users/:id
  ----------------------------------- */
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      // Handle profile picture upload
      if (req.file) {
        parsedData.data.profilePicture = req.file.filename;
      }

      const updateData: UpdateUserDTO = parsedData.data;
      const updatedUser = await adminUserService.updateUser(userId, updateData);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error updating user",
      });
    }
  }

  /* ----------------------------------
     Delete User (Admin Only)
     DELETE /api/admin/users/:id
  ----------------------------------- */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const deleted = await adminUserService.deleteUser(userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error deleting user",
      });
    }
  }

  /* ----------------------------------
     Update User's Own Profile
     PUT /api/auth/:id
     For logged-in users to update their own profile
  ----------------------------------- */
  async updateOwnProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      // Verify user is updating their own profile
      if (req.user?.id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own profile",
        });
      }

      const parsedData = UpdateProfileDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      // Handle profile picture upload
      if (req.file) {
        parsedData.data.profilePicture = req.file.filename;
      }

      const updateData: UpdateProfileDTO = parsedData.data;
      const updatedProfile = await adminUserService.updateUserProfile(userId, updateData);

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error updating profile",
      });
    }
  }

  /* ----------------------------------
     Admin Login (Get Token)
     POST /api/admin/login
  ----------------------------------- */
  async loginAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }
      const admin = await adminUserService.authenticateAdmin(email, password);
      // Generate JWT token
      const jwt = require("jsonwebtoken");
      const { JWT_SECRET } = process.env;
      const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
        user: { _id: admin._id, email: admin.email, role: admin.role },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Error logging in admin",
      });
    }
  }
}