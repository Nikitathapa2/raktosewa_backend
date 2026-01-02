import { Router } from "express";
import { OrganizationUserController } from "../controllers/organizationUser.controller";

const router = Router();
const orgController = new OrganizationUserController();


// Register a new organization
router.post("/register", (req, res) => orgController.registerOrganization(req, res));

// Login organization
router.post("/login", (req, res) => orgController.loginOrganization(req, res));

// Get all organizations
router.get("/", (req, res) => orgController.getAllOrganizations(req, res));

// Get organization by ID
router.get("/:id", (req, res) => orgController.getOrganizationById(req, res));

// Update organization by ID
router.put("/:id", (req, res) => orgController.updateOrganization(req, res));

export default router;
