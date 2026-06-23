import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';
import Session from '../models/Session.js';
import { CARD_PREFIX, SERVICE_PRICES } from '../config/constants.js';
import { normalizeEthiopianPhone, isValidEthiopianPhone } from '../utils/phone.js';
import { generateSessionDates } from '../utils/ethiopianTime.js';

// Generates the next sequential card number, e.g. UNPT0001, UNPT0002, ...
const getNextCardNo = async () => {
  const last = await Patient.findOne({}).sort({ createdAt: -1 }).select('cardNo');
  let nextNum = 1;
  if (last?.cardNo) {
    const match = last.cardNo.match(/(\d+)$/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `${CARD_PREFIX}${String(nextNum).padStart(4, '0')}`;
};

// @desc    Register a new patient + auto-generate their session calendar
// @route   POST /api/patients
// @access  Private (Receptionist, Admin)
export const createPatient = asyncHandler(async (req, res) => {
  const {
    fullName,
    startDay,
    phone,
    sex,
    age,
    physiotherapist,
    diagnosis,
    sessions,
    address,
    payFor,
    amount,
    paymentMethod,
    branch,
    frequency,
  } = req.body;

  const fieldErrors = {};
  if (!fullName?.trim()) fieldErrors.fullName = 'Full name is required';
  if (!phone) {
    fieldErrors.phone = 'Phone number is required';
  } else if (!isValidEthiopianPhone(phone)) {
    fieldErrors.phone = 'Enter a valid Ethiopian phone number (e.g. +251912345678)';
  }
  if (!sex || !['male', 'female'].includes(sex)) fieldErrors.sex = 'Sex is required';
  if (!age || age < 0) fieldErrors.age = 'Valid age is required';
  if (!physiotherapist?.trim()) fieldErrors.physiotherapist = 'Assigned physiotherapist is required';
  if (!diagnosis?.trim()) fieldErrors.diagnosis = 'Diagnosis is required';
  if (!address?.trim()) fieldErrors.address = 'Address is required';
  if (!payFor || !SERVICE_PRICES[payFor]) fieldErrors.payFor = 'Select a valid service';
  if (!sessions || sessions < 1) fieldErrors.sessions = 'Number of sessions must be at least 1';
  if (!paymentMethod) fieldErrors.paymentMethod = 'Payment method is required';

  if (Object.keys(fieldErrors).length) {
    res.status(400);
    return res.json({ success: false, message: 'Validation failed', errors: fieldErrors });
  }

  const cardNo = await getNextCardNo();
  const start = startDay ? new Date(startDay) : new Date();
  const sessionFrequency = frequency || 'daily';

  const patient = await Patient.create({
    cardNo,
    fullName: fullName.trim(),
    startDay: start,
    phone: normalizeEthiopianPhone(phone),
    sex,
    age,
    physiotherapist: physiotherapist.trim(),
    diagnosis: diagnosis.trim(),
    address: address.trim(),
    branch: branch?.trim() || 'Ayat Main Branch',
    payFor,
    totalSessions: sessions,
    sessionsRemaining: sessions,
    frequency: sessionFrequency,
    amount: amount ?? SERVICE_PRICES[payFor],
    paymentMethod,
    registeredBy: req.user.id,
  });

  // Generate the daily calendar: `sessions` dated slots per the frequency rule
  const dates = generateSessionDates(start, sessionFrequency, sessions);
  const sessionDocs = dates.map((scheduledDate) => ({
    patient: patient._id,
    scheduledDate,
  }));
  await Session.insertMany(sessionDocs);

  res.status(201).json({ success: true, patient });
});

// @desc    Search patients by name, card number, or phone
// @route   GET /api/patients/search?q=...
// @access  Private (Receptionist, Admin)
export const searchPatients = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.json({ success: true, count: 0, patients: [] });
  }

  const regex = new RegExp(q.trim(), 'i');
  const patients = await Patient.find({
    $or: [{ fullName: regex }, { cardNo: regex }, { phone: regex }],
  })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, count: patients.length, patients });
});

// @desc    List all patients (paginated)
// @route   GET /api/patients
// @access  Private (Receptionist, Admin)
export const getPatients = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    Patient.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Patient.countDocuments({}),
  ]);

  res.json({
    success: true,
    patients,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single patient with their full session calendar
// @route   GET /api/patients/:id
// @access  Private (Receptionist, Admin)
export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  const sessions = await Session.find({ patient: patient._id }).sort({ scheduledDate: 1 });
  res.json({ success: true, patient, sessions });
});

// @desc    Update patient details
// @route   PUT /api/patients/:id
// @access  Private (Receptionist, Admin)
export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const editableFields = [
    'fullName', 'sex', 'age', 'physiotherapist', 'diagnosis',
    'address', 'branch', 'paymentMethod', 'amount', 'status',
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) patient[field] = req.body[field];
  });

  if (req.body.phone) {
    if (!isValidEthiopianPhone(req.body.phone)) {
      res.status(400);
      return res.json({ success: false, message: 'Validation failed', errors: { phone: 'Enter a valid Ethiopian phone number' } });
    }
    patient.phone = normalizeEthiopianPhone(req.body.phone);
  }

  await patient.save();
  res.json({ success: true, patient });
});
