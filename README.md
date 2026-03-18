# TRC Ministries — Church Management System

> **The Revelation Church · East Legon, Accra, Ghana**
> Full-stack church management web application — member records, service attendance, check-in kiosk, birthday WhatsApp automation, broadcasting, and a public-facing website.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Environment Variables](#4-environment-variables)
5. [Local Development](#5-local-development)
6. [Deployment (Vercel)](#6-deployment-vercel)
7. [Authentication & Roles](#7-authentication--roles)
8. [Firestore Data Model](#8-firestore-data-model)
9. [Firestore Security Rules](#9-firestore-security-rules)
10. [Route Map](#10-route-map)
11. [Admin Panel — Screen Reference](#11-admin-panel--screen-reference)
12. [Services Layer](#12-services-layer)
13. [CSS Design System](#13-css-design-system)
14. [Third-Party API Setup](#14-third-party-api-setup)
15. [Known Issues & Future Improvements](#15-known-issues--future-improvements)
16. [Debugging Guide](#16-debugging-guide)

---

## 1. Project Overview

TRC Ministries CMS is a single-page React application deployed on Vercel. There is **no separate backend server** — all persistence is Firebase Firestore and all authentication is Firebase Auth.

The system has two layers:

| Layer | URL prefix | Auth required |
|---|---|---|
| Public website | `/` | No |
| Admin panel | `/admin/*` | Yes (except kiosk) |

The **check-in kiosk** (`/admin/kiosk`) is deliberately unauthenticated — it runs on a tablet at the church entrance and can only search members by phone and write attendance records. No admin data is exposed.

---

## 2. Tech Stack

| Concern | Technology |
|---|---|
| Frontend | React 19 (Vite) |
| Routing | React Router v7 |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (email/password) |
| Hosting | Vercel — auto-deploy from `main` branch |
| Email blast | EmailJS (free: 200/month) |
| SMS blast | Arkesel API (Ghana) |
| WhatsApp automation | Meta WhatsApp Business Cloud API v19.0 |
| Charts | Canvas 2D API (custom — no library) |
| Forms | react-hook-form |

---

## 3. Repository Structure

```
trc-ministries/
├── public/                     Static assets (logos, favicons, PWA manifest)
├── src/
│   ├── admin/                  All admin panel screens
│   │   ├── AdminLayout/        Sidebar + shell shared by all admin screens
│   │   ├── Attendance/         Service attendance, trend chart, streak alerts
│   │   ├── Birthdays/          Birthday list + WhatsApp automation
│   │   ├── Broadcast/          Email & SMS mass send
│   │   ├── CheckIn/            Service management + live check-in log
│   │   ├── CheckInKiosk/       Public kiosk screen (no auth)
│   │   ├── Dashboard/          First admin screen — today's summary
│   │   ├── Login/              Admin login form
│   │   ├── MemberProfile/      Individual member view
│   │   ├── Members/            Full member directory + CSV export
│   │   ├── Messages/           Contact form inbox
│   │   ├── StaffManagement/    Add/remove admin staff (Super Admin only)
│   │   ├── AdminEvents/        Event CRUD
│   │   ├── AdminGroups/        Ministry group CRUD
│   │   ├── AdminPastors/       Pastor profile CRUD
│   │   ├── AdminSermons/       Sermon CRUD
│   │   └── shared-admin.css    Shared admin utility classes
│   ├── components/
│   │   ├── Navbar/             Public site navigation
│   │   ├── Footer/             Public site footer
│   │   └── ProtectedRoute/     Auth guard for admin routes
│   ├── context/
│   │   └── AuthContext.jsx     Firebase Auth state + role resolution
│   ├── hooks/
│   │   └── useMembers.js       Custom hook for member data
│   ├── pages/                  Public website pages (Home, About, Sermons…)
│   ├── services/
│   │   ├── firebase.js             Firebase initialisation
│   │   ├── memberService.js        Member CRUD operations
│   │   ├── attendanceService.js    Service & attendance operations
│   │   ├── birthdayWhatsAppService.js  WhatsApp birthday automation
│   │   ├── absenceStreakService.js     Consecutive absence calculator
│   │   ├── eventService.js
│   │   ├── sermonService.js
│   │   ├── groupService.js
│   │   └── pastorService.js
│   ├── styles/
│   │   ├── variables.css       All CSS custom properties
│   │   ├── reset.css           Box-sizing, base element resets
│   │   └── typography.css      Utility type classes
│   ├── App.jsx                 Route definitions
│   └── main.jsx                React entry point
├── firestore.rules             Security rules — deploy with Firebase CLI
├── vercel.json                 SPA rewrite rule (all paths → /index.html)
└── vite.config.js
```

---

## 4. Environment Variables

Create `.env.local` in the project root. **Never commit this file.**

```env
# ── Firebase (required) ──────────────────────────────────────────
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# ── Email blast — EmailJS (optional) ────────────────────────────
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

# ── SMS blast — Arkesel Ghana (optional) ────────────────────────
VITE_ARKESEL_API_KEY=

# ── WhatsApp birthday automation — Meta (optional) ───────────────
VITE_WHATSAPP_TOKEN=          # Permanent system user token
VITE_WHATSAPP_PHONE_ID=       # Phone Number ID from Meta dashboard
```

> **Note:** All `VITE_` variables are bundled into the client. Never put server-only secrets here. Firestore security rules are your actual data protection layer.

On Vercel, add the same variables in **Project Settings → Environment Variables**.

---

## 5. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your Firebase config (see Section 4)

# 3. Start dev server
npm run dev
# → http://localhost:5173

# 4. Deploy Firestore security rules
firebase deploy --only firestore:rules
```

> **First admin account:** Create the user in Firebase Console → Authentication → Add User, note their UID, then manually create a document in Firestore at `users/{uid}` with the fields shown in [Section 7](#7-authentication--roles).

---

## 6. Deployment (Vercel)

1. Push to the `main` branch — Vercel auto-deploys
2. Ensure all environment variables are set in the Vercel dashboard before the first deploy
3. `vercel.json` contains the SPA rewrite rule — do not remove it or direct-URL navigation will 404

| Setting | Value |
|---|---|
| Build command | `vite build` |
| Output directory | `dist` |
| Framework preset | Vite |

---

## 7. Authentication & Roles

Firebase Auth handles login. On successful login, `AuthContext` fetches `users/{uid}` from Firestore to determine the role. Two roles exist:

| Role | Access |
|---|---|
| `superAdmin` | All screens including Staff Management. Can add/remove other staff. |
| `staffAdmin` | All screens except Staff Management. |

### Creating a new admin account

1. Firebase Console → Authentication → Users → **Add User**
2. Note the UID Firebase assigns
3. In Firestore, create `users/{uid}` with:

```json
{
  "uid": "firebase-uid-here",
  "email": "admin@trc.org",
  "displayName": "Pastor Ama",
  "role": "staffAdmin"
}
```

4. The new admin can now log in at `/admin/login`

### ProtectedRoute logic

Every admin route except `/admin/kiosk` is wrapped in `<ProtectedRoute>`:

- Not authenticated → redirect to `/admin/login`
- Authenticated but no role document → redirect to `/admin/login`
- `staffAdmin` visiting Staff Management → redirect to `/admin/dashboard`
- `superAdmin` → full access

### Kiosk (/admin/kiosk)

Intentionally unauthenticated. Firestore rules allow it to read `members` and create `attendance` records only. No admin data is reachable from this screen.

---

## 8. Firestore Data Model

All collections are at the root level. No sub-collections. Relationships use ID references on documents.

### `members`
Public read · Admin write

| Field | Type | Description |
|---|---|---|
| `firstName` | string | |
| `lastName` | string | |
| `phone` | string | Used as kiosk check-in identifier |
| `email` | string | Optional |
| `dob` | string | ISO date `YYYY-MM-DD` — used for birthday automation |
| `gender` | string | `"Male"` or `"Female"` |
| `address` | string | Optional |
| `group` | string | Ministry group name |
| `howFound` | string | How they found the church |
| `isActive` | boolean | `false` = archived. Excluded from attendance counts. |
| `joinDate` | string | ISO date `YYYY-MM-DD` |
| `createdAt` | timestamp | Firestore server timestamp |
| `updatedAt` | timestamp | Set on every `updateMember()` call |

---

### `services`
Public read · Admin write

| Field | Type | Description |
|---|---|---|
| `name` | string | e.g. `"Sunday Service — First Service"` |
| `date` | string | ISO date `YYYY-MM-DD` |
| `ended` | boolean | `false` = live. `true` = closed, no more check-ins. |
| `createdAt` | timestamp | Used to sort descending |
| `endedAt` | timestamp | Set when admin clicks End Service |

---

### `attendance`
Public create · Admin read/update/delete

| Field | Type | Description |
|---|---|---|
| `serviceId` | string | Reference to `services` document |
| `memberId` | string | Reference to `members` document |
| `checkedInBy` | string | Admin UID, or `null` for kiosk check-ins |
| `checkedInAt` | timestamp | Server timestamp |

> Duplicate check: `checkInMember()` queries `serviceId + memberId` before inserting. Returns `{ success: false, reason: 'already_checked_in' }` if a record exists.

---

### `follow-ups`
Admin only

| Field | Type | Description |
|---|---|---|
| `memberId` | string | Reference to `members` document |
| `serviceId` | string | Which service the member missed |
| `note` | string | Optional note from the pastor |
| `followedUpBy` | string | Admin UID |
| `followedUpAt` | timestamp | |

---

### `birthday_logs`
Admin only · Written by WhatsApp scheduler

| Field | Type | Description |
|---|---|---|
| `memberId` | string | Reference to `members` document |
| `memberName` | string | Denormalised full name |
| `phone` | string | Number the message was sent to |
| `year` | string | Calendar year e.g. `"2025"` |
| `sentAt` | timestamp | |

> This collection prevents duplicate birthday messages. Before sending, the scheduler checks for an existing document matching `memberId + year`.

---

### Other collections

| Collection | Access | Purpose |
|---|---|---|
| `sermons` | Public read, admin write | Sermon records with YouTube links |
| `events` | Public read, admin write | Church events |
| `messages` | Public create, admin read/delete | Contact form submissions |
| `users` | Admin only | Admin role documents keyed by Firebase UID |
| `groups` | Public read, admin write | Ministry group definitions |
| `pastors` | Public read, admin write | Pastor profiles for public website |

---

## 9. Firestore Security Rules

Rules file: `firestore.rules` — deploy with:

```bash
firebase deploy --only firestore:rules
```

`isAdmin()` checks `request.auth != null`. Role enforcement (staffAdmin vs superAdmin) is handled in the frontend via `ProtectedRoute`, not in Firestore rules.

> ⚠️ **Missing rule:** `birthday_logs` is not yet defined in `firestore.rules`. Add this block:
> ```
> match /birthday_logs/{id} {
>   allow read, write: if isAdmin();
> }
> ```

---

## 10. Route Map

### Public routes

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/pastors` | Pastors |
| `/groups` | Groups |
| `/sermons` | Sermons |
| `/events` | Events |
| `/give` | Giving information |
| `/register` | Public member registration form |
| `/contact` | Contact form |

### Admin routes

| Route | Component | Auth |
|---|---|---|
| `/admin/login` | Login | None |
| `/admin/kiosk` | CheckInKiosk | **None** (public) |
| `/admin/dashboard` | Dashboard | staffAdmin+ |
| `/admin/members` | Members | staffAdmin+ |
| `/admin/members/:id` | MemberProfile | staffAdmin+ |
| `/admin/attendance` | Attendance | staffAdmin+ |
| `/admin/checkin` | CheckIn | staffAdmin+ |
| `/admin/sermons` | AdminSermons | staffAdmin+ |
| `/admin/events` | AdminEvents | staffAdmin+ |
| `/admin/birthdays` | Birthdays | staffAdmin+ |
| `/admin/messages` | Messages | staffAdmin+ |
| `/admin/broadcast` | Broadcast | staffAdmin+ |
| `/admin/pastors` | AdminPastors | staffAdmin+ |
| `/admin/groups-admin` | AdminGroups | staffAdmin+ |
| `/admin/staff` | StaffManagement | **superAdmin only** |

---

## 11. Admin Panel — Screen Reference

### Dashboard (`/admin/dashboard`)

First screen on login. Shows **today-only** data — if no service exists for today, stats show `—` and the absent list shows "No service opened today yet." to prevent stale data from previous services bleeding through.

- **Stat cards:** Total members · Today's check-ins (deduplicated across all today's services) · Absent count
- **Service tag:** Shows service name if 1 today, "X services today" + combined unique attendee count if multiple
- **Absent list:** Top 5 members not checked in to any of today's services
- **Birthdays this week:** Members whose birthday falls within the next 7 days
- **Midnight birthday scheduler:** Runs `runBirthdayScheduler()` on mount, then sets a `setTimeout` for 00:00:05 every subsequent night. Requires the Dashboard tab to stay open overnight.

---

### Members (`/admin/members`)

Full member directory. Search by name or phone. Filter by ministry group. Export to CSV.

- `getAllMembers()` fetches all members ordered by `createdAt` descending
- CSV export uses a `Blob` download — no server required
- Inactive members (`isActive: false`) are shown with an Inactive badge and excluded from attendance counts

---

### Member Profile (`/admin/members/:id`)

Individual member view. Shows all stored fields. **Archive member** sets `isActive: false` — members are never deleted from Firestore.

> The attendance history section is a placeholder. `getAttendanceForMember(id)` is implemented in the service layer but the UI only shows hint text. Wire it up by calling the function and rendering the results.

---

### Check-in (`/admin/checkin`)

Admin control centre for service management.

- **Open new service** — creates a Firestore `services` document with `ended: false`
- **End service** — confirmation modal shows final check-in count, then sets `ended: true`
- **Active service card** — live stats, link to kiosk screen
- **Recent services list** — scrollable (max 260px), shows all services with Ended pills
- The kiosk uses the most recently created service (`services[0]` sorted by `createdAt` desc)

> ⚠️ If a new service is created before the previous one is ended, the kiosk silently switches to the new one. Always end a service before opening the next.

---

### Kiosk (`/admin/kiosk`)

Public full-screen check-in screen. No login required. Designed for a tablet at the church entrance.

- **Member lookup:** type 3+ digits of phone number → live results
- **Guest detection:** if no member found after 3+ digits, a "Register as new member" card appears
- **Guest registration:** collects first name, last name, phone, gender, group. Checks for duplicate phone. On submit: saves to Firestore as a real member and immediately checks them in.
- Feedback banners (success / duplicate / no-service) auto-dismiss after 3.5 seconds
- Input auto-focuses on mount and after every check-in

---

### Attendance (`/admin/attendance`)

Service-by-service attendance with trend analysis and absence alerts.

- **Trend chart:** Canvas 2D bar chart showing check-in counts for the last 8 ended services. No external library. The currently selected service bar is dark teal, past services are light teal.
- **Absence streak panel:** Members who missed 2+ consecutive ended services. Sorted worst-first. Colour-coded badges: orange (2 missed) → rose (3–4) → solid red (5+). Only `ended: true` services count.
- **Date search:** filters the services panel by date string or service name
- **Service groups:** services grouped by date, each as a togglable pill. Panel has `max-height: 220px` with scroll so it never buries the attendance data below.
- **Follow-up tracking:** absent members can be marked as followed up with an optional note, stored in `follow-ups` collection.

---

### Birthdays (`/admin/birthdays`)

Birthday management with WhatsApp automation.

- **Tabs:** This week · This month · All birthdays
- **Auto-scheduler:** on mount, calls `runBirthdayScheduler()` which checks `birthday_logs` for duplicates, then sends WhatsApp messages for any member whose birthday is today and who hasn't received one this calendar year
- **Manual send:** each birthday card has a "Send WhatsApp" button for one-off sends
- **Config banner:** if `VITE_WHATSAPP_TOKEN` or `VITE_WHATSAPP_PHONE_ID` is missing, a banner shows what to add
- **Scheduler log:** after auto-run, a green/red summary shows sent / skipped / failed counts

---

### Broadcast (`/admin/broadcast`)

Mass communication to all active members.

- **Email blast** via EmailJS — requires `VITE_EMAILJS_*` vars
- **SMS broadcast** via Arkesel — requires `VITE_ARKESEL_API_KEY`
- Sends individually to each member (not BCC) so personalisation works
- Preview toggle before sending

> EmailJS free tier: 200 emails/month. Upgrade at emailjs.com or switch to SendGrid/AWS SES for larger congregations.

---

### Messages (`/admin/messages`)

Inbox for contact form submissions from the public website. Unread count in the topbar. Clicking a message marks it read. Messages can be deleted.

---

### Staff Management (`/admin/staff`) — Super Admin only

Add and remove admin accounts. Staff are added by their Firebase UID (which must first be created in Firebase Console → Authentication). Removing a staff member deletes their `users/{uid}` document — they can still authenticate but are redirected to login since they have no role.

---

## 12. Services Layer

All Firestore and external API calls are in `src/services/`. Components never import from `firebase` directly.

### `memberService.js`

| Function | Description |
|---|---|
| `getAllMembers()` | All members ordered by `createdAt` desc |
| `getMemberById(id)` | Single member by Firestore document ID |
| `getMemberByPhone(phone)` | Exact phone match — used for duplicate check on registration |
| `updateMember(id, data)` | Partial update with `updatedAt` server timestamp |
| `archiveMember(id)` | Sets `isActive: false` — soft delete only |

---

### `attendanceService.js`

| Function | Description |
|---|---|
| `createService(name, date)` | Creates service document with `ended: false` |
| `endService(serviceId)` | Sets `ended: true` and `endedAt` timestamp |
| `getAllServices()` | All services ordered by `createdAt` desc |
| `checkInMember(serviceId, memberId, by)` | Idempotent — checks for existing record first. Returns `{success, reason}` |
| `getAttendanceForService(serviceId)` | All attendance records for one service |
| `getAttendanceForMember(memberId)` | All services a member attended, ordered by date desc |
| `markFollowUp(memberId, serviceId, note, by)` | Creates a `follow-ups` document |
| `getFollowUpsForService(serviceId)` | All follow-up records for a service |

---

### `birthdayWhatsAppService.js`

Manages automatic birthday WhatsApp messages via Meta Business Cloud API v19.0.

| Function | Description |
|---|---|
| `toE164(phone)` | Converts Ghanaian phone formats to `+233...` E.164 |
| `sendBirthdayWhatsApp(member)` | Sends one WhatsApp message and writes to `birthday_logs` |
| `runBirthdayScheduler(members)` | Filters today's birthdays, skips already-sent, sends remaining. Returns `{sent, skipped, errors[]}` |
| `startMidnightScheduler(getFn)` | Schedules `runBirthdayScheduler` at 00:00:05 nightly. Returns cleanup function. |

> To customise the birthday message, edit the `text.body` string inside `sendBirthdayWhatsApp()`.

---

### `absenceStreakService.js`

Pure function — no Firestore calls. Takes pre-fetched data.

```js
computeAbsenceStreaks(members, services, attendanceMap, minStreak = 2)
```

- `attendanceMap` — `{ [serviceId]: Set<memberId> }` — built in `Attendance.jsx` on mount
- `services` — sorted descending by `createdAt` (already the case from `getAllServices()`)
- Only `ended: true` services are counted — live services are excluded
- Returns `[{ member, streak }]` sorted by streak descending

---

## 13. CSS Design System

All tokens are defined in `src/styles/variables.css`. Every component uses these — never hardcode colours or spacing. Components use BEM-style prefixes (e.g. `.attendance__topbar`, `.checkin__btn-end`).

### Colour tokens

| Token | Usage |
|---|---|
| `--color-brand` / `--color-brand-light` | Primary brand purple — headings, active states |
| `--color-teal` / `--color-teal-light` | Success · check-in · positive states |
| `--color-rose` / `--color-rose-light` | Absent · error · destructive actions |
| `--color-gold` / `--color-gold-pale` | Turnout percentage · birthday highlights |
| `--color-text-1/2/3` | Primary / secondary / tertiary text |
| `--color-border` | Default border |
| `--color-surface` | Row/card hover backgrounds |

### Other tokens

| Token | Notes |
|---|---|
| `--space-1` through `--space-16` | Spacing scale (4px base) |
| `--text-xs/sm/base/md/lg/xl/2xl/3xl` | Type scale |
| `--font-normal` / `--font-bold` | Font weights |
| `--radius-sm/md/lg/xl/full` | Border radius scale |
| `--transition-fast` | CSS transition shorthand for hover states |

---

## 14. Third-Party API Setup

### WhatsApp Business Cloud API (Meta)

1. Go to **developers.facebook.com** → Create App → choose **Business** type
2. Add the **WhatsApp** product to the app
3. On the WhatsApp Quickstart page, note the **Phone Number ID** — this is `VITE_WHATSAPP_PHONE_ID`
4. **Do not use the temporary token** on that page — it expires in 24 hours

**Getting a permanent token:**

1. Go to **business.facebook.com** → Settings → Users → **System Users**
2. Add a System User → name it (e.g. "TRC Bot") → role: Admin
3. Click **Assign Assets** → select your app (toggle Manage app) → select your WhatsApp account (toggle Manage WhatsApp Business Accounts) → click Assign
4. Click **Generate Token** → select your app → enable `whatsapp_business_messaging` and `whatsapp_business_management`
5. Copy the token immediately — it will not be shown again. This is `VITE_WHATSAPP_TOKEN`

**Adding a real sending number:**

1. On WhatsApp → API Setup, click **Add phone number**
2. Use a number not already registered on WhatsApp
3. Verify via SMS or call
4. Copy the new Phone Number ID and update `VITE_WHATSAPP_PHONE_ID`

> ⚠️ Until Meta verifies your business, you can only message numbers manually added to your test recipient list. Business verification is done at **Business Settings → Security Centre → Start Verification** — takes 2–5 business days and requires your church registration documents.

---

### EmailJS (Email Broadcast)

1. Create account at **emailjs.com**
2. Add an email service (Gmail, Outlook, or custom SMTP)
3. Create a template using these variables: `{{to_name}}`, `{{to_email}}`, `{{subject}}`, `{{message}}`, `{{from_name}}`
4. Copy **Service ID**, **Template ID**, and **Public Key** to `.env.local`

---

### Arkesel (SMS Broadcast)

1. Create account at **arkesel.com**
2. Top up with credit
3. Copy API key from the dashboard to `.env.local` as `VITE_ARKESEL_API_KEY`

---

## 15. Known Issues & Future Improvements

### Current limitations

- **Birthday scheduler is client-side only.** It requires the Dashboard browser tab to be open at midnight. If no admin is online at midnight, the scheduler runs the next time anyone opens the dashboard (the on-mount call catches it). The `birthday_logs` deduplication prevents double-sends.
- **Kiosk uses `services[0]`** (most recently created) as the active service. If a service is not ended before the next one is created, the kiosk silently switches.
- **`getAllMembers()` fetches the entire collection** on every admin page load. For congregations over ~2,000 members, add Firestore pagination.
- **Attendance streak calculation** fetches attendance for the last 10 ended services in parallel on mount. This is 10 Firestore reads — acceptable now, but consider caching for slow connections.
- **Member profile attendance history** is a placeholder. `getAttendanceForMember()` exists in the service layer but the UI only shows hint text.
- **`birthday_logs` Firestore rule is missing** from `firestore.rules` — add it (see Section 9).

### Recommended next steps

- Add a **Firebase Cloud Function** to run the birthday scheduler server-side at midnight — eliminates the browser-tab dependency
- **Wire up member profile attendance history** using `getAttendanceForMember(id)`
- **Targeted broadcast filters** — send to a specific group, or only to members absent last Sunday
- **Cell group attendance** — extend check-in to mid-week cell groups, each managed by the group leader
- **Giving/tithe log** — track weekly offerings per service with monthly totals on the dashboard
- **Absence streak alerts on Dashboard** — surface the worst streaks on the first admin screen, not just the Attendance page

---

## 16. Debugging Guide

| Symptom | Likely cause & fix |
|---|---|
| Admin redirected to `/admin/login` after logging in | No document at `users/{uid}` in Firestore. Create it with `role: "staffAdmin"`. |
| Kiosk shows "Check-in not open yet" | No service exists or all services have `ended: true`. Open a service in `/admin/checkin`. |
| Kiosk check-in succeeds but Attendance page shows 0 | The admin is viewing a different service. Check which pill is selected in the date groups panel. |
| Dashboard shows stale absent data from a previous day | A service with `ended: false` exists from a previous date. Go to `/admin/checkin` and end it. |
| WhatsApp messages not sending | Check `VITE_WHATSAPP_TOKEN` and `VITE_WHATSAPP_PHONE_ID` in `.env.local`. Token may have expired — use a permanent system user token. Check Meta app Business Verification status. |
| Birthday message sent twice | A `birthday_logs` document already exists for this `memberId + year`. Inspect the collection in Firebase Console. |
| Absence streaks not appearing | `computeAbsenceStreaks()` only counts `ended: true` services. Ensure services have been ended. If no services are ended, no streaks are computed. |
| Broadcast email says "keys not configured" | Add `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` to `.env.local` and restart the dev server. |
| Guest registration fails with "already registered" | `getMemberByPhone()` found an exact match. The guest may have registered under a slightly different number format. Check Firestore `members` collection. |
| Firestore permission denied errors | Rules not deployed. Run: `firebase deploy --only firestore:rules` |
| Vercel routes return 404 on direct URL | The `vercel.json` SPA rewrite rule is missing or broken. It must rewrite all paths to `/index.html`. |
| Stats on Dashboard show real numbers when no service today | The `absentees` array is not guarded by `todaySvcs.length > 0`. Check `Dashboard.jsx` — it should only compute absentees when `todaySvcs.length > 0`. |

---

*TRC Ministries — Internal documentation. Last updated June 2025.*