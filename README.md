# StudyOS AI

> **Tagline:** *Learn. Practise. Prove. Progress.*  
> **Course Target:** C-DAC PGCP-BDA (Post Graduate Certificate Programme in Big Data Analytics)  
> **Preparation Horizon:** 4 Months Technical Core + 1 Month Placement & Interview Sprint

---

## 🌟 Executive Overview

**StudyOS AI** is a production-minded study management and assessment operating system engineered for students preparing for the rigorous C-DAC PGCP-BDA examination and placement interview circuit.

Unlike traditional passive LMS portals, StudyOS AI enforces a **Mandatory Daily Completion Gate**: a study day cannot be marked complete by merely clicking a button. Students must:
1. Complete structured **Theory Notes** and pass self-check verification (50 mins).
2. Write and verify runnable code/DDL scripts in the **Practical Lab** with progressive hints (60 mins).
3. Unlock and pass an **AI-Generated Daily Quiz** at or above an 80% pass threshold (10 mins).
4. Review weak concepts scheduled automatically through a **Spaced Repetition Engine** (1, 3, 7, and 14-day intervals).
5. Clear a comprehensive **100-Mark, 120-Minute AI Final Examination** once all subject modules are mastered.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, React 18 |
| **Styling** | Tailwind CSS with Deep Navy & Cyber Accent Design System |
| **Icons & Charts** | Lucide React, Recharts |
| **AI Integration** | OpenAI API (`gpt-4o-mini` / `gpt-4o`) with Structured Outputs & Resilient Fallback |
| **Database** | PostgreSQL via Supabase (27 normalized tables with Row-Level Security) |
| **Assessment & Gate** | Deterministic Server-side Grading Engine (MCQ, Multi-select, True/False, Output Match) |
| **Testing** | Vitest with unit test coverage for scoring, gate transitions, and topic mastery |
| **State & Storage** | Unified Hybrid Storage Adapter (LocalStorage / SSR In-Memory demo + Supabase PostgreSQL) |

---

## 📁 Project Directory Structure

```
AI STUDY OS/
├── .env.example                     # Environment template (OpenAI, Supabase)
├── .env.local                       # Local environment variables
├── package.json                     # Next.js, React, Recharts, Lucide, Vitest
├── tsconfig.json                    # Strict TypeScript configuration
├── tailwind.config.js               # Navy/Cyber design tokens
├── supabase/
│   └── migrations/
│       └── 20261009_init_schema.sql # 27-table PostgreSQL schema DDL with RLS
├── src/
│   ├── __tests__/
│   │   └── scoring.test.ts          # Vitest unit tests for scoring & gates
│   ├── app/
│   │   ├── layout.tsx               # Root layout with AppShell
│   │   ├── page.tsx                 # Dashboard & KPI Overview
│   │   ├── today/page.tsx           # Today's Study & Mandatory Completion Gate
│   │   ├── quiz/page.tsx            # AI Quiz Arena with Deterministic Grading
│   │   ├── subjects/page.tsx        # Syllabus Explorer & Management
│   │   ├── practical/page.tsx       # Practical Lab with SQL/Code Console
│   │   ├── revision/page.tsx        # Revision Centre & Spaced Repetition (1, 3, 7, 14d)
│   │   ├── exams/page.tsx           # Subject Final Examinations (100 Marks / 120 Mins)
│   │   ├── analytics/page.tsx       # Analytics & Performance Charts (Recharts)
│   │   ├── reminders/page.tsx       # Calendar, Timezone Reminders & Notifications
│   │   ├── resources/page.tsx       # Courseware PPTs, DOCX, CSV Library
│   │   ├── coach/page.tsx           # Intelligent AI Study Coach
│   │   ├── settings/page.tsx        # Profile, Thresholds & Data Export/Reset
│   │   └── api/
│   │       ├── health/route.ts      # Health & AI Status check
│   │       ├── coach/route.ts       # AI Mentor endpoint
│   │       ├── quiz/
│   │       │   ├── generate/route.ts# Dynamic 10-Question Quiz Generator
│   │       │   └── grade/route.ts   # Deterministic Scoring Endpoint
│   ├── components/
│   │   └── layout/
│   │       ├── AppShell.tsx         # Responsive container
│   │       ├── Navbar.tsx           # Streak badge, timer, AI status pill
│   │       └── Sidebar.tsx          # 11-section navigation sidebar
│   ├── lib/
│   │   ├── ai/index.ts              # OpenAI client + curated fallback engine
│   │   ├── assessment/scoring.ts    # Deterministic grading & gate machine
│   │   ├── constants/initial-curriculum.ts # 4 Preloaded C-DAC Curricula
│   │   └── storage/index.ts         # Persistent data repository & demo engine
│   └── types/index.ts               # Complete TypeScript interfaces
```

---

## 🔒 Database Design (27 Normalized Tables)

