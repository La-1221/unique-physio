# Unique Physiotherapy Speciality Clinic — Web App

A full MERN-stack (MongoDB, Express, React, Node) web application for **Unique Physiotherapy Speciality Clinic**
in Ayat, Addis Ababa — public marketing site + role-based clinic management system (Admin, Receptionist, Patient).

> "Restoring Movement, Restoring Life" — ህመምን ይገላገሉ!

---

## 1. What's included

**Public website**
- Home, Services, About, Contact pages (bilingual English / Amharic, matches the clinic's existing brand colors and copy)
- Animated hero, scroll-reveal sections, Google Maps embed
- Public appointment booking form (validates Ethiopian phone numbers, blocks past dates and Sundays)

**Auth system**
- Register / Login with email or phone + password
- "Continue with Google" (needs your own Google OAuth credentials — see §4)
- **The very first account ever registered becomes Admin automatically.** Every other self-registration defaults to `patient`.
- JWT stored in an httpOnly cookie (+ localStorage fallback token for environments that block third-party cookies)

**Role-based dashboards**
- **Admin**: full system overview, analytics (daily/monthly/yearly income & patient charts), patient management, today's outpatients, appointments, and user/role management
- **Receptionist**: patient intake form, search patients (name / card no / phone), today's check-in dashboard, appointments
- **Patient**: book appointments, view appointment history, in-app notification bell with reminders

**Core clinic logic**
- Patient package system: a 10-session (or any N-session) package is split into a **Master Package** record and an auto-generated **Session Calendar** (individual dated slots), exactly as scoped.
- Card numbers auto-generate as `UNPT0001`, `UNPT0002`, …
- Scheduling frequency rules: Daily (skips Sunday), Every Other Day (Mon/Wed/Fri), Weekly (same weekday) — all Sunday-aware.
- Front-desk check-in: marking a session "Attended" decrements `sessionsRemaining`.
- **Missed session handling**: marking a session "Missed" does NOT decrement the package, and automatically appends a new makeup slot at the end of the patient's calendar — so they always get the full sessions they paid for.
- A daily cron job (02:05 AM) auto-sweeps any session that passed without check-in into "Missed" + generates its makeup slot.
- All "today / this month / this year" analytics use a **2:00 AM Ethiopian time business-day boundary**, matching the clinic's actual operating hours (2:00 AM–1:00 AM).

---

## 2. Project structure

```
unique-physio/
├── server/                 # Express + MongoDB API
│   ├── src/
│   │   ├── config/         # DB connection, shared constants
│   │   ├── controllers/    # Route handlers (business logic)
│   │   ├── middleware/     # Auth (JWT + RBAC), error handler
│   │   ├── models/         # Mongoose schemas (User, Patient, Session, Appointment, Notification)
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # Ethiopian time/calendar logic, phone validation, JWT, cron jobs, seed script
│   │   └── server.js       # App entrypoint
│   ├── .env.example
│   └── package.json
├── client/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Navbar, Footer, Logo, ProtectedRoute, DashboardLayout, etc.
│   │   ├── context/        # AuthContext, NotificationContext
│   │   ├── pages/           # Public pages + dashboard pages (role-specific)
│   │   ├── hooks/           # useReveal (scroll animation)
│   │   └── utils/           # api client, validation helpers, clinic info constants
│   ├── .env.example
│   └── package.json
└── package.json            # Root convenience scripts
```

---

## 3. Running it locally

### Prerequisites
- Node.js 18+
- A MongoDB instance — either:
  - Local: install MongoDB Community Server and run `mongod`, or
  - Free cloud: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and copy its connection string

### Setup

```bash
# 1. Install all dependencies (server + client)
npm run install:all

# 2. Configure the server
cp server/.env.example server/.env
# edit server/.env:
#   - set MONGO_URI to your local or Atlas connection string
#   - set JWT_SECRET to any long random string
#   - (optional for now) set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET — see §4

# 3. Configure the client
cp client/.env.example client/.env
# (optional for now) set VITE_GOOGLE_CLIENT_ID — see §4

# 4. (Optional) seed an admin account + sample patients
npm run seed
# creates admin@uniquephysio.com / ChangeMe123! unless you set
# SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in server/.env first

# 5. Run both apps (in two terminals)
npm run dev:server   # http://localhost:5000
npm run dev:client   # http://localhost:5173
```

Open **http://localhost:5173** — that's the public site. Register your first account (it auto-becomes Admin),
or log in with the seeded admin credentials above, then visit `/dashboard`.

---

## 4. Setting up Google Sign-In (optional)

Your earlier screenshot showed `Error 401: invalid_client` — that happens when no real OAuth client exists yet.
The app is built to **work fully without Google Sign-In** (email/phone + password covers 100% of the auth flow);
Google is an optional convenience on top. To enable it:

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Application type: **Web application**)
3. Add Authorized JavaScript origins:
   - `http://localhost:5173` (for local dev)
   - your real domain once deployed (e.g. `https://uniquephysiotherapy.com`)
