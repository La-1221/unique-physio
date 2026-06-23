// Client-side mirror of the server's Ethiopian phone / email validation,
// so the user gets instant inline feedback before hitting the network.

export const ETHIOPIAN_PHONE_REGEX = /^\+251[97]\d{8}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEthiopianPhone = (raw) => {
  if (!raw) return raw;
  let v = raw.toString().trim().replace(/[\s-]/g, '');

  if (v.startsWith('+251')) {
    // already correct shape
  } else if (v.startsWith('251')) {
    v = `+${v}`;
  } else if (v.startsWith('0') && (v[1] === '9' || v[1] === '7')) {
    v = `+251${v.slice(1)}`;
  } else if (v[0] === '9' || v[0] === '7') {
    v = `+251${v}`;
  }
  return v;
};

export const isValidEthiopianPhone = (raw) => {
  if (!raw) return false;
  return ETHIOPIAN_PHONE_REGEX.test(normalizeEthiopianPhone(raw));
};

export const isValidEmail = (raw) => {
  if (!raw) return false;
  return EMAIL_REGEX.test(raw.trim());
};

export const isSunday = (dateObj) => {
  if (!dateObj) return false;
  // We treat the picked datetime-local value as Ethiopian local time directly,
  // since the clinic only operates in Addis Ababa.
  return dateObj.getDay() === 0;
};

export const formatETB = (amount) =>
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(amount || 0);
