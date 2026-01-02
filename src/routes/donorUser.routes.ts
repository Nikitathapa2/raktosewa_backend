import { Router } from "express";
import { DonorUserController } from "../controllers/donorUser.controller";

const router = Router();
const donorController = new DonorUserController();


// Register a new donor
router.post("/register", (req, res) => donorController.registerDonor(req, res));

// Login donor
router.post("/login", (req, res) => donorController.loginDonor(req, res));

// Get all donors
router.get("/", (req, res) => donorController.getAllDonors(req, res));

// Get donor by ID
router.get("/:id", (req, res) => donorController.getDonorById(req, res));

// Update donor by ID
router.put("/:id", (req, res) => donorController.updateDonor(req, res));

export default router;
