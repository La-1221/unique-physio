import asyncHandler from 'express-async-handler';
import Session from '../models/Session.js';
import Patient from '../models/Patient.js';
import { SESSION_STATUS } from '../config/constants.js';
import { getClinicDayStart, getClinicDayEnd, getNextSlotAfter } from '../utils/ethiopianTime.js';

// @desc    Get "Today's Expected Outpatients" for the front-desk dashboard
// @route   GET /api/sessions/today
// @access  Private (Receptionist, Admin)
export const getTodaysSessions = asyncHandler(async (req, res) => {
  const dayStart = getClinicDayStart();
  const dayEnd = getClinicDayEnd();

  const sessions = await Session.find({
    scheduledDate: { $gte: dayStart, $lt: dayEnd },
  })
    .populate('patient', 'cardNo fullName phone physiotherapist diagnosis sessionsRemaining totalSessions')
    .sort({ scheduledDate: 1 });

  res.json({ success: true, count: sessions.length, sessions });
});

// @desc    Check in a patient for their scheduled session today
// @route   POST /api/sessions/:id/check-in
// @access  Private (Receptionist, Admin)
// Behavior: marks this slot Attended and decrements the package's
// sessionsRemaining by 1. If that was the last session, the package is
// marked completed.
export const checkInSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id).populate('patient');
  if (!session) {
    res.status(404);
    throw new Error('Scheduled session not found');
  }
  if (session.status === SESSION_STATUS.ATTENDED) {
    res.status(400);
    throw new Error('This session has already been checked in.');
  }

  const patient = session.patient;
  if (patient.sessionsRemaining <= 0) {
    res.status(400);
    throw new Error('This patient has no sessions remaining on their package.');
  }

  session.status = SESSION_STATUS.ATTENDED;
  session.checkedInAt = new Date();
  session.checkedInBy = req.user.id;
  await session.save();

  patient.sessionsRemaining = Math.max(0, patient.sessionsRemaining - 1);
  if (patient.sessionsRemaining === 0) {
    patient.status = 'completed';
  }
  await patient.save();

  res.json({ success: true, session, patient });
});

// @desc    Mark a session as missed; sessionsRemaining is NOT decremented,
//          and a new makeup slot is appended at the end of the patient's calendar.
// @route   POST /api/sessions/:id/mark-missed
// @access  Private (Receptionist, Admin)
export const markSessionMissed = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id).populate('patient');
  if (!session) {
    res.status(404);
    throw new Error('Scheduled session not found');
  }
  if (session.status !== SESSION_STATUS.SCHEDULED) {
    res.status(400);
    throw new Error('Only a still-scheduled session can be marked missed.');
  }

  session.status = SESSION_STATUS.MISSED;
  await session.save();

  const patient = session.patient;

  // Find the patient's current last scheduled date to append the makeup slot after it
  const lastSession = await Session.findOne({ patient: patient._id }).sort({ scheduledDate: -1 });
  const nextDate = getNextSlotAfter(lastSession.scheduledDate, patient.frequency);

  const makeupSession = await Session.create({
    patient: patient._id,
    scheduledDate: nextDate,
    isMakeupSession: true,
  });

  res.json({ success: true, session, makeupSession });
});

// @desc    Get a patient's full session calendar
// @route   GET /api/sessions/patient/:patientId
// @access  Private (Receptionist, Admin)
export const getPatientSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ patient: req.params.patientId }).sort({ scheduledDate: 1 });
  res.json({ success: true, count: sessions.length, sessions });
});

// @desc    Auto-sweep: mark any past-due 'scheduled' sessions as 'missed'
//          and generate their makeup slots. Intended to run on a daily cron,
//          but exposed here so admin can also trigger manually.
// @route   POST /api/sessions/sweep-missed
// @access  Private/Admin
export const sweepMissedSessions = asyncHandler(async (req, res) => {
  const dayStart = getClinicDayStart();

  const overdue = await Session.find({
    status: SESSION_STATUS.SCHEDULED,
    scheduledDate: { $lt: dayStart },
  }).populate('patient');

  const results = [];
  for (const session of overdue) {
    session.status = SESSION_STATUS.MISSED;
    await session.save();

    const lastSession = await Session.findOne({ patient: session.patient._id }).sort({ scheduledDate: -1 });
    const nextDate = getNextSlotAfter(lastSession.scheduledDate, session.patient.frequency);

    const makeup = await Session.create({
      patient: session.patient._id,
      scheduledDate: nextDate,
      isMakeupSession: true,
    });
    results.push({ missedSessionId: session._id, makeupSessionId: makeup._id });
  }

  res.json({ success: true, sweptCount: results.length, results });
});
