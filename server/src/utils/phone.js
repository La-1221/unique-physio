import { ETHIOPIAN_PHONE_REGEX } from '../config/constants.js';

/**
 * Normalizes common Ethiopian phone input formats into the canonical
 * +2519XXXXXXXX / +2517XXXXXXXX form.
 * Accepts: 0912345678, 912345678, +251912345678, 251912345678
 */
export const normalizeEthiopianPhone = (raw) => {
  if (!raw) return raw;
  let v = raw.toString().trim().replace(/[\s-]/g, '');

  if (v.startsWith('+251')) {
    // already in target shape
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
  const normalized = normalizeEthiopianPhone(raw);
  return ETHIOPIAN_PHONE_REGEX.test(normalized);
};
