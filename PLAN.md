# Pariksha Studio UI migration plan

PrepAI is being renamed **Pariksha Studio**. The design export in `pariksha-studio-design/` is the final UI. This plan maps every existing PrepAI route to its design view, specifies the design system, sign-in and sign-up, and the dashboard shells, and orders the work into phases.

- **Design source:** `C:\Users\JOHN\Downloads\pariksha-studio-design\pariksha-studio-design`
- **Static views** (`index.html`, `login.html`, `register.html`, `student/`, `institute-student/`, `admin/`) are the visual source of truth.
- **Live prototype** (`live/*.dc.html`) is the behaviour source of truth: filters, booking, exam player, form validation, demo sign-in.
- **Recommendation:** copy the export into this repo as `docs/design/` so everyone builds against the same files. It is static HTML and is not part of the Next.js build.

---

## 1. Principles

1. **Match the design exactly** at 1440 px: layout, spacing, colours, type, copy. Where the design is wrong (section 10), fix the defect and keep the look.
2. **Real data or an honest empty state.** The design is full of sample numbers (1,248 students, 9,860 questions). Never ship those as hard-coded values. Every number on screen comes from the database, or the tile shows an empty state.
3. **One component system.** The design repeats about 25 patterns. Build each once in `components/ui` and compose pages from them. No page-level one-off styling.
4. **Responsive by design, not by accident.** The export has no phone layouts (zero media queries). Desktop matches the design; tablet and phone get proper layouts defined in section 7.
5. **Accessibility is already in the design. Keep it:** 44 px minimum targets, amber focus ring, skip links, labelled inputs, `aria-current` on nav, `role="progressbar"` on meters.
6. **Security rules from the last commit stay in force.** `/admin/*` is super-admin only until data is scoped per institute (Phase 3).

---

## 2. Route map

### 2.1 Existing PrepAI routes and their design counterparts

| Existing route | What it does today | Design view | New route | Notes |
|---|---|---|---|---|
| `/` | Placeholder landing page | `index.html` | `/` | Full rebuild: hero, sample result card, exam categories, features, 3 steps, two paths, pricing, institutes band, FAQ, CTA, footer. |
| `/sign-in/[[...sign-in]]` | Clerk `<SignIn/>` | `login.html` | `/sign-in` | Custom form on Clerk hooks (section 5). Drop the demo-accounts box. |
| `/sign-up/[[...sign-up]]` | Clerk `<SignUp/>` | `register.html` | `/sign-up` | Custom form plus an email-code step. Target exam and institute code fields. |
| `/student/dashboard` | Profile stats, drills, credentials | `student/dashboard.html` | `/student/dashboard` | Rebuild. Next exam, 4 stat tiles, recent results, focus topics, plan banner. |
| `/student/onboarding` | 5-step academic profile wizard | *none* | `/student/onboarding` | Keep the feature and restyle it with the create-exam stepper pattern (section 2.3). |
| `/test` | Generate an AI mock, answer, see score | `student/exam-*.html` | `/student/practice` then the exam player | The builder is restyled. Questions run in the design's exam player in practice mode. `/test` redirects. |
| `/admin/questions` | Generator, filters, approve and delete list | `admin/question-studio*.html` | `/admin/question-studio`, `/review`, `/bank` | Split into the design's 3 tabs. `/admin/questions` redirects to `/admin/question-studio/review`. |
| `/admin/upload-pdf` | Upload PYQ PDF, extract, review | `admin/library.html` | `/admin/library` | Upload card plus documents table. "Generate questions" and extraction feed the review queue. `/admin/upload-pdf` redirects. |
| `/admin/dashboard` | Empty folder | `admin/dashboard.html` | `/admin/dashboard` | New. `/admin` redirects here. |
| `/institute/dashboard` | Org info plus Clerk `<OrganizationProfile/>` | `admin/dashboard.html` | `/admin/dashboard` | The design's admin console *is* the institute admin's home. Members and invites move to Students, Invite and Settings. Redirect once Phase 3 opens `/admin` to org admins. |
| `/institute/create` | Clerk `<CreateOrganization/>` | *none* | `/institute/register` | New page in the sign-up shell (section 2.3). |
| `/unauthorized` | Access-denied card | *none* | `/unauthorized` | Restyle with the exam-submitted card pattern. |

### 2.2 Design views with no existing route (new)

