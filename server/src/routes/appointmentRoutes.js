import express from 'express';
import {
  createAppointment, getAppointments, getMyAppointments, updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public can book without logging in; if logged in, req.user attaches automatically
router.post('/', (req, res, next) => {
  // Soft auth: attach req.user if a valid token is present, otherwise continue as guest
  if (req.cookies?.token || req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createAppointment);

router.get('/mine', protect, getMyAppointments);

router.get('/', protect, authorize(ROLES.ADMIN, ROLES.RECEPTIONIST), getAppointments);
router.patch('/:id/status', protect, authorize(ROLES.ADMIN, ROLES.RECEPTIONIST), updateAppointmentStatus);

export default router;
