import express from 'express';
import { 
  getAdminStats,
  getAllAppointments,
  updateAppointmentStatus,
  resetPropertyViews
} from '../controller/adminController.js';

const router = express.Router();

router.get('/stats', getAdminStats);
router.get('/appointments',getAllAppointments);
router.put('/appointments/status',updateAppointmentStatus);
router.post('/reset-views', resetPropertyViews);

export default router;