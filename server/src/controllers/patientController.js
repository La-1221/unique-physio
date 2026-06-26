import asyncHandler from 'express-async-handler';
import Patient from '../models/Patient.js';
import Session from '../models/Session.js';
import { CARD_PREFIX, SERVICE_PRICES } from '../config/constants.js';
import { normalizeEthiopianPhone, isValidEthiopianPhone } from '../utils/phone.js';
import { generateSessionDates, isEthiopianSunday } from '../utils/ethiopianTime.js';

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
    fullName, startDay, phone, sex, age, physiotherapist, diagnosis,
    sessions, address, payFor, perSessionService, paidAllSessions,
    paymentMethod, branch, frequency,
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

  const payForArr = Array.isArray(payFor) ? payFor : (payFor ? [payFor] : []);
  const validServices = Object.keys(SERVICE_PRICES);
  if (payForArr.length === 0 || !payForArr.every((s) => validServices.includes(s))) {
    fieldErrors.payFor = 'Select at least one valid service';
  } else if (!payForArr.includes('evaluation')) {
    fieldErrors.payFor = 'Evaluation is required on registration day';
  }
  if (!perSessionService || !validServices.includes(perSessionService)) {
    fieldErrors.perSessionService = 'Select a valid per-session service';
  }

  if (!sessions || sessions < 1) fieldErrors.sessions = 'Number of sessions must be at least 1';
  if (!paymentMethod) fieldErrors.paymentMethod = 'Payment method is required';

  const start = startDay ? new Date(startDay) : new Date();

  if (Object.keys(fieldErrors).length) {
    res.status(400);
    return res.json({ success: false, message: 'Validation failed', errors: fieldErrors });
  }

  const cardNo = await getNextCardNo();
  const sessionFrequency = frequency || 'daily';

  // Registration day: sum of all selected services
  const regAmount = payForArr.reduce((sum, s) => sum + (SERVICE_PRICES[s] || 0), 0);
  // Per-session amount for follow-up sessions
  const perSessionAmount = SERVICE_PRICES[perSessionService] || 0;
  // Total amount paid now
  const amount = paidAllSessions
    ? regAmount + perSessionAmount * Math.max(0, Number(sessions) - 1)
    : regAmount;

  const patient = await Patient.create({
    cardNo,
    fullName: fullName.trim(),
    startDay: start,
    phone: normalizeEthiopianPhone(phone),
    sex, age,
    physiotherapist: physiotherapist.trim(),
    diagnosis: diagnosis.trim(),
    address: address.trim(),
    branch: branch?.trim() || 'Ayat Main Branch',
    payFor: payForArr,
    perSessionService: 'treatment',
    paidAllSessions: Boolean(paidAllSessions),
    totalSessions: sessions,
    sessionsRemaining: sessions,
    frequency: sessionFrequency,
    amount,
    paymentMethod,
    registeredBy: req.user.id,
  });

  // Generate the session calendar
  const dates = generateSessionDates(start, sessionFrequency, sessions);
  const sessionDocs = dates.map((scheduledDate) => ({
    patient: patient._id,
    scheduledDate,
  }));
  const createdSessions = await Session.insertMany(sessionDocs);

  // Auto-check-in session 1 (registration day — payment already collected)
  if (createdSessions.length > 0) {
    await Session.findByIdAndUpdate(createdSessions[0]._id, {
      status: 'attended',
      checkedInAt: new Date(),
      checkedInBy: req.user.id,
      services: payForArr,
      sessionAmount: regAmount,
      paymentMethod,
    });
    await Patient.findByIdAndUpdate(patient._id, {
      sessionsRemaining: Math.max(0, sessions - 1),
      ...(sessions - 1 === 0 ? { status: 'completed' } : {}),
    });
  }

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

// @desc    Record an additional payment for a patient (per-session or custom)
// @route   POST /api/patients/:id/payment
// @access  Private (Receptionist, Admin)
export const recordPayment = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const { services, paymentMethod } = req.body;
  const validServices = Object.keys(SERVICE_PRICES);
  const servicesArr = Array.isArray(services) ? services : (services ? [services] : []);

  if (servicesArr.length === 0 || !servicesArr.every((s) => validServices.includes(s))) {
    res.status(400);
    return res.json({ success: false, message: 'Select at least one valid service' });
  }

  const totalAmount = servicesArr.reduce((sum, s) => sum + (SERVICE_PRICES[s] || 0), 0);

  // Accumulate amount on the patient record
  patient.amount += totalAmount;
  if (paymentMethod) patient.paymentMethod = paymentMethod;
  await patient.save();

  res.json({ success: true, patient, totalAmount });
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