| Design view | New route | Needs backend? |
|---|---|---|
| `student/exams.html` + `exams-booking.html` | `/student/exams` (booking expands inline) | Yes: exams, slots, bookings |
| `student/schedule.html` + `schedule-reschedule.html` | `/student/schedule` (reschedule expands inline) | Yes: bookings |
| `student/history.html` | `/student/history` | Yes: attempts |
| `student/result.html` | `/student/results/[attemptId]` | Yes: attempts, answers |
| `student/profile.html` | `/student/profile` | Partly: students table exists; plan and institute cards need data |
| `student/exam-instructions.html` | `/exam/[examId]/instructions` | Yes |
| `student/exam-test.html` | `/exam/attempt/[attemptId]` | Yes: attempts, autosave |
| `student/exam-submitted.html` | `/exam/attempt/[attemptId]/submitted` | Yes |
| `admin/exams.html` | `/admin/exams` | Yes |
| `admin/exam-detail.html` + `-reschedule` | `/admin/exams/[examId]` | Yes |
| `admin/create-exam.html` steps 1 to 4 | `/admin/exams/new?step=1..4` | Yes: draft exams |
| `admin/students.html` | `/admin/students` | Yes: batches, attempts |
| `admin/student-history.html` | `/admin/students/[studentId]` | Yes |
| `admin/invite-students.html` | `/admin/students/invite` | Clerk org invitations plus batches |
| `admin/analytics.html` | `/admin/analytics` | Yes: attempts, answers |
| `admin/integrations.html` | `/admin/integrations` | Later: SSO, API keys, webhooks |
| `admin/branding.html` | `/admin/branding` | Yes: institutes table. Drives student portal theme. |
| `admin/billing.html` | `/admin/billing` | Later: payment provider |
| `admin/audit-log.html` | `/admin/audit-log` | Yes: audit_log table |
| `admin/settings.html` | `/admin/settings` | Partly: Clerk org members and roles |

The **institute student** views (`institute-student/*`) are not separate routes. They are the same `/student/*` pages rendered with the institute's brand colour and name (section 6.3).

### 2.3 Existing pages with no design: how to design them

| Page | Pattern to reuse |
|---|---|
| `/student/onboarding` | Create-exam stepper (`admin/create-exam*.html`): 4 step tiles, one card per step, Back / Save / Next footer. Inputs use the design `.in` and `.lbl` styles. |
| `/institute/register` | Sign-up split shell. Left panel: institute pitch from the landing "For coaching institutes" band. Right card: institute name, city, your role, then create. |
| `/unauthorized` | Exam-submitted centred card: icon circle, title, one line, two buttons. |
| `/student/practice` | Student portal page with the Question Studio "Generate" card layout: section, topic, difficulty, count, then "Start practice". |
| `/forgot-password`, email-code step | Sign-in split shell with a single-field card. |

### 2.4 Redirects to add

`/admin` → `/admin/dashboard`, `/admin/questions` → `/admin/question-studio/review`, `/admin/upload-pdf` → `/admin/library`, `/test` → `/student/practice`, `/institute/create` → `/institute/register`. `/institute/dashboard` redirects to `/admin/dashboard` from Phase 3. Use `redirects()` in `next.config.ts`.

---

## 3. App structure

```
app/
  (marketing)/page.tsx                  landing
  (auth)/layout.tsx                     split shell (gradient panel + form)
  (auth)/sign-in/[[...sign-in]]/page.tsx
  (auth)/sign-up/[[...sign-up]]/page.tsx
  (auth)/forgot-password/page.tsx
  (auth)/institute/register/page.tsx
  sso-callback/page.tsx                 Google OAuth return
  post-auth/route.ts                    role-based redirect after sign-in
  student/(portal)/layout.tsx           top-nav portal shell, brand-themed
  student/(portal)/{dashboard,exams,schedule,history,results/[attemptId],profile,practice,onboarding}
  exam/layout.tsx                       focused shell: logo + user only, no nav
  exam/[examId]/instructions, exam/attempt/[attemptId], .../submitted
  admin/(console)/layout.tsx            sidebar + topbar shell
  admin/(console)/{dashboard,exams,exams/new,exams/[examId],question-studio,question-studio/review,
                   question-studio/bank,library,students,students/[studentId],students/invite,
                   analytics,integrations,branding,billing,audit-log,settings}
  unauthorized/page.tsx
components/
  ui/        primitives (section 4.3)
  shells/    PublicHeader, AuthShell, StudentShell, AdminShell, ExamShell
  charts/    BarChart, Meter, ScoreTrend
  domain/    ExamCard, SlotPicker, QuestionReviewCard, QuestionPalette, KpiTile, ...
lib/
  nav.ts      admin sidebar groups and student nav, single source
  brand.ts    institute brand -> CSS variables
  format.ts   dates in IST ("Sun 4 Oct · 19:00"), percentiles ("62nd"), counts ("1,248")
```

Convert pages to TypeScript as they are rebuilt (`.tsx`). Keep data fetching in Server Components where possible. Use TanStack Query only for client-side mutations and live lists.

---

## 4. Design system

### 4.1 Tokens (put in `app/globals.css` under Tailwind v4 `@theme`)

