// Local data layer. Every read/write goes through localStorage so nothing
// shown in the UI is hardcoded — it's always derived from stored records.

const KEYS = {
  companies: "hrms_companies",
  users: "hrms_users",
  attendance: "hrms_attendance",
  leaveTypes: "hrms_leave_types",
  leaveRequests: "hrms_leave_requests",
  notifications: "hrms_notifications",
  accessLogs: "hrms_access_logs",
  session: "hrms_session",
  seeded: "hrms_seeded_v3",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- Seed (bootstrap only — first run needs logins to exist) ----------
const COMPANIES = [
  { id: "cashe", name: "Cashe", code: "CS" },
  { id: "bhanix", name: "Bhanix", code: "BX" },
  { id: "aeries", name: "Aeries", code: "AR" },
  { id: "karatclub", name: "Karat Club", code: "KC" },
];

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Finance", "Operations", "Customer Support"];
const DESIGNATIONS = ["Associate", "Senior Associate", "Team Lead", "Analyst", "Executive"];
const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Kabir",
  "Ananya", "Diya", "Priya", "Ira", "Myra", "Anika", "Kavya", "Riya", "Sara", "Tara",
  "Rohan", "Karan", "Nikhil", "Varun", "Aman", "Dev", "Yash", "Rahul", "Arnav", "Siddharth",
  "Meera", "Neha", "Pooja", "Divya", "Shreya", "Kritika", "Aisha", "Naina", "Simran", "Tanvi",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Mehta", "Rao", "Iyer", "Nair", "Reddy", "Kapoor", "Malhotra",
  "Chopra", "Bhatt", "Desai", "Joshi", "Kulkarni", "Menon", "Pillai", "Shetty", "Singh", "Agarwal",
];
const PALETTE = ["#0F6E5C", "#C77D24", "#2A4C8F", "#8A3A64", "#3B7D7D", "#8B5E24"];

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildCompanyUsers(companyId) {
  const users = [];
  const code = COMPANIES.find((c) => c.id === companyId)?.code || companyId.slice(0, 2).toUpperCase();
  let seq = 1;
  const nextEmployeeId = () => `${code}${String(seq++).padStart(4, "0")}`;

  // 2 HR admins per company
  const hrNames = [
    [pick(FIRST_NAMES, 10), pick(LAST_NAMES, 3)],
    [pick(FIRST_NAMES, 20), pick(LAST_NAMES, 7)],
  ];
  hrNames.forEach(([first, last], i) => {
    users.push({
      id: uid(),
      employeeId: nextEmployeeId(),
      companyId,
      name: `${first} ${last}`,
      username: `hr${i + 1}.${companyId}`,
      password: `${companyId}123`,
      role: "admin",
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${companyId}.com`,
      phone: `+91 9${companyId.length}${i}00 0000${i}`,
      department: "Human Resources",
      designation: i === 0 ? "HR Manager" : "HR Executive",
      baseSalary: 85000 + i * 10000,
      joinDate: "2021-06-01",
      color: PALETTE[i % PALETTE.length],
      doorAccess: { mainDoor: true, inside: true, outside: true },
    });
  });

  // 20 employees per company
  for (let i = 0; i < 20; i++) {
    const first = pick(FIRST_NAMES, i + companyId.length);
    const last = pick(LAST_NAMES, i * 3 + companyId.length);
    const department = pick(DEPARTMENTS, i);
    const designation = pick(DESIGNATIONS, i);
    users.push({
      id: uid(),
      employeeId: nextEmployeeId(),
      companyId,
      name: `${first} ${last}`,
      username: `emp${i + 1}.${companyId}`,
      password: `${companyId}123`,
      role: "employee",
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@${companyId}.com`,
      phone: `+91 98${i.toString().padStart(3, "0")}0 000${i}`,
      department,
      designation,
      baseSalary: 32000 + (i % 6) * 8000,
      joinDate: `202${2 + (i % 3)}-0${1 + (i % 9 > 8 ? 9 : (i % 9) + 1)}-1${i % 9}`,
      color: pick(PALETTE, i),
      doorAccess: {
        mainDoor: true,
        inside: department === "Engineering" || department === "Operations",
        outside: department === "Sales" || department === "Marketing" || department === "Operations",
      },
    });
  }

  return users;
}

export function seedIfEmpty() {
  if (read(KEYS.seeded, false)) return;

  const users = COMPANIES.flatMap((c) => buildCompanyUsers(c.id));

  const leaveTypes = [
    { id: uid(), name: "Casual Leave", code: "CL", annualQuota: 12 },
    { id: uid(), name: "Sick Leave", code: "SL", annualQuota: 8 },
    { id: uid(), name: "Earned Leave", code: "EL", annualQuota: 15 },
  ];

  write(KEYS.companies, COMPANIES);
  write(KEYS.users, users);
  write(KEYS.attendance, []);
  write(KEYS.leaveTypes, leaveTypes);
  write(KEYS.leaveRequests, []);
  write(KEYS.notifications, []);
  write(KEYS.seeded, true);
}

// ---------- Companies ----------
export function getCompanies() {
  return read(KEYS.companies, COMPANIES);
}

export function getCompanyById(id) {
  return getCompanies().find((c) => c.id === id) || null;
}

// ---------- Session ----------
export function login(username, password) {
  const users = read(KEYS.users, []);
  const user = users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: "Invalid username or password" };
  write(KEYS.session, user.id);
  return { ok: true, user };
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

export function getCurrentUser() {
  const id = read(KEYS.session, null);
  if (!id) return null;
  const users = read(KEYS.users, []);
  return users.find((u) => u.id === id) || null;
}

// ---------- Users ----------
export function getUsers(companyId) {
  const users = read(KEYS.users, []);
  return companyId ? users.filter((u) => u.companyId === companyId) : users;
}

export function getUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

export function updateUser(id, patch) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  write(KEYS.users, users);
  return users.find((u) => u.id === id);
}

