import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import asyncHandler from "./async";
import { DonorUserModel } from "../models/DonorUser.model";
import { OrganizationUserModel } from "../models/OrganizationUser.model";
import { UserModel } from "../models/user.model";
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
    (await UserModel.findById(id)) ||
    (await DonorUserModel.findById(id)) ||
    (await OrganizationUserModel.findById(id))
  );
};

/* ----------------------------------
   Protect Middleware
----------------------------------- */
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization?.toString();
    if (authHeader && authHeader.toLowerCase().startsWith("bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }

    try {
      if (!JWT_SECRET) {
        return res
          .status(500)
          .json({ message: "JWT secret not configured on server" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

      console.log('🔐 [AUTH DEBUG] Decoded token ID:', decoded.id);
      const user = await findUserById(decoded.id);

      if (!user) {
        console.log('🔐 [AUTH DEBUG] ❌ User not found for ID:', decoded.id);
        return res
          .status(401)
          .json({ message: "Not authorized to access this route" });
      }

      console.log('🔐 [AUTH DEBUG] ✅ User found:', user._id);
      console.log('🔐 [AUTH DEBUG] User email:', user.email);
      console.log('🔐 [AUTH DEBUG] User role:', user.role);
      console.log('🔐 [AUTH DEBUG] User object keys:', Object.keys(user.toObject ? user.toObject() : user));
      
      req.user = user;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: `caught error: ${error} - Not authorized to access this route` });
    }
  }
);

/* ----------------------------------
   Role Authorization Middleware
----------------------------------- */
export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Get userType from the user object and convert to uppercase
    const userRole = req.user?.userType?.toUpperCase();
    
    console.log('🛡️ [AUTHORIZE DEBUG] Required roles:', roles);
    console.log('🛡️ [AUTHORIZE DEBUG] User userType:', req.user?.userType);
    console.log('🛡️ [AUTHORIZE DEBUG] Converted role:', userRole);
    
    if (!userRole || !roles.includes(userRole)) {
      console.log('🛡️ [AUTHORIZE DEBUG] ❌ Role check failed');
      return res.status(403).json({
        message: `User role ${userRole} is not authorized to access this route`,
      });
    }
    
    console.log('🛡️ [AUTHORIZE DEBUG] ✅ Role check passed');
    next();
  };
