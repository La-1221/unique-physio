// Central constants so pricing / rules / regex live in one place.

export const ROLES = {
  ADMIN: 'admin',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
};

// Ethiopian phone numbers: must start with +251 then 9 or 7, followed by 8 digits.
// Accepts input typed as 09xxxxxxxx / 07xxxxxxxx too (normalized in the model).
export const ETHIOPIAN_PHONE_REGEX = /^\+251[97]\d{8}$/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Card numbers: UNPT0001, UNPT0002, ...
export const CARD_PREFIX = 'UNPT';

export const SERVICE_PRICES = {
  evaluation: 1700,
  treatment: 1500,
  dry_needling: 500,
  cupping: 1200,
};

export const PAYMENT_METHODS = ['cash', 'telebirr', 'cbe', 'other'];

export const SESSION_FREQUENCIES = ['daily', 'every_other_day', 'weekly'];

export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  ATTENDED: 'attended',
  MISSED: 'missed',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// Clinic operating window: 2:00 AM to 1:00 AM Ethiopian time (almost 24hrs, closed 1-2am)
export const CLINIC_OPEN_HOUR = 2; // 24h format, server stores in standard UTC-equivalent logic
export const CLINIC_CLOSE_HOUR = 1;

// Ethiopia is UTC+3 year-round (no DST)
export const ETHIOPIA_UTC_OFFSET_HOURS = 3;

export const SUNDAY = 0; // JS Date.getDay() => 0 is Sunday
