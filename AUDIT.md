# PrepAI (Pariksha Studio) — Complete System Audit & Technical Specification

> **Target Audience:** AI Assistants, Software Architects, and Full-Stack Engineers.  
> **Purpose:** Serves as a single source of truth and full operational context for the PrepAI application, its architecture, data models, API endpoints, external services, end-to-end user journeys, and component interactions.

---

## 1. Executive Summary & Product Overview

**PrepAI** (branded as **Pariksha Studio**) is an enterprise-grade AI-powered test preparation and examination intelligence platform tailored for Indian competitive exams (such as **SSC CGL**, **RRB NTPC / Group D**, **Banking / IBPS PO / SBI**, and **State PSCs**).

### Core Value Propositions:
1. **Interactive Computer-Based Test (CBT) Engine:** Simulates real examination environments (TCS iON / SSC pattern) with timer countdowns, multi-section tabs, marked-for-review workflows, 1..N color-coded question palettes, and post-submission scorecards with percentile ranks.
2. **AI Question Studio:** Synthesizes calibrated, exam-accurate questions using syllabus taxonomy and historical PYQ question patterns (powered by Google Gemini 2.5 Flash / Pro).
3. **Review & Governance Queue:** Strict zero-unapproved-leakage policy; every AI-generated or PDF-extracted question is held in a review queue (`pending_review`) until verified by faculty with LaTeX formula inspection and explanation checks.
4. **PDF Ingestion & OCR Vision Pipeline:** Ingests previous years' test papers (PYQ PDFs), scans paper sections, extracts questions with LaTeX mathematical formulas, and normalizes them into structured JSON.
5. **Multi-Tenant Coaching / Tuition Portals:** Role-Based Access Control (RBAC) via Clerk Organizations, allowing coaching centers and tutors to invite faculty as Admins, enroll students as Members, publish batch test schedules, and track student performance.

---

## 2. Technology Stack & Dependencies

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `16.2.4` (Turbopack) | Server-side rendering, API routes, Turbopack dev/build |
| **UI Library** | React / React DOM | `19.2.4` | Modern React 19 functional components and hooks |
| **Language** | TypeScript / JavaScript | TS `^5.0.0`, ES Modules | Type safety across layouts, taxonomy, and schemas |
| **Styling** | Tailwind CSS / Vanilla CSS | `@tailwindcss/postcss` `^4.0.0` | Theme tokens, Pariksha Studio UI (`.btn`, `.card`, `.chip`) |
| **Typography** | Google Fonts | Next/Font (`Geist`, `Plus Jakarta Sans`) | High-legibility UI typography |
| **Math Rendering** | KaTeX | `^0.18.9` | High-fidelity inline (`$...$`) and block (`$$...$$`) LaTeX math formulas |
| **Database** | Neon PostgreSQL (Serverless) | `@neondatabase/serverless` `^1.1.0` | Serverless Postgres with connection pooling and `pgvector` |
| **ORM & Migrations** | Drizzle ORM & Drizzle Kit | `drizzle-orm ^0.45.2`, `drizzle-kit ^0.31.10` | Type-safe schema definition, SQL migrations, seeding |
| **Client State / Cache**| TanStack React Query | `@tanstack/react-query ^5.100.9` | Server state caching, background invalidation, mutation hooks |
| **Authentication & RBAC**| Clerk | `@clerk/nextjs ^7.2.7` | User auth, session claims, multi-tenant organizations |
| **AI Engine (Native)** | Google GenAI SDK | `@google/genai ^1.50.1` | Gemini 2.5 Flash / Pro question generation and extraction |
| **Rate Limiting** | Upstash Redis | `@upstash/ratelimit ^2.0.8`, `@upstash/redis ^1.37.0` | IP & User level API throttling |
| **Data Validation** | Zod | `^4.3.6` | Runtime environment validation and payload schema checks |
| **PDF Extraction** | unpdf / External Vision Service | `unpdf ^1.6.2` + External REST | Document parsing and section segmentation |

---

## 3. Architecture & Data Flow

