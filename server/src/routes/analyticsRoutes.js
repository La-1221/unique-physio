import express from 'express';
import {
  getSummary, getDailySeries, getMonthlySeries, getServiceMix,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get('/summary', getSummary);
router.get('/daily', getDailySeries);
router.get('/monthly', getMonthlySeries);
router.get('/service-mix', getServiceMix);

export default router;
