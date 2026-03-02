import express from 'express';
import * as requestController from '../controllers/request.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Donor Routes - Get all requests and details
router.get('/', protect, authorize('DONOR', 'ADMIN'), requestController.getAllRequests);

// Organization Routes - Manage requests
router.post('/', protect, authorize('ORGANIZATION'), requestController.createRequest);
router.get('/my-requests/', protect, authorize('ORGANIZATION'), requestController.getMyRequests);
router.get('/my-accepted', protect, authorize('DONOR'), requestController.getMyAcceptedRequests);
router.get('/:id', protect, requestController.getRequestById);

router.post('/:id/accept', protect, authorize('DONOR'), requestController.acceptRequest);

router.get('/:id/applicants', protect, authorize('ORGANIZATION'), requestController.getRequestApplicants);
router.delete('/:id/applicants/:applicantId', protect, authorize('ORGANIZATION'), requestController.removeApplicantFromRequest);
router.put('/:id', protect, authorize('ORGANIZATION'), requestController.updateRequest);
router.delete('/:id', protect, authorize('ORGANIZATION'), requestController.deleteRequest);
export default router;
