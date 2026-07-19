import { X } from "lucide-react";
import { Badge } from "./ui";
import { getCompanyById, getAllLeaveBalances, getMonthlyAttendance } from "../lib/store";

// Slide-over panel showing a full read-only profile for any employee —
// used by HR to inspect a person's details, role, and standing at a glance.
export default function ProfileDrawer({ person, onClose }) {
  if (!person) return null;
  const company = getCompanyById(person.companyId);
  const balances = getAllLeaveBalances(person.id);
  const now = new Date();
  const monthRecords = getMonthlyAttendance(person.id, now.getFullYear(), now.getMonth());
  const presentDays = monthRecords.filter((r) => r.punchOut).length;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(22,36,31,0.45)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          height: "100%",
          background: "var(--surface)",
          overflowY: "auto",
          padding: 28,
          boxShadow: "-12px 0 40px rgba(0,0,0,0.15)",
        }}
      >
        <button
          onClick={onClose}
          style={{ background: "var(--surface-sunk)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 58, height: 58, borderRadius: "50%", background: person.color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, flexShrink: 0,
            }}
          >
            {person.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{person.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{person.designation}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <Badge tone={person.role === "admin" ? "amber" : "teal"}>{person.role === "admin" ? "HR / Admin" : "Employee"}</Badge>
              <Badge tone="neutral">{person.employeeId}</Badge>
            </div>
          </div>
        </div>

        <Section title="Organization">
          <Row label="Employee ID" value={person.employeeId} />
          <Row label="Company" value={company?.name} />
          <Row label="Department" value={person.department} />
          <Row label="Designation" value={person.designation} />
          <Row label="Role" value={person.role === "admin" ? "HR / Admin" : "Employee"} />
          <Row label="Joined" value={new Date(person.joinDate).toLocaleDateString()} />
        </Section>

        <Section title="Contact">
          <Row label="Email" value={person.email} />
          <Row label="Phone" value={person.phone} />
          <Row label="Username" value={person.username} />
        </Section>

        <Section title="Payroll">
          <Row label="Base salary" value={`₹${person.baseSalary.toLocaleString("en-IN")}/mo`} />
        </Section>

        <Section title="This month">
          <Row label="Present days" value={presentDays} />
          {balances.map((b) => (
            <Row key={b.code} label={`${b.name} balance`} value={`${b.remaining} / ${b.quota} days`} />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, gap: 12 }}>
      <span style={{ color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 700, textAlign: "right", wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}
