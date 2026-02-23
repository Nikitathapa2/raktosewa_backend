import express from 'express';
import * as inventoryController from '../controllers/inventory.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Donor endpoints (read-only access to all blood stock)
router.get('/all-stock', protect, authorize('DONOR', 'ADMIN'), inventoryController.getAllBloodStock);

// Organization endpoints
router.get('/', protect, authorize('ORGANIZATION',), inventoryController.getMyInventory);
router.post('/update', protect, authorize('ORGANIZATION'), inventoryController.updateInventory);
router.delete('/:bloodGroup', protect, authorize('ORGANIZATION'), inventoryController.deleteInventory);

export default router;
