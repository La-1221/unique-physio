// Utilities for handling Ethiopian time-zone "business day" logic.
//
// Ethiopia uses UTC+3 (EAT) year-round, no daylight saving.
// The clinic's "day" runs 2:00 AM -> next day 1:00 AM Ethiopian local time.
// So for analytics ("today's income", "today's patients"), a calendar day
// boundary is 2:00 AM EAT, not midnight.

import { ETHIOPIA_UTC_OFFSET_HOURS, CLINIC_OPEN_HOUR, SUNDAY } from '../config/constants.js';

/**
 * Convert any Date to its equivalent Ethiopian local wall-clock Date object
 * (still a JS Date, but shifted so getUTC* methods read as EAT local time).
 */
export const toEthiopianLocal = (date = new Date()) => {
  const utcMs = date.getTime();
  return new Date(utcMs + ETHIOPIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
};

/**
 * Returns the start (2:00 AM EAT) of the clinic's "business day" that the
 * given moment falls into, expressed back as a real UTC Date for DB queries.
 */
export const getClinicDayStart = (date = new Date()) => {
  const eat = toEthiopianLocal(date);
  const y = eat.getUTCFullYear();
  const m = eat.getUTCMonth();
  const d = eat.getUTCDate();
  const hour = eat.getUTCHours();

  // If before 2:00 AM EAT, this moment belongs to the previous day's business day
  const dayOffset = hour < CLINIC_OPEN_HOUR ? -1 : 0;

  // Build 2:00 AM EAT on the right day, then convert back to UTC instant
  const eatDayStart = new Date(Date.UTC(y, m, d + dayOffset, CLINIC_OPEN_HOUR, 0, 0));
  return new Date(eatDayStart.getTime() - ETHIOPIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
};

/** Start of the clinic business day, 24 hours later (exclusive upper bound). */
export const getClinicDayEnd = (date = new Date()) => {
  const start = getClinicDayStart(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
};

/** Returns [start, end) UTC bounds for "this month" in Ethiopian local time. */
export const getClinicMonthRange = (date = new Date()) => {
  const eat = toEthiopianLocal(date);
  const y = eat.getUTCFullYear();
  const m = eat.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1, CLINIC_OPEN_HOUR, 0, 0) - ETHIOPIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  const end = new Date(Date.UTC(y, m + 1, 1, CLINIC_OPEN_HOUR, 0, 0) - ETHIOPIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  return { start, end };
};

/** Returns [start, end) UTC bounds for "this year" in Ethiopian local time. */
export const getClinicYearRange = (date = new Date()) => {
  const eat = toEthiopianLocal(date);
  const y = eat.getUTCFullYear();
  const start = new Date(Date.UTC(y, 0, 1, CLINIC_OPEN_HOUR, 0, 0) - ETHIOPIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  const end = new Date(Date.UTC(y + 1, 0, 1, CLINIC_OPEN_HOUR, 0, 0) - ETHIOPIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
  return { start, end };
};

/** True if the given date falls on a Sunday in Ethiopian local time. */
export const isEthiopianSunday = (date) => {
  const eat = toEthiopianLocal(date);
  return eat.getUTCDay() === SUNDAY;
};

/**
 * Adds `days` calendar days (Ethiopian local) to a date, preserving the
 * same local hour/minute, and returns a real UTC Date.
 */
export const addLocalDays = (date, days) => {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/** Moves a date forward day-by-day until it's not a Sunday. */
export const skipToNonSunday = (date) => {
  let result = new Date(date.getTime());
  while (isEthiopianSunday(result)) {
    result = addLocalDays(result, 1);
  }
  return result;
};

/**
 * Generates `count` scheduled session dates starting from `startDate`,
 * following the clinic frequency rule and always skipping Sundays.
 *
 * - daily: every day, skip Sunday (push to Monday)
 * - every_other_day: Mon / Wed / Fri pattern
 * - weekly: same weekday every week as startDate (startDate must not be Sunday)
 */
export const generateSessionDates = (startDate, frequency, count) => {
  const dates = [];
  let cursor = skipToNonSunday(new Date(startDate.getTime()));

  if (frequency === 'daily') {
    while (dates.length < count) {
      dates.push(new Date(cursor.getTime()));
      cursor = skipToNonSunday(addLocalDays(cursor, 1));
    }
  } else if (frequency === 'every_other_day') {
    // Mon(1), Wed(3), Fri(5) pattern in Ethiopian local time
    const targetDays = [1, 3, 5];
    // align cursor to the next matching weekday (could be same day if it matches)
    while (dates.length < count) {
      const eatDay = toEthiopianLocal(cursor).getUTCDay();
      if (targetDays.includes(eatDay) && !isEthiopianSunday(cursor)) {
        dates.push(new Date(cursor.getTime()));
      }
      cursor = addLocalDays(cursor, 1);
    }
  } else if (frequency === 'weekly') {
    while (dates.length < count) {
      dates.push(new Date(cursor.getTime()));
      cursor = skipToNonSunday(addLocalDays(cursor, 7));
    }
  } else {
    throw new Error(`Unknown frequency: ${frequency}`);
  }

  return dates;
};

/**
 * Finds the next valid slot date after the package's current last
 * scheduled date, following the same frequency rule. Used for makeup
 * sessions when a visit is missed.
 */
export const getNextSlotAfter = (lastDate, frequency) => {
  if (frequency === 'daily') {
    return skipToNonSunday(addLocalDays(lastDate, 1));
  }
  if (frequency === 'every_other_day') {
    let cursor = addLocalDays(lastDate, 1);
    const targetDays = [1, 3, 5];
    while (!targetDays.includes(toEthiopianLocal(cursor).getUTCDay()) || isEthiopianSunday(cursor)) {
      cursor = addLocalDays(cursor, 1);
    }
    return cursor;
  }
  if (frequency === 'weekly') {
    return skipToNonSunday(addLocalDays(lastDate, 7));
  }
  throw new Error(`Unknown frequency: ${frequency}`);
};
