# Havn HR

A fully working HRMS web app — attendance, leave management, and payroll —
built with React + Vite. Works on desktop and mobile browsers.

**Nothing is hardcoded.** Every number on screen (hours worked, leave balance,
payslip, employee list) is computed live from real actions you take in the
app. Data is stored in your browser (`localStorage`), so it persists between
visits on the same device/browser.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`) — on your
phone's browser too, if you run `npm run dev -- --host` and use your
computer's local network IP instead of `localhost`.

## Demo logins (seeded on first run)

4 companies are seeded, each with 2 HR admins and 20 employees:

- `cashe`
- `bhanix`
- `aeries`
- `karatclub`

| Role     | Username pattern                  | Password pattern   |
|----------|------------------------------------|---------------------|
| HR/Admin | `hr1.<company>` or `hr2.<company>` | `<company>123`      |
| Employee | `emp1.<company>` … `emp20.<company>` | `<company>123`   |

Example: `hr1.cashe` / `cashe123`, or `emp7.bhanix` / `bhanix123`.

Each HR admin only ever sees their own company's employees, attendance, and
leave requests — data is scoped per company (`companyId`) throughout the
app. As HR you can add more real employees from the **Employees** page; they
join the same company automatically.

## What's inside

- **Dashboard** — live "shift ring" showing hours worked today (updates in
  real time while you're punched in), monthly attendance summary, leave
  balance snapshot.
- **Attendance** — punch in / punch out, full history table.
- **Leave** — apply for leave against real balances (Casual / Sick / Earned),
  see status of your own requests.
- **Payslips** — computed live each month from actual present days + approved
  leave vs. working days, with PF and professional tax deductions.
- **Profile** — edit your own contact details.
- **Approvals** *(admin only)* — approve/reject pending leave requests
  company-wide.
- **Employees** *(admin only)* — add new employees with salary, department,
  login credentials.

## Notes on scope

This is a real, functional single-tenant HR app you can run for a small
team. It is **not** connected to actual banking/payroll rails, biometric
attendance hardware, or statutory compliance filing — those require real
backend infrastructure and legal integrations that no chat-generated app can
provide out of the box. If you eventually want a real backend (Postgres +
API) instead of browser storage, the `src/lib/store.js` file is the single
place to swap out — every page already calls through it rather than touching
storage directly.

## Tech

- React 19 + Vite
- react-router-dom for routing
- lucide-react for icons
- Manrope (Google Fonts) throughout
- No CSS framework — hand-written design tokens in `src/index.css`
