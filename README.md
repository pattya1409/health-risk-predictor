# HealthRisk Predictor

A full-stack web application that analyzes health data to predict risks for cardiac disease, diabetes, and hypertension. Built following the complete Software Development Life Cycle (SDLC).

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [SDLC Phases](#sdlc-phases)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Database Schema](#database-schema)
6. [Project Structure](#project-structure)
7. [Features](#features)
8. [API Endpoints](#api-endpoints)
9. [Risk Calculation Algorithm](#risk-calculation-algorithm)
10. [Getting Started](#getting-started)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## Problem Statement

Chronic diseases like heart disease, diabetes, and hypertension are leading causes of death worldwide. Early detection through regular health monitoring can significantly reduce complications. However, most people lack accessible tools to assess their risk levels based on their health data.

**Solution:** HealthRisk Predictor allows users to log their health metrics (blood pressure, blood sugar, cholesterol, BMI, lifestyle factors) and receive an instant risk assessment with personalized recommendations.

---

## SDLC Phases

### Phase 1: Requirement Gathering

**Functional Requirements:**
- User registration and login (email/password authentication)
- CRUD operations for health records (Create, Read, Update, Delete)
- Risk assessment generation based on health data
- Search and filter health records by date range and keywords
- User profile management
- Dashboard with risk visualization (gauges, badges, tables)

**Non-Functional Requirements:**
- Responsive UI (mobile, tablet, desktop)
- Row Level Security (RLS) on all database tables
- Input validation on frontend and backend
- Error handling with user-friendly messages
- Secure authentication via Supabase Auth
- Performance: sub-2s page loads

### Phase 2: Planning

| Week | Module |
|------|--------|
| 1 | Requirements, database design, project setup |
| 2 | Authentication (login/register), profile management |
| 3 | Health records CRUD, search/filter |
| 4 | Risk assessment engine, edge function |
| 5 | Dashboard, visualization, UI polish |
| 6 | Testing, documentation, deployment |

### Phase 3: System Design

**High-Level Design (MVC Architecture):**
```
Browser (View) --> React Components --> Service Layer (Controller) --> Supabase API (Model)
                                        |
                                        v
                                  Edge Function (Risk Calculator)
```

**Low-Level Design:**

| Layer | Files | Responsibility |
|-------|-------|---------------|
| Model | `src/types/index.ts` | TypeScript interfaces for all entities |
| View | `src/components/` | React UI components (auth, dashboard, records, assessment, profile) |
| Controller | `src/services/` | Business logic and API calls |
| Config | `src/lib/supabase.ts` | Database client singleton |
| Context | `src/context/AuthContext.tsx` | Auth state management |

---

## Architecture

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   React Frontend |---->|   Supabase BaaS  |---->|   PostgreSQL DB  |
|   (Vite + TS)    |     |   (Auth + API)   |     |   (RLS Secured)  |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
         |                       |
         |                       v
         |              +------------------+
         +------------->|  Edge Function   |
            fetch()     |  (Risk Calculator)|
                         +------------------+
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| Database | PostgreSQL with Row Level Security |
| Version Control | Git / GitHub |

---

## Database Schema

### `profiles` Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK, FK -> auth.users) | User ID |
| full_name | text | User's full name |
| age | integer | User's age |
| gender | text | User's gender |
| phone | text | Phone number |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### `health_records` Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Record ID |
| user_id | uuid (FK -> profiles) | Owner |
| blood_pressure_systolic | integer | Systolic BP (mmHg) |
| blood_pressure_diastolic | integer | Diastolic BP (mmHg) |
| heart_rate | integer | Heart rate (bpm) |
| blood_sugar | numeric | Fasting blood sugar (mg/dL) |
| cholesterol | numeric | Total cholesterol (mg/dL) |
| bmi | numeric | Body mass index |
| smoking_status | text | never / former / current |
| alcohol_consumption | text | none / moderate / heavy |
| physical_activity | text | sedentary / moderate / active |
| family_history | text | none / diabetes / heart_disease / hypertension |
| stress_level | text | low / moderate / high |
| sleep_hours | numeric | Average sleep per night |
| notes | text | Additional notes |
| record_date | date | Date of record |
| created_at | timestamptz | Creation timestamp |

### `risk_assessments` Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Assessment ID |
| user_id | uuid (FK -> profiles) | Owner |
| health_record_id | uuid (FK -> health_records) | Source record |
| cardiac_risk | text | low / moderate / high / critical |
| diabetes_risk | text | low / moderate / high / critical |
| hypertension_risk | text | low / moderate / high / critical |
| overall_risk | text | low / moderate / high / critical |
| cardiac_score | integer | 0-100 |
| diabetes_score | integer | 0-100 |
| hypertension_score | integer | 0-100 |
| overall_score | integer | 0-100 |
| recommendations | text | JSON array of strings |
| created_at | timestamptz | Creation timestamp |

**All tables have Row Level Security (RLS) enabled.** Users can only access their own data.

---

## Project Structure

```
src/
├── lib/
│   └── supabase.ts              # Supabase client singleton
├── types/
│   └── index.ts                 # TypeScript interfaces
├── context/
│   └── AuthContext.tsx          # Auth state provider
├── services/
│   ├── healthRecordService.ts   # CRUD operations for health records
│   ├── riskAssessmentService.ts # Risk calculation + assessment CRUD
│   └── profileService.ts       # Profile update logic
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx        # Login form
│   │   └── RegisterPage.tsx     # Registration form
│   ├── layout/
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── common/
│   │   ├── RiskBadge.tsx        # Risk level badge component
│   │   └── RiskGauge.tsx        # Circular gauge visualization
│   ├── dashboard/
│   │   └── Dashboard.tsx        # Main dashboard view
│   ├── records/
│   │   └── HealthRecordsPage.tsx # Health records CRUD + search
│   ├── assessment/
│   │   └── RiskAssessmentPage.tsx # Risk assessment runner + history
│   └── profile/
│       └── ProfilePage.tsx       # User profile management
├── App.tsx                      # Root component with routing
├── main.tsx                     # Entry point
└── index.css                    # Global styles + Tailwind

supabase/
└── functions/
    └── risk-calculator/
        └── index.ts             # Edge function for server-side risk calc
```

---

## Features

1. **Authentication** - Secure email/password login and registration via Supabase Auth
2. **Health Records CRUD** - Create, read, update, and delete health data entries
3. **Risk Assessment** - Algorithm-based risk prediction for cardiac, diabetes, and hypertension
4. **Visual Dashboard** - Circular gauges, risk badges, and summary statistics
5. **Search & Filter** - Filter records by date range and keyword search
6. **Profile Management** - Update name, age, gender, phone
7. **Recommendations** - Personalized health recommendations based on risk levels
8. **Responsive Design** - Works on mobile, tablet, and desktop
9. **Collapsible Sidebar** - Toggle sidebar for more screen space
10. **Row Level Security** - All database tables secured with RLS policies

---

## API Endpoints

### Supabase Client API (via `@supabase/supabase-js`)

| Operation | Method | Table |
|-----------|--------|-------|
| Get health records | `.select('*').eq('user_id', id)` | health_records |
| Create health record | `.insert(record)` | health_records |
| Update health record | `.update(data).eq('id', id)` | health_records |
| Delete health record | `.delete().eq('id', id)` | health_records |
| Get risk assessments | `.select('*').eq('user_id', id)` | risk_assessments |
| Save risk assessment | `.insert(assessment)` | risk_assessments |
| Update profile | `.update(data).eq('id', id)` | profiles |

### Edge Function

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/functions/v1/risk-calculator` | POST | Accepts health data JSON, returns risk scores and recommendations |

---

## Risk Calculation Algorithm

Each risk category (cardiac, diabetes, hypertension) is scored from 0-100 based on weighted health factors:

**Cardiac Risk Weights:**
- Blood Pressure: up to 30 points
- Cholesterol: up to 25 points
- Smoking: up to 25 points
- BMI: up to 15 points
- Physical Activity: up to 10 points
- Family History: up to 15 points
- Stress: up to 10 points

**Diabetes Risk Weights:**
- Blood Sugar: up to 35 points
- BMI: up to 20 points
- Family History: up to 20 points
- Physical Activity: up to 15 points
- Stress: up to 8 points
- Sleep: up to 10 points

**Hypertension Risk Weights:**
- Blood Pressure: up to 35 points
- BMI: up to 15 points
- Alcohol: up to 15 points
- Family History: up to 15 points
- Stress: up to 12 points
- Physical Activity: up to 10 points

**Risk Levels:**
| Score | Level |
|-------|-------|
| 0-24 | Low |
| 25-49 | Moderate |
| 50-69 | High |
| 70-100 | Critical |

**Overall Risk** = Average of cardiac, diabetes, and hypertension scores.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd healthrisk-predictor

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The following are pre-configured in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

---

## Testing

### Manual Testing Steps

1. **Registration:** Create a new account with email, password, and full name
2. **Login:** Sign in with registered credentials
3. **Profile:** Update name, age, gender, phone number
4. **Health Records:**
   - Create a new record with vital signs and lifestyle data
   - View the record in the list
   - Edit the record
   - Search/filter records
   - Delete a record
5. **Risk Assessment:**
   - Select a health record
   - Run the risk assessment
   - View risk gauges and recommendations
   - Check assessment history
6. **Dashboard:** Verify stats, gauges, and recent assessments display correctly

### Sample Test Data

| Field | Value |
|-------|-------|
| Systolic BP | 145 |
| Diastolic BP | 95 |
| Heart Rate | 80 |
| Blood Sugar | 110 |
| Cholesterol | 220 |
| BMI | 28 |
| Smoking | former |
| Alcohol | moderate |
| Activity | sedentary |
| Family History | heart_disease |
| Stress | high |
| Sleep | 5.5 |

**Expected Output:** Cardiac: High (~68), Diabetes: Moderate (~35), Hypertension: High (~56), Overall: Moderate (~53)

---

## Deployment

### Local
```bash
npm run build    # Production build
npm run preview  # Preview production build
```

### Cloud Deployment
The application can be deployed to any static hosting platform:
- **Vercel:** Connect GitHub repo, auto-deploys on push
- **Netlify:** Drag-and-drop `dist/` folder or connect repo
- **Supabase Hosting:** Use Supabase's built-in hosting for the frontend

The backend (database, auth, edge functions) is already hosted on Supabase.

---

## PPT Presentation Content

**Slide 1: Title**
- HealthRisk Predictor
- Full-Stack Health Risk Assessment Application

**Slide 2: Problem**
- Chronic diseases are the leading cause of death globally
- Early detection can reduce complications by up to 80%
- Most people lack accessible risk assessment tools

**Slide 3: Solution**
- Web-based health risk predictor
- Input health metrics, get instant risk assessment
- Personalized recommendations for risk reduction

**Slide 4: Architecture**
- MVC pattern with React frontend + Supabase backend
- Row Level Security for data isolation
- Edge function for server-side risk calculation

**Slide 5: Tech Stack**
- React + TypeScript + Tailwind CSS
- Supabase (PostgreSQL, Auth, Edge Functions)
- Lucide React icons

**Slide 6: Database Design**
- 3 tables: profiles, health_records, risk_assessments
- Foreign key relationships
- RLS policies on all tables

**Slide 7: Risk Algorithm**
- Weighted scoring (0-100) for cardiac, diabetes, hypertension
- 4 risk levels: Low, Moderate, High, Critical
- Personalized recommendations engine

**Slide 8: Features Demo**
- Authentication, CRUD, Search, Dashboard, Risk Assessment

**Slide 9: Testing**
- Manual test cases with sample data
- Input validation on frontend and backend
- RLS security verification

**Slide 10: Conclusion**
- Accessible health risk monitoring
- Secure, responsive, production-ready
- Future scope: AI-powered predictions, wearable integration

---

## License

This project is built for educational and evaluation purposes.
