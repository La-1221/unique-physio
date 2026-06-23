import asyncHandler from 'express-async-handler';
import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';
import { isEthiopianSunday } from '../utils/ethiopianTime.js';
import { isValidEthiopianPhone, normalizeEthiopianPhone } from '../utils/phone.js';
import { EMAIL_REGEX } from '../config/constants.js';

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Public (logged-in patients get it linked to their account)
export const createAppointment = asyncHandler(async (req, res) => {
  const { fullName, email, phone, date, reasonNote } = req.body;

  const fieldErrors = {};
  if (!fullName?.trim()) fieldErrors.fullName = 'Full name is required';
  if (!email || !EMAIL_REGEX.test(email)) fieldErrors.email = 'Enter a valid email address';
  if (!phone) {
    fieldErrors.phone = 'Phone number is required';
  } else if (!isValidEthiopianPhone(phone)) {
    fieldErrors.phone = 'Enter a valid Ethiopian phone number (e.g. +251912345678)';
  }

  let parsedDate;
  if (!date) {
    fieldErrors.date = 'Date and time are required';
  } else {
    parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      fieldErrors.date = 'Invalid date';
    } else if (parsedDate.getTime() <= Date.now()) {
      fieldErrors.date = 'Appointment time cannot be in the past';
    } else if (isEthiopianSunday(parsedDate)) {
      fieldErrors.date = 'The clinic is closed for new bookings on Sunday. Please choose another day.';
    }
  }

  if (Object.keys(fieldErrors).length) {
    res.status(400);
    return res.json({ success: false, message: 'Validation failed', errors: fieldErrors });
  }

  const appointment = await Appointment.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: normalizeEthiopianPhone(phone),
    date: parsedDate,
    reasonNote: reasonNote?.trim() || '',
    user: req.user?.id || null,
  });

  if (req.user) {
    await Notification.create({
      user: req.user.id,
      type: 'appointment_confirmed',
      title: 'Appointment requested',
      message: `Your appointment request for ${parsedDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} has been received.`,
      relatedAppointment: appointment._id,
    });
  }

  res.status(201).json({ success: true, appointment });
});

// @desc    List appointments (front desk view)
// @route   GET /api/appointments
// @access  Private (Receptionist, Admin)
export const getAppointments = asyncHandler(async (req, res) => {
  const { status, from, to } = req.query;
  const query = {};
  if (status) query.status = status;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }
  const appointments = await Appointment.find(query).sort({ date: 1 });
  res.json({ success: true, count: appointments.length, appointments });
});

// @desc    Get logged-in patient's own appointments
// @route   GET /api/appointments/mine
// @access  Private
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user.id }).sort({ date: -1 });
  res.json({ success: true, count: appointments.length, appointments });
});

// @desc    Update appointment status (confirm / cancel / complete)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Receptionist, Admin)
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  appointment.status = status;
  await appointment.save();

  if (appointment.user) {
    await Notification.create({
      user: appointment.user,
      type: 'appointment_confirmed',
      title: `Appointment ${status}`,
      message: `Your appointment on ${appointment.date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} was ${status}.`,
      relatedAppointment: appointment._id,
    });
  }

  res.json({ success: true, appointment });
});
