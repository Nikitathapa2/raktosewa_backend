import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "./async";
import { DonorUserModel } from "../models/DonorUser.model";
import { OrganizationUserModel } from "../models/OrganizationUser.model";
import { AdminUserModel } from "../models/AdminUser.model";
import { JWT_SECRET } from "../config";

/* ----------------------------------
   Extend Express Request type
----------------------------------- */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/* ----------------------------------
   JWT Payload Interface
----------------------------------- */
interface DecodedToken extends JwtPayload {
  id: string;
}

/* ----------------------------------
   Find user across all collections
----------------------------------- */
const findUserById = async (id: string) => {
  return (
    (await DonorUserModel.findById(id)) ||
    (await OrganizationUserModel.findById(id)) ||
    (await AdminUserModel.findById(id))
  );
};

/* ----------------------------------
   Logged In Middleware
   Verifies JWT token and attaches user to request
----------------------------------- */
export const isLoggedIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization?.toString();
    if (authHeader && authHeader.toLowerCase().startsWith("bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route. Please login.",
      });
    }

    try {
      if (!JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message: "JWT secret not configured on server",
        });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      const user = await findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized to access this route",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: `Not authorized to access this route`,
      });
    }
  }
);

/* ----------------------------------
   Admin Authorization Middleware
   Checks if logged-in user has admin role
   Must be used after isLoggedIn middleware
----------------------------------- */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated. Please login first.",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: `User role '${req.user.role}' is not authorized to access this route. Admin access required.`,
    });
  }

  next();
};

/* ----------------------------------
   Authorized Middleware (Keep for backwards compatibility)
   Combines isLoggedIn and isAdmin
----------------------------------- */
export const authorizedMiddleware = isLoggedIn;
export const adminMiddleware = isAdmin;
