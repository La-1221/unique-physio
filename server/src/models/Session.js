import mongoose from 'mongoose';
import { SESSION_STATUS, PAYMENT_METHODS } from '../config/constants.js';

const SESSION_SERVICES = ['evaluation', 'treatment', 'dry_needling', 'cupping'];

const sessionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.SCHEDULED,
    },
    isMakeupSession: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    services: {
      type: [String],
      enum: SESSION_SERVICES,
      default: [],
    },
    sessionAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: [...PAYMENT_METHODS, null],
      default: null,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ patient: 1, scheduledDate: 1 });
sessionSchema.index({ scheduledDate: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