```mermaid
graph TD
    User([Candidate / Student]) -->|Attempts Mocks| CBT[CBT Exam Engine /test]
    Faculty([Faculty / Admin]) -->|Generates Questions| QS[Question Studio /admin/questions]
    Faculty -->|Uploads PYQ Paper| PDF[PDF Ingestion /admin/upload-pdf]
    
    QS -->|POST /api/admin/generate-questions| Gemini[Google Gemini 2.5 Flash API]
    PDF -->|POST /api/admin/upload-pdf| ExtParser[External Vision Parser / unpdf]
    
    Gemini -->|Returns AI Questions| DB[(Neon PostgreSQL via Drizzle)]
    ExtParser -->|Parsed JSON Questions| DB
    
    DB -->|Status: pending_review| ReviewQueue[Admin Review Queue]
    Faculty -->|PATCH /approve| DB
    DB -->|Status: approved| LiveBank[(Live Question Bank)]
    
    LiveBank -->|Fetches Approved Questions| CBT
    LiveBank -->|Aggregates Stats| Dashboards[Student & Institute Dashboards]
    
    Clerk[Clerk Auth & Multi-Tenant Org] -->|Session Claims & Org Role| Middleware[Proxy / Middleware]
    Middleware -->|Enforces RBAC| QS
    Middleware -->|Enforces RBAC| Dashboards
```

---

## 4. Database Schema (Neon PostgreSQL + Drizzle ORM)

File: `lib/db/schema.js`

### 4.1. `questions` Table
Stores all exam questions (both approved in live pool and pending review).

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `varchar(20)` | `PRIMARY KEY` | Custom nano ID prefixed `q_` with 6 random chars (e.g. `q_a8x9f2`) |
| `question` | `text` | `NOT NULL` | Main question statement (supports LaTeX math `$x^2 + y^2 = r^2$`) |
| `options` | `jsonb` | `NOT NULL` | JSON map of 4 choices: `{"A": "...", "B": "...", "C": "...", "D": "..."}` |
| `correct_answer` | `char(1)` | `NOT NULL` | Single letter key: `'A'`, `'B'`, `'C'`, or `'D'` |
| `explanation` | `text` | `NULLABLE` | Detailed step-by-step solution with KaTeX equations |
| `topic` | `varchar(100)` | `NOT NULL` | Granular topic (e.g. `'Time and Work'`, `'Syllogism'`) |
| `paper_section` | `varchar(100)` | `NULLABLE` | Subject section (`Quantitative Aptitude`, `Reasoning`, `GK`, `English`) |
| `exam` | `varchar(100)` | `NULLABLE` | Target exam (`SSC CGL`, `RRB NTPC`, `IBPS PO`, `UPSC`) |
| `year` | `varchar(20)` | `NULLABLE` | PYQ exam year (e.g. `'2023'`, `'2024'`) |
| `shift` | `varchar(50)` | `NULLABLE` | Exam shift (e.g. `'Shift 1'`, `'Morning'`) |
| `has_image` | `boolean` | `DEFAULT false` | Flag if question includes diagram |
| `image_url` | `text` | `NULLABLE` | Remote URL or base64 data for diagram/figure |
| `image_description`| `text` | `NULLABLE` | Alt text / diagram description |
| `question_number` | `integer` | `NULLABLE` | Original number in source question paper |
| `difficulty` | `varchar(20)` | `NOT NULL` | `'easy'`, `'medium'`, or `'hard'` |
| `status` | `varchar(20)` | `DEFAULT 'approved'` | Governance lifecycle: `'approved'` or `'pending_review'` |
| `source` | `varchar(255)` | `NULLABLE` | `'manual'`, `'ai-generated'`, or PDF filename |
| `metadata` | `jsonb` | `NULLABLE` | Extensible meta: `{ paper_title, tier, exam_date, shift }` |
| `embedding` | `vector(768)` | `NULLABLE` | pgvector vector embeddings for semantic search & duplicate detection |
| `created_at` | `timestamp` | `DEFAULT now()` | Creation timestamp |

**Indexes:**
- `idx_questions_topic` on `topic`
- `idx_questions_paper_section` on `paper_section`
- `idx_questions_exam` on `exam`
- `idx_questions_year` on `year`
- `idx_questions_difficulty` on `difficulty`
- `idx_questions_status` on `status`

---

### 4.2. `pdf_sources` Table
Tracks uploaded question paper PDFs and ingestion audit records.

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `serial` | `PRIMARY KEY` | Auto-incrementing identifier |
| `filename` | `varchar(255)` | `NOT NULL` | Stored PDF file name |
| `exam` | `varchar(100)` | `NULLABLE` | Exam associated with document |
| `topic` | `varchar(100)` | `NULLABLE` | Topic associated with document |
| `status` | `varchar(20)` | `DEFAULT 'processed'` | `'processing'`, `'processed'`, or `'failed'` |
| `uploaded_at` | `timestamp` | `DEFAULT now()` | Ingestion timestamp |