**Type:** Plus Jakarta Sans 400/500/600/700/800 via `next/font/google`. Remove Geist, the Arial body override and the dark-mode block in `globals.css`, because the design is light only.

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#151736` | Primary text |
| `--muted` | `#4B4F72` | Secondary text, table headers |
| `--nav-text` | `#3B3F66` | Student top nav items |
| `--bg-app` | `#F4F5FB` | Portal and console background |
| `--bg-auth` | `#F6F7FC` | Public, auth and gallery background |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-hover` | `#F8F9FE` | Hover on link cards and rows |
| `--border` | `#E3E5F0` | Card borders |
| `--divider` | `#ECEEF7` | Row separators |
| `--track` | `#E6E8F5` | Progress bar track |
| `--input-border` | `#7F84B0` | 2 px input borders |
| `--brand` | `#4338CA` | Admin primary (indigo 700) |
| `--brand-portal` | `#3730A3` | Student and auth primary |
| `--brand-dark` | `#2B2A8F` | Hover and pressed |
| `--brand-soft` | `#EEF0FF` | Soft fills, active nav |
| `--brand-line` | `#C7CAF5` | Outline button borders |
| `--brand-chart` | `#A5A8F0` | Older chart bars |
| `--sidebar` | `#14143A` | Admin sidebar |
| `--sidebar-hover` | `#26276B` | Sidebar hover |
| `--sidebar-card` | `#1F2060` | AI credits card |
| `--sidebar-label` | `#A9ADE0` | Group labels |
| `--sidebar-sub` | `#B9BCEB` | Sub-labels |
| `--teal` | `#0F766E` / `#2DD4BF` | Gradient end, accents, credit meter |
| `--cta` | `#FBBF24` | Landing primary CTA |
| `--focus` | `#F59E0B` | 3 px focus ring, 2 px offset |
| `--ok` | bg `#D1FAE5`, text `#065F46`, strong `#047857` | Chips, good meters |
| `--warn` | bg `#FEF3C7`, text `#92400E`, strong `#B45309` | Chips, weak-topic bars |
| `--bad` | bg `#FEE2E2`, text `#991B1B`, strong `#B91C1C`, border `#F5B5B5` | Chips, danger buttons |
| `--info` | bg `#E0E7FF`, text `#3730A3` | Chips |
| `--mute` | bg `#E5E7EB`, text `#374151` | Chips |

**Gradients**
- Auth panel and landing hero: `linear-gradient(150deg, #1E1B6B 0%, #3730A3 55–60%, #0F766E 140–150%)`
- Admin hero: `linear-gradient(120deg, #2B2A8F 0%, #4338CA 55%, #0F766E 130%)`
- Student hero: `linear-gradient(120deg, var(--brand-dark), var(--brand))`
- Logo mark: `linear-gradient(135deg, #6366F1, #2DD4BF)` in admin, `#4F46E5 → #0F766E` on the landing page

**Radii:** card 18 px, hero 24 px, button 12 px, input 10 px, chip and pill 99 px. **Card padding:** 24 px. **Main widths:** admin 1280 px (padding 32), student 1180 px (padding 28/24), auth form card about 460 px.

### 4.2 Typography scale (from the views)

| Role | Size / weight |
|---|---|
| Landing hero h1 | 56–64 px / 800, letter-spacing -0.02em |
| Page h1 (console, portal) | 32 px / 800 |
| Hero h1 (dashboards) | 32 px / 800, white |
| Section h2 | 20–22 px / 800 |
| Card title | 18 px / 700 |
| Body | 15–16 px / 500 |
| Label | 14 px / 700 |
| Table header, eyebrow | 12–13 px / 700, eyebrow uppercase with 0.08em tracking |
| KPI value | 32–36 px / 800 |

Measure each against the screenshots during Phase 0. These are starting values.

### 4.3 Component inventory (build once, in `components/ui`)

| Component | Design source | Spec |
|---|---|---|
| `Button` | `.btn-*` | Variants: primary, outline, light, ghost (on dark), danger, sm. 44 px min height (48 px in auth). |
| `Card`, `LinkCard` | `.card` | 18 px radius, 1 px border; link variant hovers to `#8F93E8` border. |
| `Chip` | `.chip .ok/.warn/.bad/.info/.mute` | Status and tag pills. |
| `Input`, `Select`, `Textarea`, `Label`, `Hint`, `FieldError` | `.in .lbl .hint` | 2 px `#7F84B0` border. Keep native `<select>`, which matches the design and stays accessible. |
| `Checkbox`, `Radio` | native | Set `accent-color: var(--brand)`. The export uses default browser blue, which is a defect. |
| `PillTabs` | `.tab[aria-pressed]` | Filter pills (All, Full mock, ...). |
| `TopNav` | `.navb[aria-current]` | Student nav, inset 3 px underline on active. |
| `Sidebar`, `SidebarGroup`, `SidebarItem` | admin aside | Section 6.1. |
| `PageHeader` | admin pages | Breadcrumb, h1, subtitle, right-aligned actions. |
| `Breadcrumb` | admin pages | Underlined links, "/" separators. |
| `StatTile` / `KpiTile` | dashboards | Label, value, delta line (green or amber), optional link. |
| `Meter` | topic bars, credits | Label row + value, 8 px bar, colour by threshold, `role="progressbar"`. |
| `DataTable` | `.tr .th` grid rows | CSS grid columns per table. Overflow-x on narrow screens, or stacked rows on phones. |
| `SlotPicker` | booking fieldsets | Radio cards with date line and seats line. Full slots disabled. |
| `Stepper` | create-exam | 4 numbered tiles, done tiles show a check. |
| `QuestionReviewCard` | review queue | Tags, quality score, options with "Correct answer" chip, explanation, Approve / Edit / Reject. |
| `QuestionPalette` | exam test | 44 px numbered buttons; states answered (green), marked (amber), not answered (white), current (ring). |
| `AnswerOption` | `.opt` | Radio card. Remove the extra bottom padding seen in the export. |
| `EmptyState` | new | Icon, one line, one action. |
| `Toast` | new | Save, approve and booking confirmations. |
| `ConfirmDialog` | new | Cancel exam, submit exam, delete question, revoke key. |
| `SkipLink` | `.skip` | First element in every shell. |

