import asyncHandler from "express-async-handler";
import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";
import { isEthiopianSunday } from "../utils/ethiopianTime.js";
import {
  isValidEthiopianPhone,
  normalizeEthiopianPhone
} from "../utils/phone.js";
import { EMAIL_REGEX } from "../config/constants.js";

// Helper function to check if the time is outside clinic working hours
// "2:00 morning" in Ethiopian time = 8:00 AM International
// "1:00 night" in Ethiopian time = 7:00 PM International (19:00)
const isOutsideWorkingHours = (appointmentDate) => {
  const hour = appointmentDate.getHours(); // 0 to 23 (International 24-hour format)

  // Clinic is OPEN from 8:00 AM (8) to 7:00 PM (19)
  // So it is RESTRICTED if the hour is before 8 OR 19 and above
  return hour < 8 || hour >= 19;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Public (logged-in patients get it linked to their account)
export const createAppointment = asyncHandler(async (req, res) => {
  const { fullName, email, phone, date, reasonNote } = req.body;

  const fieldErrors = {};
  if (!fullName?.trim()) fieldErrors.fullName = "Full name is required";
  if (!email || !EMAIL_REGEX.test(email))
    fieldErrors.email = "Enter a valid email address";
  if (!phone) {
    fieldErrors.phone = "Phone number is required";
  } else if (!isValidEthiopianPhone(phone)) {
    fieldErrors.phone =
      "Enter a valid Ethiopian phone number (e.g. +251912345678)";
  }

  let parsedDate;
  if (!date) {
    fieldErrors.date = "Date and time are required";
  } else {
    parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      fieldErrors.date = "Invalid date";
    } else if (parsedDate.getTime() <= Date.now()) {
      fieldErrors.date = "Appointment time cannot be in the past";
    } else if (isEthiopianSunday(parsedDate)) {
      fieldErrors.date =
        "The clinic is closed for new bookings on Sunday. Please choose another day.";
    } else if (isOutsideWorkingHours(parsedDate)) {
      // ⬇️ NEW: Check if the time is outside 8:00 AM - 7:00 PM
      fieldErrors.date =
        "Appointments can only be booked between 8:00 AM and 7:00 PM (2:00 morning to 1:00 night).";
    }
  }

  if (Object.keys(fieldErrors).length) {
    res.status(400);
    return res.json({
      success: false,
      message: "Validation failed",
      errors: fieldErrors
    });
  }

  const appointment = await Appointment.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: normalizeEthiopianPhone(phone),
    date: parsedDate,
    reasonNote: reasonNote?.trim() || "",
    user: req.user?.id || null
  });

  if (req.user) {
    await Notification.create({
      user: req.user.id,
      type: "appointment_confirmed",
      title: "Appointment requested",
      message: `Your appointment request for ${parsedDate.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} has been received.`,
      relatedAppointment: appointment._id
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
  const appointments = await Appointment.find({ user: req.user.id }).sort({
    date: -1
  });
  res.json({ success: true, count: appointments.length, appointments });
});

// @desc    Patient reschedules their own appointment (date change)
// @route   PATCH /api/appointments/:id/reschedule
// @access  Private (owner only)
export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) { res.status(404); throw new Error("Appointment not found"); }
  if (String(appointment.user) !== String(req.user.id)) {
    res.status(403); throw new Error("Not authorized to modify this appointment");
  }
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    res.status(400); throw new Error("Only pending or confirmed appointments can be rescheduled");
  }

  const { date } = req.body;
  if (!date) { res.status(400); throw new Error("New date is required"); }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) { res.status(400); throw new Error("Invalid date"); }
  if (parsedDate.getTime() <= Date.now()) { res.status(400); throw new Error("Appointment time cannot be in the past"); }
  if (isEthiopianSunday(parsedDate)) { res.status(400); throw new Error("The clinic is closed on Sunday. Please choose another day."); }
  if (isOutsideWorkingHours(parsedDate)) { res.status(400); throw new Error("Appointments can only be booked between 8:00 AM and 7:00 PM."); }

  appointment.date = parsedDate;
  appointment.status = 'pending'; // reset to pending after reschedule
  await appointment.save();

  await Notification.create({
    user: req.user.id,
    type: "appointment_confirmed",
    title: "Appointment rescheduled",
    message: `Your appointment has been rescheduled to ${parsedDate.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.`,
    relatedAppointment: appointment._id
  });

  res.json({ success: true, appointment });
});

// @desc    Patient cancels their own appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private (owner only)
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) { res.status(404); throw new Error("Appointment not found"); }
  if (String(appointment.user) !== String(req.user.id)) {
    res.status(403); throw new Error("Not authorized to cancel this appointment");
  }
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    res.status(400); throw new Error("Only pending or confirmed appointments can be cancelled");
  }

  appointment.status = 'cancelled';
  await appointment.save();

  await Notification.create({
    user: req.user.id,
    type: "appointment_confirmed",
    title: "Appointment cancelled",
    message: `Your appointment on ${appointment.date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} has been cancelled.`,
    relatedAppointment: appointment._id
  });

  res.json({ success: true, appointment });
});

// @desc    Update appointment status (confirm / cancel / complete)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Receptionist, Admin)
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }
  appointment.status = status;
  await appointment.save();

  if (appointment.user) {
    await Notification.create({
      user: appointment.user,
      type: "appointment_confirmed",
      title: `Appointment ${status}`,
      message: `Your appointment on ${appointment.date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })} was ${status}.`,
      relatedAppointment: appointment._id
    });
  }

  res.json({ success: true, appointment });
});