export function getNextEmployeeId(companyId) {
  const code = getCompanyById(companyId)?.code || companyId.slice(0, 2).toUpperCase();
  const existing = getUsers(companyId)
    .map((u) => u.employeeId)
    .filter((id) => id && id.startsWith(code))
    .map((id) => parseInt(id.slice(code.length), 10))
    .filter((n) => !isNaN(n));
  const next = (existing.length ? Math.max(...existing) : 0) + 1;
  return `${code}${String(next).padStart(4, "0")}`;
}

export function addEmployee(data) {
  const users = getUsers();
  if (!data.companyId) {
    return { ok: false, error: "Missing company" };
  }
  if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { ok: false, error: "Username already exists" };
  }
  const palette = ["#0F6E5C", "#C77D24", "#2A4C8F", "#8A3A64", "#3B7D7D", "#8B5E24"];
  const newUser = {
    id: uid(),
    employeeId: getNextEmployeeId(data.companyId),
    role: "employee",
    color: palette[users.length % palette.length],
    joinDate: todayISO(),
    doorAccess: { mainDoor: true, inside: false, outside: false },
    ...data,
  };
  users.push(newUser);
  write(KEYS.users, users);
  return { ok: true, user: newUser };
}

// ---------- Attendance ----------
export function getAttendance() {
  return read(KEYS.attendance, []);
}

