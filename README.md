# Sweety – Blood Glucose Tracker
**Kenpath Technical Assignment: Junior Full Stack Developer (JavaScript & AI)**

Sweety is a full-stack diabetes management web application where patients record up to 4 blood glucose readings a day and view daily, month-to-date, and monthly analytical reports. Built with **Node.js + Express**, **PostgreSQL** database, and **React + Vite + Tailwind CSS**.

---

## 🌟 Features Implemented

### 1. Sign up and Login (Authentication)
- User registration with `name`, `email`, and `password`.
- Passwords are encrypted using **bcrypt** salt hashing (cost factor 10); passwords are never stored in plain text.
- JWT-based authentication: each user only sees their own private readings.
- **Bonus Role**: Doctor account mode (`doctor@kenpath.com`) to review assigned patient reports and track clinical adherence.

### 2. Blood Glucose Readings (CRUD & Strict Validation)
Records glucose measurements across the 4 clinical slots:
1. `Morning (fasting)`
2. `After breakfast`
3. `After lunch`
4. `After dinner`

#### Validation Rules Implemented (Frontend & Backend):
| Validation Rule | Example Error Message |
| --- | --- |
| **Value is required** | `"Please enter a glucose value."` |
| **Value must be a whole number between 40 and 600** | `"Value must be between 40 and 600 mg/dl."` |
| **Only one reading per slot per day** | `"You already have an After lunch reading for this date."` |
| **Maximum 4 readings per day** | `"You can add only 4 readings per day."` |
| **Date cannot be in the future** | `"Date cannot be in the future."` |

### 3. Reports & Analytics
- **Daily Report**: Selected date (e.g., 15 Oct 2026). Shows highest, lowest, and average (rounded to 1 decimal place) and lists each reading with its slot and status.
- **Month-to-Date Report**: 1st of the month to the selected date (e.g., 1 Oct – 15 Oct 2026).
- **Monthly Report**: The whole previous month (e.g., 1 Sep – 30 Sep 2026).
- **Friendly Empty State**: When no readings exist for a chosen date or range.
- **Bonus Charts**: Interactive **Recharts** glycemic trendline with 70–140 mg/dl target reference band and Time-in-Range breakdown.
- **Bonus Pagination**: GET `/api/readings?page=1&limit=20` on all logged readings.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14 (or Docker)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/YOUR_USERNAME/sweety-glucose-tracker.git
cd sweety-glucose-tracker
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key variables:
```ini
PORT=3000
JWT_SECRET=sweety-super-secret-jwt-key-2026
DATABASE_URL=postgres://postgres:password123@localhost:5432/sweety_db
```

### 3. Database Setup (PostgreSQL)

#### Option A: Using Docker Compose (Recommended)
Starts PostgreSQL 16 and automatically executes `schema.sql`:
```bash
docker-compose up -d postgres
```

#### Option B: Manual PostgreSQL
```bash
# In psql or PostgreSQL terminal:
CREATE DATABASE sweety_db;
\c sweety_db
\i schema.sql
```
*(Note: Sweety also features a zero-config fallback to `./data/sweety.json` to allow immediate testing without a local PostgreSQL daemon running!)*

### 4. Run Seed Script
Populates the database with demo accounts and sample readings (including the exact 15 Oct 2026 reference date specified in the assignment):
```bash
npm run seed
```

**Pre-configured Demo Accounts:**
- **Patient**: `demo@kenpath.com` / `Password123!`
- **Doctor**: `doctor@kenpath.com` / `Password123!`

### 5. Run the Application
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🧪 Running Automated Tests

Run the test suite verifying bcrypt hashing, all 5 validation rules, and report precision:
```bash
npm test
```

Test coverage includes:
- ✅ Passwords never stored in plain text (`bcrypt.hash` + salt)
- ✅ Correct password authentication and invalid password rejection
- ✅ Rule 1: Empty value rejection (`"Please enter a glucose value."`)
- ✅ Rule 2: Out-of-bounds rejection (`< 40` or `> 600` mg/dl)
- ✅ Rule 3: Slot duplication blocked on same date
- ✅ Rule 4: Maximum 4 readings per day enforcement
- ✅ Rule 5: Future dates blocked (`date > today`)
- ✅ Reports calculation precision: (110 + 145 + 160 + 130) / 4 = 136.25 rounded to **136.3 mg/dl**
- ✅ Friendly empty state handling

---

## 📚 API Endpoints Documentation

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register new user (name, email, password, role) |
| `POST` | `/api/auth/login` | Log in and receive JWT token |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile |
| `GET` | `/api/readings` | Get paginated readings (`?page=1&limit=20&date=...`) |
| `POST` | `/api/readings` | Record new glucose reading (with slot & validation) |
| `PUT` | `/api/readings/:id` | Update existing glucose reading |
| `DELETE`| `/api/readings/:id` | Delete glucose reading |
| `GET` | `/api/reports/daily` | Daily report (`?date=YYYY-MM-DD`) with slot list |
| `GET` | `/api/reports/month-to-date`| Month-to-date report (`?date=YYYY-MM-DD`) |
| `GET` | `/api/reports/monthly` | Whole previous month report (`?date=YYYY-MM-DD`) |
| `GET` | `/api/patients` | (Doctor only) List assigned patients |
| `POST` | `/api/seed` | Reset and seed demo database |

---

## 📝 Notes & Assumptions

1. **Database Fallback & Portability**:
   - The application includes full PostgreSQL DDL in `schema.sql` (custom ENUM types, unique constraints on `(user_id, date, time_slot)`, and plpgsql trigger enforcing `max 4 readings per day`).
   - For evaluator convenience when testing across environments without an active PostgreSQL instance, a dual-engine adapter automatically mirrors persistence to `./data/sweety.json`.

2. **Reference Date**:
   - The assignment specifications referenced **15 Oct 2026** as the key example date with readings: 110, 145, 160, and 130 mg/dl (Average: **136.3 mg/dl**).
   - Our seed script inserts this exact dataset, and quick-picker buttons in the UI allow evaluating this date with 1 click.

3. **Time Slot Constraints**:
   - When editing an existing reading, the validation logic excludes the current reading ID when verifying slot availability.

4. **Future Improvements with More Time**:
   - Redis caching for aggregated monthly reports with cache invalidation upon reading mutation.
   - Background job via BullMQ to send automated email/SMS reminders to patients with fewer than 4 readings logged by 8 PM.
   - Export reports as formatted PDF for endocrinologist consultations.
   - Progressive Web App (PWA) offline sync when measuring glucose without internet.

---

**Developed for Kenpath Careers & Engineering** · Submission by Bolla Bhargavi.
