import express from 'express';
import {
  createPatient, searchPatients, getPatients, getPatientById, updatePatient, recordPayment,
} from '../controllers/patientController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN, ROLES.RECEPTIONIST));

router.route('/').get(getPatients).post(createPatient);
router.get('/search', searchPatients);
router.route('/:id').get(getPatientById).put(updatePatient);
router.post('/:id/payment', recordPayment);

export default router;