export function getUserAttendance(userId) {
  return getAttendance()
    .filter((a) => a.userId === userId)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getTodayRecord(userId) {
  const date = todayISO();
  return getAttendance().find((a) => a.userId === userId && a.date === date) || null;
}

export function punchIn(userId) {
  const date = todayISO();
  const records = getAttendance();
  if (records.some((a) => a.userId === userId && a.date === date)) {
    return { ok: false, error: "Already punched in today" };
  }
  const record = {
    id: uid(),
    userId,
    date,
    punchIn: new Date().toISOString(),
    punchOut: null,
    totalHours: null,
  };
  records.push(record);
  write(KEYS.attendance, records);
  addNotification(userId, `Punched in at ${new Date(record.punchIn).toLocaleTimeString()}`, "attendance");
  return { ok: true, record };
}

export function punchOut(userId) {
  const date = todayISO();
  const records = getAttendance();
  const idx = records.findIndex((a) => a.userId === userId && a.date === date);
  if (idx === -1 || records[idx].punchOut) {
    return { ok: false, error: "No active punch-in found" };
  }
  const punchOutTime = new Date().toISOString();
  const hours = (new Date(punchOutTime) - new Date(records[idx].punchIn)) / 3600000;
  records[idx].punchOut = punchOutTime;
  records[idx].totalHours = Math.round(hours * 100) / 100;
  write(KEYS.attendance, records);
  addNotification(
    userId,
    `Punched out — ${records[idx].totalHours}h logged today`,
    "attendance"
  );
  return { ok: true, record: records[idx] };
}

export function getMonthlyAttendance(userId, year, month) {
  // month is 0-indexed
  return getUserAttendance(userId).filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// ---------- Leave ----------
export function getLeaveTypes() {
  return read(KEYS.leaveTypes, []);
}

export function getLeaveRequests() {
  return read(KEYS.leaveRequests, []).sort((a, b) =>
    a.appliedOn < b.appliedOn ? 1 : -1
  );
}

export function getUserLeaveRequests(userId) {
  return getLeaveRequests().filter((l) => l.userId === userId);
}

export function getPendingLeaveRequests() {
  return getLeaveRequests().filter((l) => l.status === "pending");
}

export function getCompanyLeaveRequests(companyId) {
  const companyUserIds = new Set(getUsers(companyId).map((u) => u.id));
  return getLeaveRequests().filter((r) => companyUserIds.has(r.userId));
}

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e - s) / 86400000) + 1;
}

export function applyLeave(userId, { leaveTypeId, startDate, endDate, reason }) {
  if (new Date(endDate) < new Date(startDate)) {
    return { ok: false, error: "End date cannot be before start date" };
  }
  const days = daysBetween(startDate, endDate);
  const balance = getLeaveBalance(userId, leaveTypeId);
  if (days > balance.remaining) {
    return { ok: false, error: `Insufficient balance. Only ${balance.remaining} day(s) left for ${balance.name}` };
  }
  const requests = getLeaveRequests();
  const request = {
    id: uid(),
    userId,
    leaveTypeId,
    startDate,
    endDate,
    days,
    reason,
    status: "pending",
    appliedOn: new Date().toISOString(),
    actionedBy: null,
    actionedOn: null,
  };
  requests.push(request);
  write(KEYS.leaveRequests, requests);
  return { ok: true, request };
}

export function actionLeaveRequest(requestId, status, actionedBy) {
  const requests = getLeaveRequests();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) return { ok: false, error: "Request not found" };
  requests[idx].status = status;
  requests[idx].actionedBy = actionedBy;
  requests[idx].actionedOn = new Date().toISOString();
  write(KEYS.leaveRequests, requests);
  const leaveType = getLeaveTypes().find((t) => t.id === requests[idx].leaveTypeId);
  addNotification(
    requests[idx].userId,
    `Your ${leaveType?.name || "leave"} request (${requests[idx].startDate} to ${requests[idx].endDate}) was ${status}`,
    "leave"
  );
  return { ok: true, request: requests[idx] };
}

export function getLeaveBalance(userId, leaveTypeId) {
  const type = getLeaveTypes().find((t) => t.id === leaveTypeId);
  if (!type) return { name: "Unknown", quota: 0, used: 0, remaining: 0 };
  const year = new Date().getFullYear();
  const used = getUserLeaveRequests(userId)
    .filter(
      (r) =>
        r.leaveTypeId === leaveTypeId &&
        r.status === "approved" &&
        new Date(r.startDate).getFullYear() === year
    )
    .reduce((sum, r) => sum + r.days, 0);
  return {
    name: type.name,
    code: type.code,
    quota: type.annualQuota,
    used,
    remaining: Math.max(type.annualQuota - used, 0),
  };
}

