// Local data layer. Every read/write goes through localStorage so nothing
// shown in the UI is hardcoded — it's always derived from stored records.

const KEYS = {
  users: "hrms_users",
  attendance: "hrms_attendance",
  leaveTypes: "hrms_leave_types",
  leaveRequests: "hrms_leave_requests",
  notifications: "hrms_notifications",
  session: "hrms_session",
  seeded: "hrms_seeded_v1",
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

// ---------- Seed (bootstrap only — first run needs at least one login) ----------
export function seedIfEmpty() {
  if (read(KEYS.seeded, false)) return;

  const adminId = uid();
  const empId = uid();

  const users = [
    {
      id: adminId,
      name: "Anita Rao",
      username: "admin",
      password: "admin123",
      role: "admin",
      email: "anita.rao@company.com",
      phone: "+91 90000 00001",
      department: "Human Resources",
      designation: "HR Manager",
      baseSalary: 95000,
      joinDate: "2022-03-01",
      color: "#0F6E5C",
    },
    {
      id: empId,
      name: "Rahul Mehta",
      username: "rahul",
      password: "rahul123",
      role: "employee",
      email: "rahul.mehta@company.com",
      phone: "+91 90000 00002",
      department: "Engineering",
      designation: "Software Engineer",
      baseSalary: 72000,
      joinDate: "2023-07-15",
      color: "#C77D24",
    },
  ];

  const leaveTypes = [
    { id: uid(), name: "Casual Leave", code: "CL", annualQuota: 12 },
    { id: uid(), name: "Sick Leave", code: "SL", annualQuota: 8 },
    { id: uid(), name: "Earned Leave", code: "EL", annualQuota: 15 },
  ];

  write(KEYS.users, users);
  write(KEYS.attendance, []);
  write(KEYS.leaveTypes, leaveTypes);
  write(KEYS.leaveRequests, []);
  write(KEYS.notifications, []);
  write(KEYS.seeded, true);
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
export function getUsers() {
  return read(KEYS.users, []);
}

export function getUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

export function updateUser(id, patch) {
  const users = getUsers().map((u) => (u.id === id ? { ...u, ...patch } : u));
  write(KEYS.users, users);
  const session = read(KEYS.session, null);
  return users.find((u) => u.id === id);
}

export function addEmployee(data) {
  const users = getUsers();
  if (users.some((u) => u.username.toLowerCase() === data.username.toLowerCase())) {
    return { ok: false, error: "Username already exists" };
  }
  const palette = ["#0F6E5C", "#C77D24", "#2A4C8F", "#8A3A64", "#3B7D7D", "#8B5E24"];
  const newUser = {
    id: uid(),
    role: "employee",
    color: palette[users.length % palette.length],
    joinDate: todayISO(),
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
