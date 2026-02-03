import { Router } from "express";

import uploads from "../../middlewares/uploads";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { isAdmin, isLoggedIn } from "../../middlewares/authorized.middleware";

let adminUserController = new AdminUserController();

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

/* ----------------------------------
   Admin User Management Routes
   Requires: isLoggedIn + isAdmin middleware
----------------------------------- */

// Create new user (with optional profile image)
router.post("/", uploads.single("profilePicture"), adminUserController.createUser);

// Get all users
router.get("/", adminUserController.getAllUsers);

// Get single user by ID
router.get("/:id", adminUserController.getUserById);

// Update user (with optional profile image)
router.put("/:id", uploads.single("profilePicture"), adminUserController.updateUser);

// Delete user
router.delete("/:id", adminUserController.deleteUser);

export default router;