### 4.4 Charts

Every chart in the design is a simple bar chart or a meter: the admin 8-week performance, the student score trend, the analytics score distribution, and topic, section and bank-health bars. **Build them as small SVG and CSS components** in `components/charts`, with value labels on bars as drawn. They match the design exactly, need no client JavaScript, and add no dependency. Read the `dataviz` guidance before building them.

Add **Recharts** only if a later screen needs hover tooltips, zoom or line or area charts, for example analytics trends over months.

---

## 5. Sign-in and sign-up (Clerk custom flows)

Both pages use the same **AuthShell**: a two-column flex layout with `flex: 1 1 420px` and `flex: 1 1 480px`.
- **Left panel:** the 150° indigo-to-teal gradient, padding 48/40, logo at top. Below it the h1, subtitle and three ✓ points, with the footnote at the bottom.
- **Right side:** a centred white card on `#F6F7FC`, 48 px inputs and a 48 px primary button.
- **Below 900 px:** the panel collapses to a compact header (logo, h1 and subtitle only) above the card. The ✓ points move under the form.

### 5.1 Approach

Clerk 7.2 ships the new signal-based hooks (`useSignIn()` and `useSignUp()` return `{ signIn | signUp, errors, fetchStatus }`). They support everything the design needs:

| Need | Clerk API |
|---|---|
| Email + password sign-in | `signIn.password({ identifier, password })` then `signIn.finalize()` |
| Forgot password | `signIn.resetPasswordEmailCode.sendCode()` → `.verifyCode({ code })` → `.submitPassword({ password })` |
| Email + password sign-up | `signUp.password({ emailAddress, password, firstName, lastName, unsafeMetadata, legalAccepted })` |
| Verify email | `signUp.verifications.sendEmailCode()` → `.verifyEmailCode({ code })` → `signUp.finalize()` |
| Google (optional) | `signIn.sso(...)` / `signUp.sso(...)` with `/sso-callback` |
| Institute invite links | `signUp.ticket()` for Clerk org invitation tickets |

**Do not** theme the prebuilt `<SignIn/>` component for this. It can't hold the target-exam and institute-code fields, and its card chrome won't match the design.

### 5.2 Sign-in page (`/sign-in`)

- **Left panel copy:** "Welcome back. Your next rank starts with one mock test." Then the 3 ✓ points and the footnote, as in `login.html`.
- **Card:** "Sign in", the "Students, institute students and institute admins all sign in here." line, Email, Password, a "Show password" checkbox, a "Forgot password?" link button, the "Sign in" button, and "New here? Create a free account".
- **Remove** the "Demo accounts" box. It belongs to the prototype only.
- **Errors:** an inline alert above the button with `role="alert"`. Map Clerk error codes to plain copy. The prototype's "That email and password do not match..." is the default.
- **Loading:** disable the button and show "Signing in…" while `fetchStatus === 'fetching'`.
- **Redirect:** on success go to `/post-auth` (section 5.5).

### 5.3 Sign-up page (`/sign-up`)

Fields from `register.html`:
- Full name
- Email
- Password, with the hint "Use 8 or more characters with a letter and a number." Validate on blur.
- "Which exam are you preparing for?": SSC CGL, SSC CHSL, Banking (IBPS PO), Railways (NTPC), Other. Take the list from `lib/constants/taxonomy.js` so it stays in sync.
- Institute code (optional), with the hint "Studying at a coaching institute? Enter the code they gave you."
- Terms checkbox, which is required.
- Then the "Create free account" button and "Already have an account? Sign in".

Flow:
1. Validate with zod and `react-hook-form`.
2. If an institute code is entered, check it first with `POST /api/institutes/validate-code`. Show "That code isn't recognised" inline, and don't create the account until the code is valid or cleared.
3. Call `signUp.password(...)` with `unsafeMetadata: { targetExam, instituteCode }` and `legalAccepted: true`.
4. Swap the card to a **"Check your email"** step with a 6-digit code input, a "Resend code" link with a 30 s cooldown, and "Use a different email".
5. Verify, finalize, then `/post-auth`.

### 5.4 Server side after sign-up

Route: `POST /api/onboarding/complete`, called by `/post-auth` on first sign-in. A Clerk `user.created` webhook can do the same work as a backstop.
- **Upsert the `students` row** from the Clerk user plus `unsafeMetadata.targetExam`.
- **Join the institute.** If `instituteCode` is set, re-validate it on the server. Then add the user to that Clerk organization as `org:member` with `clerkClient().organizations.createOrganizationMembership`, set it active, and record the batch if the code is batch-specific. Never trust the code without re-validating it.
- **Clear the metadata.** Remove `instituteCode` from `unsafeMetadata` afterwards.

