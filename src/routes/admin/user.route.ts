import { Router } from "express";

import uploads from "../../middlewares/uploads";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { AdminCampaignController } from "../../controllers/admin/campaign.controller";
import { AdminDashboardController } from "../../controllers/admin/dashboard.controller";
import { isAdmin, isLoggedIn } from "../../middlewares/authorized.middleware";

let adminUserController = new AdminUserController();
let adminCampaignController = new AdminCampaignController();
let adminDashboardController = new AdminDashboardController();

const router = Router();

/* ----------------------------------
   Admin Registration and Login Routes (Public - no middleware)
   These routes must be defined BEFORE applying middleware
----------------------------------- */
router.post("/register", adminUserController.registerAdmin);
router.post("/login", adminUserController.loginAdmin);

/* ----------------------------------
   Apply Admin Authorization
   All routes below require logged-in user with admin role
----------------------------------- */
router.use(isLoggedIn);
router.use(isAdmin);

// Admin profile routes
router.get("/me", adminUserController.getAdminProfile);
router.put("/change-password", adminUserController.changeAdminPassword);

// Admin dashboard stats
router.get("/stats/dashboard", adminDashboardController.getDashboardStats);

/* ----------------------------------
   Admin User Management Routes
   Requires: isLoggedIn + isAdmin middleware
   All routes use /users prefix: /api/v1/admin/users
----------------------------------- */

// Create new user (with optional profile image)
router.post("/users", uploads.single("profilePicture"), adminUserController.createUser);

// Get all users
router.get("/users", adminUserController.getAllUsers);

// Get single user by ID
router.get("/users/:id", adminUserController.getUserById);

// Update user (with optional profile image)
router.put("/users/:id", uploads.single("profilePicture"), adminUserController.updateUser);

// Delete user
router.delete("/users/:id", adminUserController.deleteUser);

/* ----------------------------------
   Admin Campaign Management Routes
   Requires: isLoggedIn + isAdmin middleware
   All routes use /campaigns prefix: /api/v1/admin/campaigns
----------------------------------- */

// Create campaign (with optional campaign image)
router.post("/campaigns", uploads.single("campaignImage"), adminCampaignController.createCampaign);

// Get all campaigns
router.get("/campaigns", adminCampaignController.getAllCampaigns);

// Get single campaign by ID
router.get("/campaigns/:id", adminCampaignController.getCampaignById);

// Update campaign (with optional campaign image)
router.put("/campaigns/:id", uploads.single("campaignImage"), adminCampaignController.updateCampaign);

// Delete campaign
router.delete("/campaigns/:id", adminCampaignController.deleteCampaign);

export default router;
