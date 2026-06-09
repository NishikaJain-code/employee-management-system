# Employee Management & Leave Approval System (EMS)

A full-stack web application built with **Node.js + Express + PostgreSQL** (backend) and **HTML + CSS + Vanilla JS** (frontend).

---

## Features

| Feature | Description |
|---|---|
| JWT Authentication | Secure login/signup with bcrypt-hashed passwords |
| Role-Based Access | Admin, HR, Manager, Employee roles with different permissions |
| Employee Profiles | Create and manage employee details, departments, skills |
| Document Upload | Upload photos/documents (Aadhar, Resume) via Multer |
| Leave Management | Apply, review, approve/reject leaves with DB transactions |
| Analytics Dashboard | Reports on headcount, absences, salary expense, and leave usage |

---

## Project Structure

```
LoginApp/
├── backend/
│   ├── config/db.js          # PostgreSQL connection
│   ├── middleware/auth.js     # JWT verify + role check
│   ├── routes/
│   │   ├── auth.js            # Login, Signup
│   │   ├── employees.js       # Profile CRUD + image upload
│   │   ├── leaves.js          # Leave apply/approve/reject/reports
│   │   ├── departments.js     # Department master
│   │   └── skills.js          # Skills master
│   ├── uploads/               # Uploaded images (auto-created)
│   ├── .env                   # Environment config (edit this)
│   ├── seed.js                # Database seed script
│   └── server.js              # Express entry point
├── database/
│   └── schema.sql             # Raw SQL schema (reference only)
└── frontend/
    ├── index.html             # Login / Signup page
    ├── dashboard.html         # Main application dashboard
    └── style.css              # Dark slate theme stylesheet
```

---

## Setup & Run

### Step 1 — Configure database credentials

Edit `backend/.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/emsdb
JWT_SECRET=btech_first_year_ems_secret_key_2026
```

### Step 2 — Create the database

Open pgAdmin or psql and run:
```sql
CREATE DATABASE emsdb;
```

### Step 3 — Seed the database

```bash
cd backend
npm install
node seed.js
```

You should see:
```
✨  Seed completed successfully!
Test accounts (all use password: 123456)
  Admin   → pranay@isoftzone.com
  Manager → rahul@isoftzone.com
  HR      → priya@isoftzone.com
  Employee→ amit@isoftzone.com
```

### Step 4 — Start the backend server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

### Step 5 — Open the frontend

Open `frontend/index.html` in your browser (or use VS Code Live Server).

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Admin | pranay@isoftzone.com | 123456 |
| Manager | rahul@isoftzone.com | 123456 |
| HR | priya@isoftzone.com | 123456 |
| Employee | amit@isoftzone.com | 123456 |

---

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/signup | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/user | Any logged-in |
| GET | /api/employees | Any logged-in |
| PUT | /api/employees/:id | Own profile or Admin/HR |
| POST | /api/employees/:id/upload | Own profile or Admin/HR |
| DELETE | /api/employees/:id | Admin/HR |
| GET | /api/leaves/balance | Any logged-in |
| POST | /api/leaves/apply | Any logged-in |
| GET | /api/leaves/pending | Manager/HR/Admin |
| POST | /api/leaves/approve/:id | Manager/HR/Admin |
| POST | /api/leaves/reject/:id | Manager/HR/Admin |
| GET | /api/leaves/reports | Manager/HR/Admin |
| GET | /api/departments | Any logged-in |
| POST | /api/departments | Admin/HR |
| GET | /api/skills | Any logged-in |
| POST | /api/skills | Admin/HR |