### 5.5 Post-auth routing (`/post-auth`)

| User | Destination |
|---|---|
| Super admin | `/admin/dashboard` |
| `org:admin` of the active org (Phase 3 onward) | `/admin/dashboard` |
| Student without a completed profile | `/student/onboarding` |
| Everyone else | `/student/dashboard`, branded if an org is active |

### 5.6 Institute registration (`/institute/register`)

- **Shell:** the auth shell with the left panel copy from the landing institutes band.
- **Fields:** institute name, city, your name and role, and an agreement checkbox.
- **On submit:** create the Clerk organization server-side, insert the `institutes` row with a generated join code such as `BRIGHT-2026`, then go to `/admin/branding` to set the brand.
- **Until Phase 3:** keep this page behind a feature flag, because org admins can't use the console yet.

### 5.7 Clerk dashboard settings to confirm

- Email + password enabled, email verification by code.
- First and last name collected but optional. Split "Full name" on the first space.
- Organizations enabled. Turn off "allow users to create organizations" in the prebuilt UI, because creation happens only through `/institute/register` on the server.
- **Allow personal accounts (turn off "force organization selection").** Found in Phase 1 testing: with it on, every session stays *pending* on a `choose-organization` task until the user joins or creates an organization. The server treats pending sessions as signed out, so free students can't sign in. The custom forms now show a clear message in that case instead of looping.
- Custom org roles: `org:admin`, `org:member`, plus `org:subject_expert` and `org:analyst` for the Settings "Team and roles" card.
- Session token claims: add `metadata: {{user.public_metadata}}` so admin checks avoid an API lookup.

---

## 6. Dashboard shells and layouts

### 6.1 Admin console shell (`AdminShell`)

**Layout (desktop ≥ 1024 px):** CSS grid `264px 1fr`, full height. The sidebar is sticky (`position: sticky; top: 0; height: 100vh; overflow-y: auto`). The export uses a flex-wrap trick, which is what makes it stack badly on phones, so don't copy that.

**Sidebar** (`#14143A`, padding 24/16, gap 20):
- **Logo block:** a 40 px gradient square with a check icon, "Pariksha Studio" at 18/800, "Admin console" at 12 px `#B9BCEB`. It links to the dashboard.
- **Nav groups** (labels 12/700 uppercase, `#A9ADE0`):
  - **Workspace:** Dashboard, Exams, Question Studio, Knowledge Library
  - **People and insight:** Students & Batches, Analytics
  - **Platform:** Integrations & SSO, Branding, Billing & credits, Audit log, Settings
- **Items:** 44 px tall, 20 px icon plus label at 15/600, text `#D5D7F5`. Hover `#26276B`. Active fill `#4338CA`, white text, `aria-current="page"`.
- **AI credits card** (`#1F2060`, radius 14): a title, a teal meter (`#2DD4BF` on `#3A3C8C`), "62% used. Resets on 1 Nov." and a "Top up credits" link. Hide the card until credits exist (Phase 5).

**Top bar** (white, bottom border, padding 16/32):
- Search field, about 520 px max, with a visually hidden label.
- Notifications bell (44 px outlined square) with a red count badge. It opens a popover listing recent audit events.
- Avatar circle with initials (indigo), then name at 14/700 and "role · institute" at 12 px muted.
- "Sign out" as an outlined small button.

**Main:** max-width 1280, centred, padding 32, vertical gap 28.

**Tablet and phone (< 1024 px):**
- The sidebar becomes an off-canvas drawer (Radix Dialog as a sheet) opened by a menu button at the left of the top bar.
- Search collapses to an icon button that expands.
- The name and role text hide, leaving the avatar.
- Main padding drops to 16.

### 6.2 Admin dashboard (`/admin/dashboard`), section by section

1. **Hero** (gradient, radius 24, padding 36, wraps):
   - **Left side:** an eyebrow with today's date ("SUNDAY, 4 OCTOBER", IST, uppercase), the h1 "Good morning, {firstName}. Your students are ready to rise." and a summary line.
   - **Summary line:** built from live counts: exams going live today and questions awaiting review. Use time-of-day greetings.
   - **Right side buttons:** "+ Generate questions" (light), "Create an exam" (ghost) and "Invite students" (ghost).
2. **"Your institute at a glance":** 5 KPI tiles, each `flex: 1 1 180px` and each a link:

   | Tile | Value | Delta line |
   |---|---|---|
   | Active students | count | +n this month |
   | Exams running now | count | n more starting today |
   | Awaiting your review | count | n flagged |
   | Average score | % | ±pts vs last month |
   | Questions approved | count | +n this week |

   Deltas are green for up and amber for attention.
3. **Two columns**, `flex: 1 1 520px` and `flex: 1 1 380px`:
   - **Question review queue:** top 4 pending questions, each row showing the truncated question, "subject · topic · difficulty", a status chip (Verified, Similar question found, Check diagram) and a quality score out of 100. "Review all {n}" button.
   - **Upcoming exam slots:** next 4 slots. Each shows the name, "Today · 10:00 to 12:00", a status chip (Almost full above 90%, Open, Scheduled, Draft), a seat meter and "276 of 300 seats filled". "Schedule exam" button.
