import mongoose from 'mongoose';
import { APPOINTMENT_STATUS, ETHIOPIAN_PHONE_REGEX, EMAIL_REGEX } from '../config/constants.js';

const appointmentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => EMAIL_REGEX.test(v),
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      validate: {
        validator: (v) => ETHIOPIAN_PHONE_REGEX.test(v),
        message: (props) => `${props.value} is not a valid Ethiopian phone number`,
      },
    },
    // Optional link if a logged-in patient books
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Appointment date and time is required'],
      validate: {
        validator: function (v) {
          return v.getTime() > Date.now();
        },
        message: 'Appointment date cannot be in the past',
      },
    },
    reasonNote: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