export function getAllLeaveBalances(userId) {
  return getLeaveTypes().map((t) => getLeaveBalance(userId, t.id));
}

// ---------- Notifications ----------
export function getNotifications(userId) {
  return read(KEYS.notifications, [])
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addNotification(userId, message, type = "general") {
  const notifications = read(KEYS.notifications, []);
  notifications.push({
    id: uid(),
    userId,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
  write(KEYS.notifications, notifications);
}

export function markAllRead(userId) {
  const notifications = read(KEYS.notifications, []).map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
  write(KEYS.notifications, notifications);
}

// ---------- Payslip (computed live, nothing stored/hardcoded as a slip) ----------
export function computePayslip(userId, year, month) {
  const user = getUserById(userId);
  if (!user) return null;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthRecords = getMonthlyAttendance(userId, year, month);
  const presentDays = monthRecords.filter((r) => r.punchOut).length;

  // Working days = weekdays only (Mon-Fri) in the month
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) workingDays++;
  }

  const approvedLeaveDays = getUserLeaveRequests(userId)
    .filter((r) => {
      const s = new Date(r.startDate);
      return r.status === "approved" && s.getFullYear() === year && s.getMonth() === month;
    })
    .reduce((sum, r) => sum + r.days, 0);

  const paidDays = Math.min(presentDays + approvedLeaveDays, workingDays);
  const perDay = user.baseSalary / workingDays;
  const gross = Math.round(perDay * paidDays);

  const pf = Math.round(gross * 0.12);
  const professionalTax = gross > 15000 ? 200 : 0;
  const totalDeductions = pf + professionalTax;
  const netPay = gross - totalDeductions;

  return {
    user,
    year,
    month,
    workingDays,
    presentDays,
    approvedLeaveDays,
    paidDays,
    baseSalary: user.baseSalary,
    gross,
    deductions: { pf, professionalTax, total: totalDeductions },
    netPay,
  };
}

export { todayISO };

// ---------- Door access & biometric check-ins ----------
// Note: this logs software-verified identity check-ins using the device's
// own fingerprint/biometric sensor (via WebAuthn). It does not control a
// physical door lock — that requires real IoT door-controller hardware,
// which is outside what any web app can do.

export function updateDoorAccess(userId, doorAccess) {
  const users = getUsers().map((u) => (u.id === userId ? { ...u, doorAccess } : u));
  write(KEYS.users, users);
  return users.find((u) => u.id === userId);
}

export function hasWebAuthnSupport() {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export function getUserAccessLogs(userId) {
  return read(KEYS.accessLogs, [])
    .filter((l) => l.userId === userId)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function getCompanyAccessLogs(companyId) {
  const companyUserIds = new Set(getUsers(companyId).map((u) => u.id));
  return read(KEYS.accessLogs, [])
    .filter((l) => companyUserIds.has(l.userId))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function logAccessEvent(userId, door, method = "fingerprint") {
  const logs = read(KEYS.accessLogs, []);
  logs.push({ id: uid(), userId, door, method, at: new Date().toISOString() });
  write(KEYS.accessLogs, logs);
}

// Enroll this device's platform authenticator (Touch ID / Windows Hello /
// Android fingerprint) against the user's account. Returns a base64 credential
// id stored on the user record, so future check-ins can verify against it.
export async function enrollBiometric(userId) {
  const user = getUserById(userId);
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "Havn HR" },
      user: {
        id: new TextEncoder().encode(userId),
        name: user.username,
        displayName: user.name,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
      timeout: 60000,
    },
  });
  const credentialId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
  updateUser(userId, { biometricCredentialId: credentialId });
  return credentialId;
}

export async function verifyBiometric(userId) {
  const user = getUserById(userId);
  if (!user?.biometricCredentialId) {
    return { ok: false, error: "No fingerprint enrolled on this device yet" };
  }
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const rawId = Uint8Array.from(atob(user.biometricCredentialId), (c) => c.charCodeAt(0));
  await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: rawId, type: "public-key" }],
      userVerification: "required",
      timeout: 60000,
    },
  });
  return { ok: true };
}