---

### 4.3. `students` Table
Stores student academic credentials, exam targets, and gamified progress metrics (synced with Clerk User ID).

| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `varchar(64)` | `PRIMARY KEY` | Clerk user ID (`user_2...`) |
| `email` | `varchar(255)` | `NOT NULL, UNIQUE` | Candidate primary email |
| `name` | `varchar(255)` | `NULLABLE` | Full candidate name |
| `avatar_url` | `text` | `NULLABLE` | Profile image URL |
| `role` | `varchar(20)` | `DEFAULT 'student'` | `'student'` or `'admin'` |
| `tenth_percentage` | `varchar(10)` | `NULLABLE` | 10th grade score (e.g. `'89.2%'`) |
| `tenth_board` | `varchar(50)` | `NULLABLE` | 10th examination board (e.g. `'CBSE'`, `'ICSE'`, `'State'`) |
| `twelfth_percentage`| `varchar(10)` | `NULLABLE` | 12th grade score |
| `twelfth_stream` | `varchar(50)` | `NULLABLE` | `'PCM'`, `'PCB'`, `'Commerce'`, `'Arts'` |
| `graduation_degree` | `varchar(100)` | `NULLABLE` | Degree name (e.g. `'B.Tech Computer Science'`) |
| `graduation_college`| `varchar(255)` | `NULLABLE` | University / College name |
| `graduation_status` | `varchar(20)` | `NULLABLE` | `'completed'`, `'pursuing'`, `'not_applicable'` |
| `target_exams` | `jsonb` | `DEFAULT []` | Target exams list: `["SSC CGL", "RRB NTPC"]` |
| `target_year` | `varchar(10)` | `NULLABLE` | Target examination year (e.g. `'2025'`) |
| `preferred_language`| `varchar(10)` | `DEFAULT 'en'` | `'en'` (English) or `'hi'` (Hindi) |
| `daily_goal_questions`| `integer` | `DEFAULT 20` | Daily study drill target |
| `onboarding_completed`| `boolean`| `DEFAULT false` | Onboarding wizard completion flag |
| `current_streak_days` | `integer` | `DEFAULT 0` | Current active streak |
| `longest_streak_days` | `integer` | `DEFAULT 0` | Personal best streak record |
| `xp_points` | `integer` | `DEFAULT 0` | Gamification points (+10 per correct answer) |
| `total_attempted` | `integer` | `DEFAULT 0` | Total questions attempted |
| `total_correct` | `integer` | `DEFAULT 0` | Total correct answers |
| `plan` | `varchar(20)` | `DEFAULT 'free'` | Subscription tier: `'free'`, `'pro'`, `'premium'` |

---

## 5. Canonical Syllabus Taxonomy

File: `lib/constants/taxonomy.js`

Canonical subjects and sub-topics used for AI question prompt engineering and database categorization:

1. **Quantitative Aptitude:**
   - *Arithmetic:* Number System, LCM & HCF, Simplification & Approximation, Percentage, Ratio & Proportion, Average, Profit, Loss & Discount, Simple & Compound Interest, Time & Work, Pipes & Cisterns, Time, Speed & Distance, Trains, Boats & Streams, Mixture & Alligation, Partnership & Ages.
   - *Advanced Math:* Algebra, Geometry, Mensuration 2D, Mensuration 3D, Trigonometry, Heights & Distances, Coordinate Geometry.
   - *Modern Math & DI:* Permutation & Combination, Probability, Data Interpretation (DI).
2. **Reasoning & Intelligence:**
   - *Verbal & Logical:* Analogy, Classification / Odd One Out, Series Completion, Coding-Decoding, Blood Relations, Direction & Distance, Order & Ranking, Seating Arrangement, Syllogism, Venn Diagrams, Inequalities, Mathematical Operations, Word Formation, Clock & Calendar.
   - *Non-Verbal:* Mirror & Water Images, Paper Cutting & Folding, Embedded Figures, Figure Series & Completion, Counting of Figures, Cubes & Dices.
