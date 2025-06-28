import express from 'express';
import { trackVisit, getVisitorStats, getAdminVisitorStats } from '../controller/visitorController.js';
import { protect } from '../middleware/authmiddleware.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Track a visit (public route)
router.post('/track', trackVisit);

// Get visitor statistics (public route)
router.get('/stats', getVisitorStats);

// Get detailed visitor statistics for admin (protected)
router.get('/admin/stats', protect, verifyAdmin, getAdminVisitorStats);

export default router; 