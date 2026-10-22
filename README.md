# PROMPT DOCTOR

> **"Your prompt is sick. Let's fix it."**

An AI-powered Prompt Engineering Laboratory where users submit prompts to receive detailed clinical diagnosis, health score, detected symptoms, medical prescriptions, improved engineered prompt, Prompt DNA, experiments, security scanning, learning content, history and analytics.

---

## 🔬 Core Architecture

```
prompt-doctor/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/       # Navbar, Sidebar, Footer, MainLayout
│   │   │   ├── ui/           # Button, Badge, Modal, ProgressBar, StatCard, ChartCard, LoadingScanner...
│   │   │   ├── diagnosis/    # HealthScore, ScoreBreakdown, SymptomCard, PrescriptionCard, DiagnosisCard
│   │   │   ├── prompt/       # PromptEditor, DiffViewer, PromptDNAChart
│   │   │   └── achievements/ # AchievementCard
│   │   ├── pages/            # Home, Dashboard, Diagnose, DiagnosisResult, PromptDNA, Experiments, Academy, Security, History, Analytics, Achievements, Profile, Login, Register
│   │   ├── services/         # api.js client
│   │   ├── context/          # AuthContext.jsx
│   │   ├── App.jsx           # Full React Router routing
│   │   └── main.jsx
│   ├── vite.config.js        # Vite + Tailwind + Proxy
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── database.js       # Sequelize + MySQL Connection & Auto-Sync
│   ├── controllers/          # authController, diagnosisController, userController
│   ├── models/               # User, Diagnosis, DiagnosisDimension, Symptom, Prescription, DiagnosisChange, PromptDNA
│   ├── routes/               # authRoutes, diagnosisRoutes, userRoutes
│   ├── middleware/           # auth, error
│   ├── services/
│   │   ├── groqService.js    # Official Groq SDK Clinical AI Engine (openai/gpt-oss-120b)
│   │   └── mockDoctorService.js
│   ├── app.js
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, React Router
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: Local MySQL (`prompt_doctor`)
- **Theme**: Futuristic AI Medical Laboratory, dark glassmorphism, cyan/blue technology accents, health color indicators (optimal, healthy, fair, sick, critical)

---

## 🗄️ MySQL Database Setup

Ensure local MySQL server is running on port `3306`:

```bash
# Verify database exists or create:
mysql -u root -pmanager -e "CREATE DATABASE IF NOT EXISTS prompt_doctor;"
```

Configuration in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prompt_doctor
DB_USER=root
DB_PASSWORD=manager
JWT_SECRET=prompt_doctor_super_secret_lab_key_987654321_jwt
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Sequelize automatically synchronizes and validates the schema on startup.

---

## 🚀 Running Locally

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm start
# or node server.js
```

### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**

---

## 🧪 Laboratory Modules

1. **Prompt Clinic (`/diagnose`)**: Submit raw prompts, observe real-time biometric scanning animations, and receive instant health scores (0-100%).
2. **Patient Chart (`/diagnosis/:id`)**: Comprehensive medical report with 6 dimension breakdown, symptom severity flags, action prescriptions, Prompt DNA radar, and surgical before/after changelog.
3. **Prompt DNA (`/prompt-dna`)**: Deconstruct and calibrate the 6 genetic chromosomes: Role, Context, Instruction, Constraint, Structure, and Specificity.
4. **A/B Experiments (`/experiments`)**: Head-to-head clinical trials comparing control prompts against doctor-prescribed variants under customizable temperatures.
5. **Prompt Security (`/security`)**: Screen against prompt injection, jailbreaks, data exfiltration, and delimiter escaping.
6. **Prompt Academy (`/academy`)**: Clinical lessons covering prompt anatomy, XML isolation scaffolding, Chain-of-Thought dosing, and interactive medical board exams.
7. **Lab Analytics (`/analytics`)**: Time-series health score trajectory, dimension distributions, and pathology frequency charts.
8. **Doctor Achievements (`/achievements`)**: Track diagnostic milestones, streaks, XP, and rank progression.
