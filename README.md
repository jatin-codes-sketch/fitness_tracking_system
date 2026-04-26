# 💪 VitalityHub

VitalityHub is a high-performance for fitness and health monitoring. Built with a modern full-stack JavaScript architecture, it lets users track workouts, log nutrition with auto-calculated macros, monitor vital signs, and stay hydrated — all from a single installable app that works on both desktop and mobile.

## ✨ Features

- 🏋️ **Workout Logger** — 75+ exercises across 4 smart types (Weighted, Bodyweight, Cardio, Timed) with real-time MET-based calorie estimation
- 🍽️ **Smart Meal Tracker** — Food database with 60+ items, auto-calculates calories, protein, carbs & fat from quantity using a slider UI
- ❤️ **Vitals Monitoring** — Log heart rate, blood pressure, blood sugar and SpO₂ with 14-day trend charts
- 💧 **Hydration Tracker** — One-tap 250ml/500ml water logging with animated fill cup
- 📊 **Analytics Dashboard** — Recharts line graphs, calorie ring, macro breakdown
- 📅 **Date-wise History** — Collapsible day-grouped workout and vitals history
- 🌙 **Dark / Light Mode** — Full neumorphic soft UI with theme toggle on every page
- 📱 **PWA** — Installable on Android and iOS, offline support via service worker, Add to Home Screen
- 🔐 **JWT Auth** — Secure register/login with bcrypt password hashing and 24h tokens
- 🖥️ **Responsive** — Desktop sidebar layout + mobile bottom navigation bar

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS, Neumorphic Dark UI |
| Charts | Recharts |
| PWA | Service Worker, Web App Manifest |
| DevOps | Docker, Docker Compose |

## 🚀 Quick Start

\`\`\`bash
git clone https://github.com/yourusername/vitalityhub.git
cd vitalityhub
cp .env     # add your SECRET_KEY and MONGO_URI
docker compose up --build
\`\`\`

Open **https://whoops-latticed-judgingly.ngrok-free.dev/** for testing 

## 📁 Structure

\`\`\`
vitalityhub/
├── backend/          # Node.js + Express + Mongoose API
│   ├── models/       # User, HealthRecord, WorkoutSession, DietLog
│   ├── routes/       # auth, health, fitness, nutrition
│   ├── middleware/   # JWT auth, validation, error handler
│   └── server.js
└── frontend/         # React + Vite PWA
    ├── src/
    │   ├── pages/    # Dashboard, Log, History, Nutrition, Profile
    │   ├── components/
    │   ├── constants/ # Food DB, Exercise DB, calculators
    │   └── context/  # Auth, Theme
    └── public/       # manifest.json, service-worker.js