4. **Two columns:**
   - **Student performance:** 8-week bar chart of average score, with the current week in solid `#4338CA` and earlier weeks in `#A5A8F0`, a value above each bar and W1–W8 labels. Below it, "Topics needing attention" shows the 4 weakest topics as amber meters. "Open student history" button.
   - **Question bank health:** approved count per section against need, with status text: Well stocked (green), Healthy (indigo), Running low (amber), Needs more (red). "Fill the gaps with AI" button goes to Question Studio, pre-filled.
5. **"Everything your institute needs, in one place":** a 6-card feature grid (3 × 2), each with an icon tile, title, text and a link. Show it only while the institute is new, for example under 3 exams created, and add a "Hide" control.
6. **Recent activity:** the last 4 audit events, each with an avatar initial, sentence and relative time. "View audit log" button.

**Empty states:** a new institute has no exams, questions or students. Each block shows an `EmptyState` with the next action instead of zeros.

### 6.3 Student portal shell (`StudentShell`)

- **Header** (white, bottom border, inner max-width 1180):
  - **Left:** logo mark (40 px, brand colour, initial), then name at 18/800 with tagline ("Mock exams that feel real", or "Student portal" for institutes).
  - **Middle:** `TopNav` with Home, Exams, My schedule, History, Profile.
  - **Right:** name at 14/700, with plan or batch below at 12 px. Then "Sign out" as an outlined small button.
- **Branding:** the shell sets `--brand`, `--brand-dark`, `--brand-soft` and `--brand-line` on its root.
  - Free students get indigo `#3730A3 / #2B2A8F / #EEF0FF / #C7CAF5`.
  - Institute students get the institute's colour from `institutes.brand_color`. Derive the other three with `color-mix(in oklab, ...)`. Check contrast with white at 4.5:1 or above.
  - Institute name and initial replace "Pariksha Studio". The footer becomes "Powered by Pariksha Studio · {Institute} student portal".
- **Phones:** the nav becomes a horizontally scrollable row under the logo (no wrapping into rows), and the user name hides.

### 6.4 Student dashboard (`/student/dashboard`)

1. **Hero:** brand gradient, radius 24.
   - **Free students:** eyebrow "YOUR {EXAM} PRACTICE HUB".
   - **Institute students:** eyebrow "{INSTITUTE} · {BATCH}".
   - **Content:** h1 "Hi {firstName}, ready for today's practice?", one line, and the buttons "Book an exam" (light) and "See my progress" (ghost).
2. **Your next exam:** a card with a 6 px brand left border. Shows the name, the date and time, and a chip ("Booked", or "Starts soon" within 2 h), with "Start exam" and "Reschedule". "Start exam" is enabled only inside the slot window. Without a booking, show "No exam booked" and "Book an exam".
3. **4 stat tiles:** Exams taken, Average score ("Across all attempts"), Best percentile, Booked exams ("See My schedule").
4. **Two columns:**
   - **Recent results:** last 3 attempts with a "View result" button each, plus "All results".
   - **Focus on these topics:** 3 weakest topics as amber meters, plus "Practise these topics", which goes to `/student/practice` pre-filled.
5. **Plan banner (free students only):** "You are on the Free plan" with "See Pro benefits".

The existing streak, XP, daily goal and academic credentials move. Credentials go to Profile. Streak and XP have no place in the design; decide whether to drop them (question 4 in section 13).

### 6.5 Exam player (`ExamShell`)

- **Header:** logo and user only, with no nav, so students don't leave mid-exam.
- **Strip:** exam name and a countdown in `mm:ss`, which turns red under 5 minutes.
- **Left card:** "Question n of N · Section", the question as h1 (MathRenderer), 4 `AnswerOption` radios, and the buttons Previous, Clear response, Mark for review, and Save and next.
- **Right card:** "Question palette", a legend, "n answered · n marked" and "Submit exam". Submit opens a `ConfirmDialog` with answered, unanswered and marked counts.
- **Behaviour:**
  - Autosave each answer to the server, which makes resume possible as the instructions promise.
  - The server holds the timer: the deadline is stored on the attempt and the client only displays it.
  - Auto-submit when time runs out.
  - Instructions require the "I have read the instructions" checkbox before "Begin exam" enables.
- **Phones:** the palette moves into a bottom sheet opened by a "Questions" button. The action buttons stay in a sticky bottom bar.

---

## 7. Responsive rules

| Width | Admin | Student | Auth |
|---|---|---|---|
| ≥ 1280 | As designed | As designed | Split 50/50 |
| 1024–1279 | Sidebar 240 px, KPI tiles wrap | As designed | Split |
| 768–1023 | Sidebar drawer | Two-column blocks stack | Panel becomes compact header |
| < 768 | Drawer. Tables become stacked cards, or scroll inside their card. | Nav scrolls horizontally, tiles go 2 per row | Single column |

No page may scroll sideways at 390 px. That held in the export and must hold here.

---

## 8. Libraries

