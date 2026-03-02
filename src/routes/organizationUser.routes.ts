import { Router } from "express";
import { OrganizationUserController } from "../controllers/organizationUser.controller";
import { PasswordResetController } from "../controllers/passwordReset.controller";
import { protect } from "../middlewares/auth.middleware";
import { uploadImage } from "../middlewares/uploads";

const router = Router();
const orgController = new OrganizationUserController();
const passwordResetController = new PasswordResetController();


// Register a new organization
router.post("/register", (req, res) => orgController.registerOrganization(req, res));

// Login organization
router.post("/login", (req, res) => orgController.loginOrganization(req, res));

// Password Reset Routes
router.post("/forgot-password", (req, res) => passwordResetController.forgotPassword(req, res));
router.post("/verify-otp", (req, res) => passwordResetController.verifyOTP(req, res));
router.post("/reset-password", (req, res) => passwordResetController.resetPassword(req, res));
router.post("/resend-otp", (req, res) => passwordResetController.resendOTP(req, res));
router.get("/", (req, res) => orgController.getAllOrganizations(req, res));

// Get organization by ID
router.get("/:id", (req, res) => orgController.getOrganizationById(req, res));

// Get organization dashboard statistics
router.get("/dashboard/stats", protect, (req, res) => orgController.getDashboardStats(req, res));

// Update organization by ID
router.put("/:id", (req, res) => orgController.updateOrganization(req, res));

router.post(
	'/upload-photo',
	protect,
	uploadImage.single('profilePicture'),
	(req, res) => orgController.uploadProfilePhoto(req, res)
);


export default router;
