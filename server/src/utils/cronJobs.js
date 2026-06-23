import cron from 'node-cron';
import Appointment from '../models/Appointment.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
import { SESSION_STATUS, APPOINTMENT_STATUS } from '../config/constants.js';
import { getClinicDayStart, getNextSlotAfter } from './ethiopianTime.js';

// Runs once per hour: creates an in-app reminder notification for any
// confirmed/pending appointment happening within the next 24 hours that
// hasn't been reminded yet.
const sendAppointmentReminders = async () => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const upcoming = await Appointment.find({
    date: { $gte: now, $lte: in24h },
    status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
    reminderSent: false,
    user: { $ne: null },
  });

  for (const appt of upcoming) {
    await Notification.create({
      user: appt.user,
      type: 'appointment_reminder',
      title: 'Upcoming appointment reminder',
      message: `Reminder: you have an appointment at Unique Physiotherapy Speciality Clinic on ${appt.date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}.`,
      relatedAppointment: appt._id,
    });
    appt.reminderSent = true;
    await appt.save();
  }

  if (upcoming.length) {
    console.log(`[cron] Sent ${upcoming.length} appointment reminder notification(s).`);
  }
};

// Runs once daily at 02:05 server time: sweeps any session still
// 'scheduled' whose date has passed the start of today's clinic business
// day, marks it 'missed', and appends a makeup slot at the end of that
// patient's calendar — same logic as the manual sweep endpoint.
const sweepMissedSessionsJob = async () => {
  const dayStart = getClinicDayStart();

  const overdue = await Session.find({
    status: SESSION_STATUS.SCHEDULED,
    scheduledDate: { $lt: dayStart },
  }).populate('patient');

  for (const session of overdue) {
    session.status = SESSION_STATUS.MISSED;
    await session.save();

    const lastSession = await Session.findOne({ patient: session.patient._id }).sort({ scheduledDate: -1 });
    const nextDate = getNextSlotAfter(lastSession.scheduledDate, session.patient.frequency);

    await Session.create({
      patient: session.patient._id,
      scheduledDate: nextDate,
      isMakeupSession: true,
    });
  }

  if (overdue.length) {
    console.log(`[cron] Swept ${overdue.length} missed session(s) and created makeup slots.`);
  }
};

export const startCronJobs = () => {
  // Every hour, on the hour
  cron.schedule('0 * * * *', sendAppointmentReminders);
  // Every day at 02:05 (after the clinic day boundary flips at 02:00 EAT)
  cron.schedule('5 2 * * *', sweepMissedSessionsJob);
  console.log('Cron jobs scheduled: hourly appointment reminders, daily missed-session sweep.');
};