The complete SQL migration script is available in [`supabase/migrations/20261009_init_schema.sql`](file:///Users/harshal/My_Projects/AI%20STUDY%20OS/supabase/migrations/20261009_init_schema.sql):

1. **`profiles`** & **`user_settings`**: Student timeline, streak, pass threshold (80%), daily budget (120 mins).
2. **`subjects`**, **`modules`**, **`topics`**, **`subtopics`**, **`resources`**: Hierarchical syllabus storage.
3. **`study_plans`**, **`study_days`**, **`daily_tasks`**, **`task_completions`**, **`practical_submissions`**: Day-by-day scheduler and work ledger.
4. **`quizzes`**, **`quiz_questions`**, **`quiz_attempts`**, **`quiz_responses`**: AI assessment engine.
5. **`final_exams`**, **`final_exam_questions`**, **`final_exam_attempts`**, **`final_exam_responses`**: Comprehensive 100-mark exams.
6. **`topic_mastery`**, **`revision_schedule`**, **`study_sessions`**: Spaced repetition intervals and active timer logs.
7. **`reminders`**, **`notifications`**, **`ai_generation_logs`**, **`audit_logs`**: System telemetry.

All student tables have Row-Level Security (`RLS`) enabled checking `auth.uid() = user_id`.

---

## 🚦 Mandatory Daily Completion Gate Workflow

Progression follows a strict finite state machine:
```
[ NOT STARTED ] 
       ↓ (Start 120-min daily study timer)
[ IN PROGRESS ] 
       ↓ (Read structured theory & check self-assessment)
[ THEORY COMPLETED ] 
       ↓ (Write SQL/Code in Practical Lab & submit execution evidence)
[ PRACTICAL COMPLETED ] 
       ↓ (Prerequisites satisfied: unlocks quiz API)
[ QUIZ UNLOCKED ] 
       ↓ (Attempt 10 timed questions under 15-minute timer)
[ QUIZ ATTEMPTED ]
   ├── Score >= 80% ──> [ COMPLETED ] (Unlocks next study day, increments streak 🔥)
   └── Score < 80%  ──> [ NEEDS REVISION ] (Explains errors, logs weak topics, unlocks retry quiz)
```

---

## 📚 Preloaded Core Curricula

### 1. MySQL / DBMS (`PGCP-BDA-01`)
- **Modules:** Architecture & File Systems vs DBMS, Relational Modeling & Constraints, Normalization (1NF–BCNF), DDL/DML/DQL/DCL/TCL, Aggregates, Multi-table Joins, Correlated Subqueries, Views, Indexing (B-Tree/Clustered), Transactions (ACID) & EXPLAIN tuning.
- **Preloaded Resources:** `Introduction to DBMS.pdf`, `Constraints in DBMS.pdf`, `Data Modeling in sql.docx`, `Normalization.pptx`, etc.

### 2. Python for Data Analytics (`PGCP-BDA-02`)
- **Modules:** Syntax & Control Flow, OOP (Inheritance, Polymorphism, Encapsulation, MRO), Exceptions & File I/O, RegEx (`re`), NumPy ndarrays (broadcasting & slicing), Pandas DataFrames (wrangling on `emp.csv`), Matplotlib & Seaborn.
- **Preloaded Resources:** `OOP_Concepts_in_Python.pptx`, `Pandas.pptx`, `emp.csv`, `NumPy.pptx`, `Seaborn_in_Python_Detailed.pptx`, etc.

### 3. R Programming & Statistics (`PGCP-BDA-03`)
- **Modules:** RStudio, Atomic vectors, Factors, Matrices, Data Frames, Subsetting, Apply family (`lapply`, `sapply`, `apply`, `tapply`), CSV cleaning, and Descriptive Statistics.

### 4. Java Programming & Architecture (`PGCP-BDA-04`)
- **Modules:** JVM Internals (ClassLoader, Heap/Stack, GC), Core OOP, Collections Framework (`List`, `Set`, `Map`), Generics, Lambdas & Streams API, Multithreading & Synchronization, JDBC DAO layers.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20 & v26)
- npm 9+

### 2. Installation
```bash
git clone <repo-url>
cd "AI STUDY OS"
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials:
```env
# Optional: Set OpenAI key for live dynamic generations (otherwise runs in curated offline mode)
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4o-mini

# Optional: Set Supabase credentials when connecting to cloud Postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Note on Resilient Demo Mode:** If `OPENAI_API_KEY` is omitted, StudyOS AI automatically operates in **Curated Resilient Mode**, delivering verified C-DAC syllabus questions and coaching advice with zero errors.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Automated Tests
```bash
npm test
```
Executes the Vitest test suite testing scoring logic, gate verification, and topic mastery.

### 6. Building for Production
```bash
npm run build
npm start
```

---

## ☁️ Deployment Guide

### Deploying to Vercel
1. Push repository to GitHub.
2. In Vercel, import the repository with Framework Preset: `Next.js`.
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### Deploying Database to Supabase
1. Create a new Supabase project.
2. Open the **SQL Editor**.
3. Paste the contents of `supabase/migrations/20261009_init_schema.sql` and run.
4. All 27 tables, indexes, constraints, and RLS policies will be created immediately.

---

## 📜 Acceptance Checklist

- [x] Responsive Deep Navy SaaS Design System with Dark/Light mode toggle.
- [x] 11 Main Navigation sections implemented with full functional routing.
- [x] 4 Core C-DAC subjects preloaded with modular syllabus trees.
- [x] Dynamic syllabus editor: add custom subjects, edit topics, customize durations.
- [x] Mandatory 120-minute daily study planner with Theory, Practical Lab, and Recall.
- [x] Strict Daily Completion Gate preventing false completion clicks.
- [x] AI Quiz Arena with deterministic scoring, timers, and targeted retry generation.
- [x] Practical Lab with live code/query editor, sandbox execution, and submission tracking.
- [x] Spaced Repetition Engine with 1, 3, 7, and 14-day intervals.
- [x] AI Final Examination (100 Marks, 120 Mins) with personalized remediation plans.
- [x] Performance Analytics with interactive Recharts visualizations.
- [x] Timezone-aware reminders and browser push notification support.
- [x] Resource library managing student-supplied PDFs, DOCX, PPTs, and CSVs.
- [x] Intelligent AI Study Coach chat assistant.
- [x] Resettable demo state and full JSON data export.
- [x] Vitest automated test suite passing cleanly.
- [x] Next.js production build verified with zero errors.
