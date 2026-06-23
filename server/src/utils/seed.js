// Run with: npm run seed
// Creates an initial admin account (so you don't have to rely on "first
// registration becomes admin" if you've already registered other users
// during testing) plus a couple of sample patients with session calendars.

import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Session from '../models/Session.js';
import { ROLES, CARD_PREFIX } from '../config/constants.js';
import { generateSessionDates } from './ethiopianTime.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@uniquephysio.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      fullName: 'Clinic Admin',
      email: adminEmail,
      phone: '+251907797971',
      password: adminPassword,
      role: ROLES.ADMIN,
    });
    console.log(`Created admin: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  const existingPatients = await Patient.countDocuments({});
  if (existingPatients === 0) {
    const samplePatients = [
      {
        fullName: 'Abebe Kebede',
        phone: '+251911223344',
        sex: 'male',
        age: 45,
        physiotherapist: 'Dr. Hanna Tesfaye',
        diagnosis: 'Low back pain & disc herniation',
        address: 'Bole, Addis Ababa',
        payFor: 'treatment',
        sessions: 10,
        frequency: 'every_other_day',
        amount: 15000,
        paymentMethod: 'cash',
      },
      {
        fullName: 'Sara Mulugeta',
        phone: '+251922334455',
        sex: 'female',
        age: 32,
        physiotherapist: 'Dr. Hanna Tesfaye',
        diagnosis: 'Frozen shoulder',
        address: 'Ayat, Addis Ababa',
        payFor: 'evaluation',
        sessions: 5,
        frequency: 'daily',
        amount: 1700,
        paymentMethod: 'telebirr',
      },
    ];

    for (let i = 0; i < samplePatients.length; i++) {
      const p = samplePatients[i];
      const cardNo = `${CARD_PREFIX}${String(i + 1).padStart(4, '0')}`;
      const start = new Date();

      const patient = await Patient.create({
        cardNo,
        fullName: p.fullName,
        startDay: start,
        phone: p.phone,
        sex: p.sex,
        age: p.age,
        physiotherapist: p.physiotherapist,
        diagnosis: p.diagnosis,
        address: p.address,
        payFor: p.payFor,
        totalSessions: p.sessions,
        sessionsRemaining: p.sessions,
        frequency: p.frequency,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        registeredBy: admin._id,
      });

      const dates = generateSessionDates(start, p.frequency, p.sessions);
      await Session.insertMany(dates.map((scheduledDate) => ({ patient: patient._id, scheduledDate })));
      console.log(`Created patient ${patient.cardNo} - ${patient.fullName} with ${p.sessions} sessions`);
    }
  } else {
    console.log('Patients already exist, skipping sample patient seed.');
  }

  console.log('Seed complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
