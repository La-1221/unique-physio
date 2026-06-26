import express from 'express';
import {
  createAppointment, getAppointments, getMyAppointments,
  updateAppointmentStatus, rescheduleAppointment, cancelAppointment,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/', (req, res, next) => {
  if (req.cookies?.token || req.headers.authorization) return protect(req, res, next);
  next();
}, createAppointment);

router.get('/mine', protect, getMyAppointments);
router.patch('/:id/reschedule', protect, rescheduleAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);

router.get('/', protect, authorize(ROLES.ADMIN, ROLES.RECEPTIONIST), getAppointments);
router.patch('/:id/status', protect, authorize(ROLES.ADMIN, ROLES.RECEPTIONIST), updateAppointmentStatus);

export default router;
