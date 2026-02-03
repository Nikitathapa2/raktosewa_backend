import { Router } from "express";
import { isLoggedIn } from "../middlewares/authorized.middleware";
import { AdminUserController } from "../controllers/admin/user.controller";
import uploads from "../middlewares/uploads";

let adminUserController = new AdminUserController();

const router = Router();

/* ----------------------------------
   User Authentication & Profile Routes
   These routes are for logged-in users
----------------------------------- */

/* ----------------------------------
   Update User's Own Profile
   PUT /api/auth/:id
   
   Requires: Authentication (isLoggedIn)
   Body: UpdateProfileDTO (optional fields)
   File: Optional profile picture upload
   
   User can only update their own profile
   (not other users' profiles)
----------------------------------- */
router.put(
  "/:id",
  isLoggedIn,
  uploads.single("profilePicture"),
  adminUserController.updateOwnProfile
);

export default router;