| Library | Use | Why |
|---|---|---|
| `lucide-react` | Icons | The design's icons are 24-grid, 2 px stroke, round caps, which is the same style as Lucide. Tree-shakes per icon. |
| Radix primitives via **shadcn/ui** (copied into `components/ui`, not a runtime dependency) | Dialog, Sheet (mobile sidebar, palette), DropdownMenu, Popover (notifications), Tooltip | Accessible focus trapping and keyboard support that the design needs but the export doesn't implement. Restyle with section 4 tokens. Supports Tailwind v4 and React 19. |
| `class-variance-authority`, `clsx`, `tailwind-merge` | Component variants and the `cn()` helper | Standard with shadcn. Keeps `Button` and `Chip` variants typed. |
| `sonner` | Toasts | Small and accessible. Used for approve, save and booking confirmations. |
| `react-hook-form` + `@hookform/resolvers` | Forms | Sign-up, onboarding, create-exam wizard, settings. Reuses the existing zod schemas. |
| `@playwright/test` (dev) | Visual and flow tests | Screenshot every route at 1440 and 390 and compare against the design export (section 12). |

**Not recommended:**
- **A full component kit** such as MUI or Chakra. It fights the exact design.
- **Recharts for v1.** See section 4.4.
- **A date library.** `Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'` covers the formats used.

**Remove** `@google/genai`, `unpdf` and `@upstash/*` only if they stay unused after this work. That is a separate clean-up.

---

## 9. Data needed by the new views

Most design pages need tables that don't exist yet. Add them with Drizzle, plus migrations generated from the schema. The current migration files are out of date; regenerate a clean baseline first.

| Table | Key columns | Unlocks |
|---|---|---|
| `institutes` | id, clerk_org_id, name, slug, tagline, brand_color, logo_url, web_address, join_code, created_at | Branding, institute student theme, sign-up institute code |
| `batches`, `batch_members` | institute_id, name; batch_id, student_id | Students & Batches, invites, exam assignment |
| `exams` | institute_id (null = platform), title, type, duration_min, marks_per_q, negative_marking, language, status (draft, scheduled, live, paused, completed, cancelled), blueprint jsonb, audience | Exams list and detail, create wizard |
| `exam_slots` | exam_id, starts_at, capacity | Booking, seats, upcoming slots |
| `exam_questions` | exam_id, question_id, position | Paper composition |
| `bookings` | slot_id, student_id, status | Book, reschedule, cancel, My schedule |
| `attempts` | exam_id or practice, student_id, started_at, deadline_at, submitted_at, score, max_score, accuracy, percentile, time_taken | History, results, dashboards, analytics |
| `attempt_answers` | attempt_id, question_id, choice, marked, correct, time_spent | Result review, analytics, autosave |
| `library_documents` | institute_id, title, type, subject, file_url, status | Knowledge Library |
| `audit_log` | institute_id, actor_id, category, action, ip_prefix, created_at | Audit log, recent activity, notifications |
| `questions` additions | institute_id, quality_score, flags jsonb, review_note | Tenant scoping, review queue chips |

**Phase 3 gate:** every console query filters by the active org's `institute_id`. After that ships and is reviewed, `/admin/*` opens to `org:admin` again.

---

## 10. Design defects to fix while porting

These were found in the design review. Keep the look and fix the substance.

1. **History score trend:** it is reversed for the free student. Real data fixes it, but the chart must sort oldest to newest.
2. **Admin student history totals:** it shows sectional scores as "/ 200". Use each exam's max marks.
3. **Exam detail seats:** the header says 93 / 300 while the slots add up to 800. The header must be the sum of slot capacities.
4. **Dashboard counts:** live exams, review-queue counts and exam times disagree across pages. Every count must come from one query helper.
5. **Free plan card on Profile:** it lists Pro features with no label. Add a "Pro adds:" heading above the list.
6. **Invite page:** it says "Create one in Settings", but Settings has no batches section. Add batch management to Students & Batches and point the hint there.
7. **"1 exams":** use a pluralise helper everywhere.
8. **"Well done!" for 2 / 10:** choose submit copy by score band.
9. **Wrong question:** "Reasoning Topic Test 4" opened on a Quant question. Exam content always comes from the exam's own paper.
10. **Radio and checkbox colour:** default browser blue. Set `accent-color: var(--brand)`.
11. **Admin exams table:** the Manage and Results buttons stack. Put them on one row, and hide Results for exams with no attempts.
12. **Mobile:** the admin sidebar fills the first screen and the landing nav wraps to 3 rows. Section 6 fixes both.
13. **Library:** "Needs attention" documents still offer "Generate questions". Show "Fix" instead.
14. **Analytics colour legend:** section accuracy bars don't follow the stated green, amber and red thresholds. Apply the thresholds.
15. **Native file input:** it is unstyled in Library and Branding. Use a styled dropzone button.

---

## 11. Delivery phases

Each phase ends with a working, deployable app. Pages without backend data stay hidden from navigation in production. Behind `NEXT_PUBLIC_DESIGN_PREVIEW=1` they render with clearly marked fixture data for review.

