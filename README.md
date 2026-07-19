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
  see status of your own requests. Form built with Formik + Yup validation.
- **Payslips** — computed live each month from actual present days + approved
  leave vs. working days, with PF and professional tax deductions.
- **Biometrics** — enroll your device's own fingerprint/Face ID/Windows Hello
  (via the browser's real WebAuthn API) and check in at doors you've been
  granted access to. **Important:** this verifies identity using your
  device's sensor and logs the event — it does **not** unlock a physical
  door. Controlling an actual door lock needs real IoT hardware (a door
  controller), which is outside what any web app can do. Think of this as
  the software half of an access-control system.
- **Profile** — edit your own contact details; shows your Employee ID.
- **Approvals** *(HR only)* — approve/reject pending leave requests for your
  company; click any name to open their full profile.
- **Employees** *(HR only)* — add new employees (Formik + MUI form) with
  auto-assigned Employee IDs (e.g. `CS0007` for Cashe); click any row to open
  their full profile in a centered modal.
- **Access Control** *(HR only)* — grant/revoke Main Door / Inside / Outside
  access per employee, and see a company-wide log of fingerprint check-ins.

## Employee IDs

Every person gets a sequential ID prefixed by their company code:
`CS` (Cashe), `BX` (Bhanix), `AR` (Aeries), `KC` (Karat Club) — e.g. `CS0001`,
`CS0002`... New hires HR adds get the next number automatically.

## Tech

- React 19 + Vite
- react-router-dom for routing
- MUI (Material UI) for dialogs, form fields, switches, alerts
- Formik + Yup for form state and validation
- lucide-react for icons
- Manrope (Google Fonts) throughout
- WebAuthn (`navigator.credentials`) for real device fingerprint verification
- No CSS framework beyond MUI — hand-written design tokens in `src/index.css`

## Mobile

Built mobile-first: bottom tab bar on phones, full sidebar on desktop, safe-area
padding for notched phones, 16px form inputs (prevents iOS/Chrome auto-zoom on
focus), and `100dvh` sizing so the layout doesn't jump when the mobile address
bar collapses. Tested against Chrome's responsive device mode; use your
computer's local network IP (`npm run dev -- --host`) to test on an actual
phone during development.

## Notes on scope

This is a real, functional multi-company HR app. It is **not** connected to
actual banking/payroll rails, physical door-lock hardware, or statutory
compliance filing — those require real backend infrastructure, IoT hardware,
and legal integrations that no chat-generated app can provide out of the box.
If you eventually want a real backend (Postgres + API) instead of browser
storage, the `src/lib/store.js` file is the single place to swap out — every
page already calls through it rather than touching storage directly.

**If the app behaves oddly after an update** (e.g. missing Employee IDs),
open your browser DevTools Console on the site and run `localStorage.clear()`,
then refresh — this reseeds fresh demo data matching the latest schema.
