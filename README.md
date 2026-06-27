<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version">
<img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs Welcome">

<br/>
<br/>

# 🏥 Unique Physiotherapy Speciality Clinic

### _"Restoring Movement, Restoring Life" — ህመምን ይገላገሉ!_

**A full-stack clinic management web application built for Unique Physiotherapy Speciality Clinic, Ayat, Addis Ababa.**  
Public marketing site · Role-based dashboards · Ethiopian-aware scheduling logic

<br/>

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🗂️ Project Structure](#️-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔐 Authentication & Roles](#-authentication--roles)
- [🇪🇹 Ethiopian-Specific Logic](#-ethiopian-specific-logic)
- [🌍 Google Sign-In Setup](#-google-sign-in-setup-optional)
- [🧪 Test Accounts](#-test-accounts)
- [⚙️ Configuration](#️-configuration)
- [🚢 Deployment](#-deployment)
- [📞 Clinic Info](#-clinic-info)

---

## ✨ Features

### 🌐 Public Website

| Feature                | Details                                                        |
| ---------------------- | -------------------------------------------------------------- |
| 📄 Pages               | Home, Services, About, Contact                                 |
| 🌍 Bilingual           | English + Amharic                                              |
| 📅 Appointment Booking | Validates Ethiopian phone numbers, blocks past dates & Sundays |
| 🗺️ Maps                | Embedded Google Maps for the Ayat location                     |
| 🎬 Animations          | Animated hero section + scroll-reveal effects                  |

### 🔐 Auth System

- Email/phone + password registration and login
- **"Continue with Google"** OAuth 2.0 _(optional — see [setup guide](#-google-sign-in-setup-optional))_
- JWT stored in `httpOnly` cookies (+ `localStorage` fallback)
- **First-ever registered account → automatically becomes Admin**

### 🧑‍💼 Role-Based Dashboards

<details>
<summary><b>🛡️ Admin Dashboard</b></summary>

- Full system analytics — daily / monthly / yearly income & patient charts
- Patient management and user/role management
- Today's outpatients and full appointment overview
- All using Ethiopian 2:00 AM business-day boundary

</details>

<details>
<summary><b>🖥️ Receptionist Dashboard</b></summary>

- Patient intake form with auto-generated card numbers (`UNPT0001`, `UNPT0002`, …)
- Search patients by name, card number, or phone
- Today's check-in dashboard — mark sessions as **Attended** or **Missed**

</details>

<details>
<summary><b>🧑‍⚕️ Patient Dashboard</b></summary>

- Book appointments online
- View appointment history
- In-app notification bell with session reminders

</details>

### 📦 Core Clinic Logic

```
Patient buys a 10-session package
    └── Master Package Record created
    └── Session Calendar auto-generated (N individual dated slots)
         ├── Attended → sessionsRemaining decremented
         └── Missed   → NOT decremented + makeup slot appended at end
                              ↑
                    Daily cron (02:05 AM) auto-sweeps unchecked sessions → Missed
```

**Scheduling Frequencies:**

- 📅 **Daily** — skips Sundays
- 📅 **Every Other Day** — Mon / Wed / Fri
- 📅 **Weekly** — same weekday each week

---

## 🗂️ Project Structure

```
unique-physio/
├── 📁 server/                   # Express + MongoDB API
│   └── src/
│       ├── config/              # DB connection, shared constants
│       ├── controllers/         # Route handlers (business logic)
│       ├── middleware/          # Auth (JWT + RBAC), error handler
│       ├── models/              # Mongoose schemas
│       │   └── User, Patient, Session, Appointment, Notification
│       ├── routes/              # Express routers
│       └── utils/               # Ethiopian time/calendar, phone validation,
│                                #   JWT helpers, cron jobs, seed script
│
├── 📁 client/                   # React + Vite + Tailwind CSS
│   └── src/
│       ├── components/          # Navbar, Footer, DashboardLayout, etc.
│       ├── context/             # AuthContext, NotificationContext
│       ├── pages/               # Public pages + role-specific dashboards
│       ├── hooks/               # useReveal (scroll animation)
│       └── utils/               # API client, validation helpers, clinicInfo.js
│
└── 📄 package.json              # Root convenience scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** — either:
  - 🖥️ Local: [MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - ☁️ Cloud: [Free MongoDB Atlas cluster](https://cloud.mongodb.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/unique-physio.git
cd unique-physio

# 2. Install all dependencies (root + server + client)
npm install

# 3. Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# → Edit both .env files with your own values (see §Configuration below)

# 4. (Optional) Seed the database with test data
npm run seed

# 5. Start development servers (API + React concurrently)
npm run dev
```

> **Default ports:** API → `http://localhost:5000` · React → `http://localhost:5173`

---

## 🔐 Authentication & Roles

| Role             | How to get it                                    |
| ---------------- | ------------------------------------------------ |
| **Admin**        | First account ever registered on the system      |
| **Receptionist** | Assigned by Admin from the User Management panel |
| **Patient**      | Every self-registered account defaults to this   |

> ⚠️ Protect your first registration — whoever signs up first becomes the system Admin.

---

## 🇪🇹 Ethiopian-Specific Logic

### 📱 Phone Validation

Accepts all common Ethiopian formats and normalizes to `+251XXXXXXXXX`:

```
0912345678  →  +251912345678  ✅
912345678   →  +251912345678  ✅
+251912345678               ✅
251912345678                ✅
```

Validation runs on **both client and server** (defense in depth).

### 🕑 Business-Day Boundary

All "today" analytics (income, outpatients, charts) use **2:00 AM Ethiopian Time (EAT, UTC+3)** as the day boundary — matching the clinic's real operating hours of 2 AM – 1 AM.

See: `server/src/utils/ethiopianTime.js`

### 🚫 Sundays

Sundays are **never valid** for bookings or auto-generated session slots — enforced on both client and server.

---

## 🌍 Google Sign-In Setup _(Optional)_

The app works fully without Google Sign-In. If you saw **Error 401: invalid_client**, that's expected until real OAuth credentials are created.

To enable it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Create an **OAuth 2.0 Client ID** (Web Application)
3. Add your frontend URL to **Authorized JavaScript Origins**
4. Add your callback URL to **Authorized Redirect URIs**
5. Copy the Client ID & Secret into your `.env` files

Until configured, the "Continue with Google" button shows a clear **disabled** state with an explanation — it will never crash or silently fail.

---

## 🧪 Test Accounts

After running `npm run seed`:

| Account                | Role      | Details                          |
| ---------------------- | --------- | -------------------------------- |
| _(first registration)_ | **Admin** | Register manually on first run   |
| `abebe@example.com`    | Patient   | Active 10-session package seeded |
| `sara@example.com`     | Patient   | Active 10-session package seeded |

> The two sample patients have session packages seeded so you can immediately test the **Today's Expected Outpatients** check-in flow.

---

## ⚙️ Configuration

### `server/.env`

```env
MONGO_URI=mongodb://localhost:27017/unique-physio
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173

# Optional — for Google Sign-In
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000

# Optional — for Google Sign-In
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Clinic Info

All public-facing contact details, address, hours, and social links live in **one file**:

```
client/src/utils/clinicInfo.js
```

Update `CLINIC_LAT` / `CLINIC_LNG` once you have an exact Google Maps pin, and update `CLINIC_SOCIAL` links if your handles differ from the current placeholders.

---

## 🚢 Deployment

This repo contains **application code only** — it is not pre-deployed.

### Backend (Express API)

Deploy to any Node.js host — [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io), or your own VPS.

```bash
# Set these as real environment variables on your host:
MONGO_URI, JWT_SECRET, CLIENT_URL
# CLIENT_URL must be your actual frontend domain (for CORS)
```

### Frontend (React)

```bash
npm run build --prefix client
# Deploy client/dist/ to Vercel, Netlify, or serve via Express
```

> If your API and frontend are on **different domains**, update `client/vite.config.js`'s dev proxy target and set `VITE_API_URL` to your production API URL.

---

## 📞 Clinic Info

|                       |                                         |
| --------------------- | --------------------------------------- |
| 📍 **Location**       | Ayat / Goro Road, Addis Ababa, Ethiopia |
| 🏥 **Clinic**         | Unique Physiotherapy Speciality Clinic  |
| 🌐 **Languages**      | English · አማርኛ (Amharic)                |
| 🕑 **Business Hours** | 2:00 AM – 1:00 AM EAT (Ethiopian Time)  |

---

<div align="center">

**Built with ❤️ for Unique Physiotherapy Speciality Clinic**

_ህመምን ይገላገሉ — Restoring Movement, Restoring Life_

</div>
