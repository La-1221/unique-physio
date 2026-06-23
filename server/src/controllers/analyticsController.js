import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';
import Session from '../models/Session.js';
import Appointment from '../models/Appointment.js';
import {
  getClinicDayStart, getClinicDayEnd,
  getClinicMonthRange, getClinicYearRange,
  toEthiopianLocal,
} from '../utils/ethiopianTime.js';

const sumAmount = async (start, end) => {
  const result = await Patient.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  return { total: result[0]?.total || 0, count: result[0]?.count || 0 };
};

// @desc    Summary cards: today / this month / this year income & patient counts
// @route   GET /api/analytics/summary
// @access  Private/Admin
export const getSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayRange = { start: getClinicDayStart(now), end: getClinicDayEnd(now) };
  const monthRange = getClinicMonthRange(now);
  const yearRange = getClinicYearRange(now);

  const [today, month, year] = await Promise.all([
    sumAmount(todayRange.start, todayRange.end),
    sumAmount(monthRange.start, monthRange.end),
    sumAmount(yearRange.start, yearRange.end),
  ]);

  const [todaysSessions, totalActivePatients, pendingAppointments] = await Promise.all([
    Session.countDocuments({ scheduledDate: { $gte: todayRange.start, $lt: todayRange.end } }),
    Patient.countDocuments({ status: 'active' }),
    Appointment.countDocuments({ status: 'pending' }),
  ]);

  res.json({
    success: true,
    today: { income: today.total, newPatients: today.count, sessionsToday: todaysSessions },
    month: { income: month.total, newPatients: month.count },
    year: { income: year.total, newPatients: year.count },
    totalActivePatients,
    pendingAppointments,
  });
});

// @desc    Daily income/patient series for the last N days (default 30) — for charts
// @route   GET /api/analytics/daily?days=30
// @access  Private/Admin
export const getDailySeries = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const now = new Date();
  const series = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const start = getClinicDayStart(dayDate);
    const end = getClinicDayEnd(dayDate);
    const { total, count } = await sumAmount(start, end);
    const eatLabel = toEthiopianLocal(start);
    series.push({
      date: `${eatLabel.getUTCFullYear()}-${String(eatLabel.getUTCMonth() + 1).padStart(2, '0')}-${String(eatLabel.getUTCDate()).padStart(2, '0')}`,
      income: total,
      newPatients: count,
    });
  }

  res.json({ success: true, series });
});

// @desc    Monthly income/patient series for the last N months (default 12) — for charts
// @route   GET /api/analytics/monthly?months=12
// @access  Private/Admin
export const getMonthlySeries = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months, 10) || 12;
  const now = new Date();
  const series = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const { start, end } = getClinicMonthRange(monthDate);
    const { total, count } = await sumAmount(start, end);
    const eatLabel = toEthiopianLocal(start);
    series.push({
      month: `${eatLabel.getUTCFullYear()}-${String(eatLabel.getUTCMonth() + 1).padStart(2, '0')}`,
      income: total,
      newPatients: count,
    });
  }

  res.json({ success: true, series });
});

// @desc    Service-mix breakdown (evaluation vs treatment vs cupping) — for pie chart
// @route   GET /api/analytics/service-mix
// @access  Private/Admin
export const getServiceMix = asyncHandler(async (req, res) => {
  const result = await Patient.aggregate([
    { $group: { _id: '$payFor', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  res.json({ success: true, breakdown: result.map((r) => ({ service: r._id, total: r.total, count: r.count })) });
});