3. **General Awareness (GK):**
   - *Static GK:* Ancient History, Medieval History, Modern History / National Movement, Indian Polity & Constitution, Physical Geography, Indian Geography, World Geography, Indian Economy, Physics, Chemistry, Biology, Environment & Ecology.
   - *Dynamic GK:* Current Affairs (National & International), Awards & Honors, Books & Authors, Sports & Championships, Government Schemes.
4. **English Comprehension:**
   - Reading Comprehension, Cloze Test, Spotting Errors, Sentence Improvement, Fill in the Blanks, Synonyms & Antonyms, Idioms & Phrases, One Word Substitution, Active & Passive Voice, Direct & Indirect Speech, Spelling Check, Para Jumbles.

---

## 6. Authentication & RBAC (Clerk)

File: `middleware.ts` & `lib/security/auth.js`

PrepAI leverages Clerk multi-tenant RBAC:

### 6.1. Route Permissions Matrix

| Route Pattern | Required Role / Claims | Failure Action |
|---|---|---|
| `/` | Public | Allowed |
| `/test(.*)` | Public (Preset starter mocks) / Authenticated for custom AI generation | Allowed / Prompt Login |
| `/student(.*)` | Authenticated Student (`session.userId`) | Redirect to `/sign-in` |
| `/api/student(.*)` | Authenticated Student (`session.userId`) | 401 JSON |
| `/institute/dashboard(.*)`| Authenticated user with active Clerk Organization | Prompts Org selection or Org registration |
| `/admin(.*)` | Super Admin (`claims.metadata.role === 'admin'`) OR Institute Admin (`session.orgRole === 'org:admin'`) OR email in `ADMIN_EMAILS` | 403 Forbidden / Redirect to `/unauthorized` |
| `/api/admin(.*)` | Super Admin OR Institute Admin (`org:admin`) | 403 Forbidden JSON |

### 6.2. Roles & Permissions
- **Super Admin:** Full platform visibility across all questions, system settings, AI regeneration, and DB management.
- **Institute Admin (`org:admin`):** Faculty who manages a coaching organization. Can upload test PDFs, generate questions for batches, approve questions, and invite faculty/students.
- **Institute Member (`org:member`) / Student:** Takes CBT tests, views own scorecard, tracks individual streaks, updates academic credentials.

---

## 7. Application Routes & Page Directory