4. Copy the generated **Client ID** and **Client Secret**
5. Paste the Client ID + Secret into `server/.env` → `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
6. Paste the same Client ID into `client/.env` → `VITE_GOOGLE_CLIENT_ID`
7. Restart both dev servers

Until you do this, the "Continue with Google" button on Login/Register will show clearly as disabled with an
explanation, instead of crashing or silently failing.

---

## 5. Ethiopian phone & business-day logic

- **Phone validation** accepts common input styles (`0912345678`, `912345678`, `+251912345678`, `251912345678`)
  and normalizes everything to `+2519XXXXXXXX` / `+2517XXXXXXXX` before saving. Both client and server validate
  independently (defense in depth) — invalid numbers are rejected with a clear field-level error.
- **Clinic business day** starts at **2:00 AM Ethiopian time (EAT, UTC+3)**, matching real operating hours. All
  "today's income", "today's outpatients", and daily charts use this boundary rather than UTC midnight —
  see `server/src/utils/ethiopianTime.js`.
- **Sundays** are never valid for new bookings or auto-generated session slots, in line with the clinic's
  request ("can't set Sunday").

---

## 6. Updating clinic information

All public-facing contact details, address, hours, and social links live in one file:

```
client/src/utils/clinicInfo.js
```

This was filled in directly from your uploaded flyer, social ad templates, and screenshots — phone number,
Ayat/Goro Road address, and "Restoring Movement, Restoring Life" tagline. Update the `CLINIC_LAT` / `CLINIC_LNG`
constants there once you've placed an exact pin for the clinic on Google Maps, and update the `CLINIC_SOCIAL`
links if your real Instagram/Facebook/Telegram/TikTok/WhatsApp handles differ from the placeholders.

---

## 7. Deployment notes

This package is the application code only — it is not pre-deployed. For production:

- **Server**: deploy to any Node host (Render, Railway, Fly.io, a VPS, etc.). Set all `server/.env` values as
  real environment variables, especially `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (your real frontend domain,
  for CORS).
- **Client**: run `npm run build --prefix client`, then deploy the `client/dist/` folder to any static host
  (Vercel, Netlify, etc.), or serve it from the Express server itself.
- Update `client/vite.config.js`'s dev proxy target, or set the production API base URL appropriately if your
  API isn't served from the same domain.
- Set real `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` with your production domain added to Authorized
  JavaScript origins (see §4) if you want Google Sign-In live.

---

## 8. Default test accounts (after running `npm run seed`)

| Role  | Email                     | Password      |
|-------|----------------------------|---------------|
| Admin | admin@uniquephysio.com     | ChangeMe123!  |

Two sample patients (Abebe Kebede, Sara Mulugeta) are also seeded with active session packages so you can
immediately test the "Today's Expected Outpatients" check-in flow if their sessions land on today's date.

**Change the seeded admin password after first login**, or set `SEED_ADMIN_PASSWORD` in `server/.env` before
seeding.
