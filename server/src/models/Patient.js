import mongoose from 'mongoose';
import { SERVICE_PRICES, PAYMENT_METHODS, ETHIOPIAN_PHONE_REGEX } from '../config/constants.js';

const patientSchema = new mongoose.Schema(
  {
    cardNo: {
      type: String,
      required: true,
      unique: true,
      // Format: UNPT0001, UNPT0002, ...
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    // Optional link to a User account if the patient also has a login
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    startDay: {
      type: Date,
      required: true,
      default: Date.now,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: (v) => ETHIOPIAN_PHONE_REGEX.test(v),
        message: (props) => `${props.value} is not a valid Ethiopian phone number`,
      },
    },
    sex: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age seems invalid'],
    },
    physiotherapist: {
      type: String,
      required: [true, 'Assigned physiotherapist is required'],
      trim: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    branch: {
      type: String,
      default: 'Ayat Main Branch',
      trim: true,
    },

    // ---- Package / Session tracking ----
    payFor: {
      type: String,
      enum: Object.keys(SERVICE_PRICES), // evaluation | treatment | cupping
      required: true,
    },
    totalSessions: {
      type: Number,
      required: true,
      min: [1, 'Must book at least 1 session'],
    },
    sessionsRemaining: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'every_other_day', 'weekly'],
      default: 'daily',
    },

    // ---- Payment ----
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },

    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

patientSchema.index({ fullName: 'text', cardNo: 'text', phone: 'text' });

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