### 7.1. Public & Core Pages
- **`/` ([app/page.tsx](file:///c:/Github/prepai/app/page.tsx)):** Landing page featuring Pariksha hero, live scorecard preview, exam categories (SSC CGL, RRB NTPC, Banking), 6 benefit cards, self-study vs. tuition center pathways, coaching center showcase, and FAQ accordion.
- **`/test` ([app/test/page.jsx](file:///c:/Github/prepai/app/test/page.jsx)):** Interactive CBT Exam Engine host. Offers preset mocks (*SSC CGL Tier 1 Starter Mock*, *Quants & Reasoning Sprint Drill*) and a custom AI mock generator.
- **`/sign-in` & `/sign-up`:** Clerk-powered authentication interfaces with SSO.
- **`/unauthorized`:** Access denied landing for users without administrative privileges.

### 7.2. Admin & Question Studio Pages
- **`/admin` & `/admin/dashboard` ([app/admin/page.jsx](file:///c:/Github/prepai/app/admin/page.jsx)):**
  - Dark Navy Sidebar navigation (`#14143a`).
  - Top header with search, notifications, user avatar.
  - Hero banner with action shortcuts.
  - 5 KPI cards: Active students (1,248), Running mocks (3), Awaiting review (42), Average score (68%), Approved questions (9,860).
  - Review queue preview with quality scores (`94/100`, `91/100`).
  - Upcoming exam slot occupancy progress bars.
  - 8-Week student performance progression bar chart.
  - Question bank health coverage meters by subject.
  - Institute capabilities grid and live event activity log.
- **`/admin/questions` ([app/admin/questions/page.jsx](file:///c:/Github/prepai/app/admin/questions/page.jsx)):**
  - **Tab 1: Review Queue:** Shows all questions with `status === 'pending_review'`. Includes KaTeX formula rendering, option badges, explanation, quality chip, and one-click "Approve to Bank" or "Reject & Delete", plus bulk "Approve All".
  - **Tab 2: AI Generator:** Select Exam, Section, cascading Granular Topic, Difficulty (Easy/Medium/Hard), and count slider (5 to 50 questions).
  - **Tab 3: Question Bank:** Live searchable pool of approved questions with subject, section, topic, and PYQ year filters.
- **`/admin/upload-pdf` ([app/admin/upload-pdf/page.jsx](file:///c:/Github/prepai/app/admin/upload-pdf/page.jsx)):**
  - PDF document upload dropzone (supports files up to 50MB).
  - AI model architecture selector (Gemini 2.5 Flash / Pro, GPT-4o).
  - "Scan PDF Sections" button to inspect detected sections in the paper.
  - Section, topic, and exam mapper.
  - Live extracted question review cards with KaTeX preview and batch approval.

### 7.3. Student Pages
- **`/student/dashboard` ([app/student/dashboard/page.jsx](file:///c:/Github/prepai/app/student/dashboard/page.jsx)):**
  - Pariksha Student Portal header with quick navigation.
  - Gradient hero greeting candidate by name with target exam chips.
  - "Your Recommended Mock" card with 1-click launch into the CBT test engine.
  - 4 Key Metrics: Daily Goal progress bar, Study Streak counter, Overall Accuracy %, and XP Mastery.
  - Recent test scorecards with percentile ranks.
  - Topic-wise practice drill cards (Quants, Reasoning, GK, English).
  - "Focus on these topics" diagnostic accuracy progress bars.
  - Academic credentials snapshot (10th, 12th stream, graduation degree).
- **`/student/onboarding` ([app/student/onboarding/page.jsx](file:///c:/Github/prepai/app/student/onboarding/page.jsx)):**
  - Wizard form capturing candidate academic history: 10th %, 12th stream, graduation status, target competitive exams, target exam year, and language preference.

### 7.4. Coaching / Institute Pages
- **`/institute/dashboard` ([app/institute/dashboard/page.jsx](file:///c:/Github/prepai/app/institute/dashboard/page.jsx)):**
  - Header with Clerk Organization Switcher to toggle between coaching branches.
  - Coaching workspace hero showing active faculty administrator.
  - Institute KPI summary cards.
  - Shortcuts to Question Studio, PDF Ingestion, and Batch CBT Engine.
  - Embedded Clerk `<OrganizationProfile />` for managing faculty roles, student enrollments, and email invitations.
- **`/institute/create` ([app/institute/create/page.jsx](file:///c:/Github/prepai/app/institute/create/page.jsx)):**
  - Registration wizard for onboarding a new tuition class or coaching center.

---

## 8. Complete API Reference

### 8.1. Admin & Question Management APIs

#### `POST /api/admin/generate-questions`
Synthesizes questions using Gemini AI based on syllabus topics and historical PYQ context.
- **Access:** Admin only.
- **Request Body:**
  ```json
  {
    "exam": "SSC CGL",
    "paperSection": "Quantitative Aptitude",
    "topic": "Time and Work",
    "difficulty": "medium",
    "count": 10
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "generatedCount": 10,
    "questions": [
      {
        "id": "q_7a2k9c",
        "question": "A can complete a piece of work in 12 days...",
        "options": { "A": "8 days", "B": "10 days", "C": "7.5 days", "D": "6 days" },
        "correctAnswer": "C",
        "explanation": "Combined daily rate = 1/12 + 1/20...",
        "topic": "Time and Work",
        "difficulty": "medium",
        "status": "pending_review"
      }
    ]
  }
  ```

#### `GET /api/admin/questions`
Fetches filtered questions from the database.
- **Query Params:** `exam`, `paperSection`, `topic`, `year`, `status`
- **Response:** Array of question objects matching criteria.

#### `PATCH /api/admin/questions/[id]/approve`
Approves a pending question, moving its status from `pending_review` to `approved`.
- **Response:** `{ "success": true, "question": { "id": "...", "status": "approved" } }`

#### `DELETE /api/admin/questions/[id]`
Deletes a question from the database.
- **Response:** `{ "success": true, "deletedId": "..." }`

---

### 8.2. PDF Ingestion APIs

#### `POST /api/admin/upload-pdf`
Extracts questions from an uploaded PDF question paper via external parser service or unpdf.
- **Content-Type:** `multipart/form-data`
- **Form Fields:** `pdfFile` (File), `exam`, `topic`, `section`, `provider`, `model`
- **Response:**
  ```json
  {
    "success": true,
    "filename": "SSC_CGL_Tier1_2023.pdf",
    "questionsCount": 25,
    "questions": [ ... ]
  }
  ```

#### `POST /api/admin/upload-pdf/sections`
Scans and returns the section boundaries inside a PDF paper (e.g. Section 1: Quantitative Aptitude, Section 2: General Intelligence).
- **Content-Type:** `multipart/form-data`
- **Response:**
  ```json
  {
    "success": true,
    "sections": [
      { "name": "Quantitative Aptitude", "description": "Questions 1 to 25" },
      { "name": "General Intelligence", "description": "Questions 26 to 50" }
    ]
  }
  ```

#### `POST /api/admin/upload-pdf/save`
Saves extracted questions into the database. Can save single questions or batch approve.
- **Request Body:**
  ```json
  {
    "questions": [ ... ],
    "exam": "SSC CGL",
    "paperSection": "Quantitative Aptitude",
    "topic": "Percentage",
    "filename": "SSC_CGL_Tier1_2023.pdf",
    "status": "approved"
  }
  ```

---

### 8.3. Filter & Taxonomy APIs

- **`GET /api/filters/exams`:** Returns unique exam names stored in database or taxonomy defaults.
- **`GET /api/filters/sections`:** Returns the canonical 4 paper sections (`Quantitative Aptitude`, `Reasoning & Intelligence`, `General Awareness`, `English Comprehension`).
- **`GET /api/filters/topics?exam=&section=`:** Returns granular topics matching the specified section and exam.
- **`GET /api/filters/years`:** Returns distinct PYQ years (e.g. `["2024", "2023", "2022", "2021"]`).

---

### 8.4. Student Profile & Mock Generation APIs

#### `GET /api/student/profile`
Fetches the logged-in student's academic profile, streak, daily goal, XP, and target exams.
- **Access:** Authenticated student (`session.userId`).
- **Response:**
  ```json
  {
    "student": {
      "id": "user_2...",
      "name": "Candidate",
      "email": "student@example.com",
      "currentStreakDays": 3,
      "longestStreakDays": 7,
      "xpPoints": 120,
      "totalAttempted": 24,
      "totalCorrect": 18,
      "targetExams": ["SSC CGL"],
      "onboardingCompleted": true
    }
  }
  ```

#### `POST /api/student/profile`
Updates candidate onboarding details and academic background.

#### `POST /api/generate-mock-test`
Generates a dynamic multi-question mock exam based on target exam and difficulty.

---

## 9. Key Components & Implementation Details

### 9.1. MathRenderer (`components/common/MathRenderer.jsx`)
Crucial component for accurate rendering of mathematical equations and scientific formulas across Indian competitive exams:
- Parses LaTeX equations formatted as inline `$...$` or block `$$...$$`.
- Handles raw math formulas (e.g. `\frac{a}{b}`, `\sqrt{x}`, `\alpha + \beta`, `\pi r^2 h`).
- Employs KaTeX parser with safe fallback to plain text if syntax is malformed, preventing hydration crashes.

### 9.2. ExamEngine (`components/exam/ExamEngine.jsx`)
Full-fledged CBT Exam simulation component with 3 distinct lifecycle states:
1. **Instructions Stage:** Displays exam rules, section list, marking scheme (+2 for correct, -0.5 for wrong), and candidate acknowledgement checkbox.
2. **Live Test Simulation Stage:**
   - Active countdown timer in minutes and seconds with automatic submission upon expiry.
   - Section tabs allowing candidates to jump between subjects.
   - Question statement rendered via `<MathRenderer />`.
   - Option cards (A, B, C, D) with instantaneous selection.
   - Bottom bar with: **"Clear Response"**, **"Mark for Review & Next"**, and **"Save & Next"**.
   - Right-side collapsible 1..N Question Palette with live status color coding:
     - 🟢 *Answered*
     - 🟣 *Marked for Review*
     - 🔴 *Not Answered (Visited)*
     - ⚪ *Not Visited*
   - Submission confirmation modal displaying attempted, unattempted, and marked counts.
3. **Scorecard & Detailed Solutions Stage:**
   - Score readout, Accuracy %, Percentile rank, and sectional performance progress bars.
   - Solution review filter tabs: *All Questions*, *Incorrect Only*, *Correct Only*, *Unanswered*.
   - Displays correct answer key, candidate's selected choice, and full LaTeX solution explanation.

---

## 10. External Integrations & Services

### 10.1. Clerk Auth & Multi-Tenant Organizations
- **Domain:** User identity, session tokens, JWT claims, and Organization memberships.
- **Organization Switcher:** Allows coaching centers to operate segregated branches.
- **Invitations:** Faculty administrators can invite students or teachers via Clerk invitations API.

### 10.2. Neon PostgreSQL Serverless
- **Connection String:** `DATABASE_URL` with pooled connection strings.
- **`pgvector` Support:** Configured for storing 768-dimensional question embeddings (`vector(768)`).

### 10.3. Google Gemini 2.5 Flash / Pro (`@google/genai`)
- **Key:** `GEMINI_API_KEY`.
- **Usage:**
  - Fast question generation matching exam taxonomy.
  - Multi-step solution generation with LaTeX formatting.
  - OCR text normalization for extracted PDF questions.

### 10.4. External PDF Vision Parser Service
- **Environment Key:** `PDF_PARSER_API_URL` (Defaults to `http://localhost:3001`).
- **Endpoints Called:**
  - `POST /api/extract-sections`: Returns section headings detected in PDF.
  - `POST /api/extract-questions`: Processes PDF bytes with vision models to return structured question blocks.
- **Fallback:** If external service is unavailable, `unpdf` library performs in-process text extraction.

### 10.5. Upstash Redis & Rate Limiting
- **Environment Keys:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **Usage:** Sliding window rate limiter applied to AI generation endpoints (`/api/admin/generate-questions`) to protect AI API quotas.

---

## 11. Environment Configuration

All environment variables are validated at runtime in `lib/config/env.js`:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:***@ep-***.us-east-2.aws.neon.tech/neondb?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google Gemini AI
GEMINI_API_KEY=AIzaSy***

# PDF Parser Service (Optional / External)
PDF_PARSER_API_URL=http://localhost:3001
PDF_PARSER_PROVIDER=gemini
PDF_PARSER_MODEL=gemini-2.5-flash

# Super Administrator Emails (Comma-separated)
ADMIN_EMAILS=admin@prepai.com,faculty@brightpath.edu

# Upstash Redis (Optional for Rate Limiting)
UPSTASH_REDIS_REST_URL=https://***.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX***
```

---

## 12. NPM Scripts & Development Workflow

| Script | Command | Purpose |
|---|---|---|
| `pnpm dev` | `next dev --turbopack` | Runs local development server on `http://localhost:3000` with Turbopack |
| `pnpm build` | `next build` | Produces production build and validates all TypeScript & static pages |
| `pnpm start` | `next start` | Starts production server |
| `pnpm lint` | `eslint` | Runs ESLint 9 checks across all files |
| `pnpm db:generate` | `drizzle-kit generate` | Generates SQL migration files from `lib/db/schema.js` |
| `pnpm db:push` | `drizzle-kit push` | Pushes schema changes directly to Neon PostgreSQL |
| `pnpm db:studio` | `drizzle-kit studio` | Launches Drizzle visual database manager |
| `pnpm db:seed` | `node lib/db/seed.js` | Seeds initial taxonomy & sample exam questions |
| `pnpm db:clear` | `node lib/db/clear.js` | Clears test questions from the database |

---

## 13. Critical Rules & Development Conventions

1. **Next.js Version Constraints:** This repository uses **Next.js 16.2.4** with Turbopack. Be aware that the `middleware.ts` file convention is supported but Next.js encourages the proxy convention. Always test builds with `pnpm build`.
2. **React 19 Immutability & Hook Safety:** Avoid synchronous `setState` calls inside the top-level body of `useEffect`. Wrap asynchronous operations or timers inside callbacks to comply with React 19's strict linter.
3. **Database IDs:** Never use raw numeric integers as IDs for questions. Always use the canonical UID generator `q_${generateQuestionUid(6)}` defined in `lib/utils/uid.js`.
4. **Governance Guarantee:** Every question created via AI or extracted from PDF must default to `status = 'pending_review'` unless explicitly confirmed by faculty in an approval mutation.
5. **KaTeX Formatting:** Always wrap mathematical expressions in standard LaTeX syntax (`$x$` for inline, `$$x$$` for display math) so that `<MathRenderer />` can render them seamlessly without layout shift.
