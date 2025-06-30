import express from 'express';
import { 
  submitTestimonial, 
  getApprovedTestimonials, 
  getAllTestimonials, 
  updateTestimonialStatus, 
  deleteTestimonial,
  getAutoApprovalConfig,
  getTestimonialStats
} from '../controller/testimonialController.js';
import { verifyAdmin } from '../middleware/adminMiddleware.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// Public routes
router.post('/submit', submitTestimonial);
router.get('/approved', getApprovedTestimonials);

// Admin routes (protected)
router.get('/all', protect, verifyAdmin, getAllTestimonials);
router.put('/:id/status', protect, verifyAdmin, updateTestimonialStatus);
router.delete('/:id', protect, verifyAdmin, deleteTestimonial);
router.get('/config', protect, verifyAdmin, getAutoApprovalConfig);
router.get('/stats', protect, verifyAdmin, getTestimonialStats);

export default router; 