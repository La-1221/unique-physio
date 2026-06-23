import express from 'express';
import {
  getTodaysSessions, checkInSession, markSessionMissed, getPatientSessions, sweepMissedSessions,
} from '../controllers/sessionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN, ROLES.RECEPTIONIST));

router.get('/today', getTodaysSessions);
router.get('/patient/:patientId', getPatientSessions);
router.post('/:id/check-in', checkInSession);
router.post('/:id/mark-missed', markSessionMissed);
router.post('/sweep-missed', authorize(ROLES.ADMIN), sweepMissedSessions);

export default router;