### Phase 0: Foundations (about 1 week)
- Rename to Pariksha Studio in `package.json`, metadata, and the 11 files that still say "PrepAI". Add a favicon and Open Graph image.
- Fonts and tokens from section 4. Remove Geist and the dark mode block.
- `components/ui` primitives from section 4.3, and `components/charts`.
- Shells: `PublicHeader`, `AuthShell`, `StudentShell` (brand variables), `AdminShell` (sidebar, drawer, top bar), `ExamShell`.
- `lib/nav.ts`, `lib/format.ts`, `lib/brand.ts`.
- A dev-only `/dev/ui` page showing every component and state, for quick review against the export.
- Playwright set up with a screenshot test per shell.

**Done when:** each shell matches its design screenshot at 1440 px and has no horizontal scroll at 390 px. Keyboard focus shows the amber ring everywhere.

### Phase 1: Public site and authentication (about 1 week)
- Landing page (`index.html`), with the FAQ built on `<details>`.
- Sign-in, sign-up with email code, forgot password, `/post-auth`, and `/sso-callback` if Google is wanted.
- `POST /api/institutes/validate-code` and `/api/onboarding/complete`. The institute join only works once Phase 3 creates institutes; until then the field is hidden.
- Restyled `/unauthorized`.

**Done when:** a new user can sign up, verify, land on onboarding and sign out and back in. Wrong passwords and codes show the right messages. Pages match `login.html` and `register.html`.

### Phase 2: Re-skin the existing features (about 1.5 weeks)
- Student dashboard on real profile data with honest empty states. Profile page, with academic credentials as a second card. Onboarding restyled as a stepper.
- `/student/practice` replaces `/test` and runs practice sets in the new exam player. Results are shown on the design's result layout from the in-memory attempt.
- Admin console (super admin only for now):
  - `/admin/dashboard`: review queue, bank health and recent activity from real question data. The other blocks show empty states.
  - Question Studio Generate, Review queue and Bank built on the existing endpoints.
  - Knowledge Library built around the existing PDF extract flow.
- Redirects from section 2.4.

**Done when:** every existing feature works in the new UI, and no old-style page remains.

### Phase 3: Data model and institute scoping (about 1.5 weeks)
- Clean migration baseline, then the tables from section 9.
- `institute_id` on questions and every console query, with tests that one org can't read another's data.
- Institute registration, branding page (live preview) and the student portal theme from `institutes`.
- Reopen `/admin/*` to `org:admin`. Redirect `/institute/dashboard` to the console.

**Done when:** two test institutes each see only their own data, and an institute student sees their brand colour and name.

### Phase 4: Exams, booking, attempts, results (about 2–3 weeks)
- Admin: exams list, create wizard (4 steps), exam detail with pause, reschedule, clone and cancel.
- Student: exams list with booking, my schedule with reschedule and cancel (2-hour rule), instructions, exam player with autosave and a server timer, submitted page, result review, history.
- Percentiles computed per exam after enough attempts ("appears once enough students have taken this exam").
- Admin dashboard KPIs and the slots block go live.

**Done when:** a full journey works for both roles end to end. An admin creates and schedules an exam. A student books, takes and submits it and reviews the result. The admin sees the attempt in analytics.

### Phase 5: People, insight and platform (about 2 weeks)
- Students & Batches, student history, invite students (emails and CSV through Clerk org invitations).
- Analytics page, audit log with filters and CSV export, notifications popover.
- Settings: institute profile, team roles (Clerk custom roles), notification preferences, security.
- Integrations and Billing: build the UI. Wire up SSO, API keys, webhooks and payments only after the decisions in section 13.

---

## 12. QA approach

- **Visual:** Playwright opens each route with seeded data at 1440 × 900 and 390 × 844. Compare against the export's views by side-by-side review on each PR, not pixel-diff gating, because real data differs from sample data. Keep a checklist per page covering spacing, type, colours and states.
- **Flows:** Playwright tests for sign-up with verification (Clerk testing tokens), sign-in, booking, exam take and submit, and question approve.
- **Accessibility:** run `@axe-core/playwright` on every route. Every action must work from the keyboard.
- **Security:** keep the Phase 3 cross-tenant tests in CI.

---

## 13. Decisions needed

1. **Who uses the admin console?** The design treats it as the institute admin's console, not a platform console. This plan assumes that, which is why Phase 3 scoping is required. Confirm, and say whether super admins need a separate platform console. The design doesn't include one.
2. **Google sign-in:** the design shows email and password only. Add Google?
3. **Pricing and payments:** Pro price and payment provider (for example Razorpay) for the Pro upgrade and institute billing.
4. **Streak, XP and daily goal:** these exist in PrepAI but not in the design. Drop them, or add a small tile?
5. **Academic onboarding:** keep the 10th, 12th and graduation wizard after sign-up, or make it optional from Profile?
6. **Hindi:** the landing page promises "English and Hindi". In scope now, or later?
7. **Custom domains** such as `exams.brightpath.example` from the Branding page: now, or later?
8. **Exam palette states:** the design uses 3 states (answered, marked, not answered). Real SSC exams also have "not visited" and "answered and marked". Keep the design's 3, or add those 2?
