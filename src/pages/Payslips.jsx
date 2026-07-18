import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Field, inputStyle } from "../components/ui";
import { computePayslip } from "../lib/store";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Payslips() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [slip, setSlip] = useState(null);

  useEffect(() => {
    setSlip(computePayslip(user.id, year, month));
  }, [user.id, year, month]);

  if (!slip) return null;

  const rupee = (n) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div>
      <PageHeader
        eyebrow="Payroll"
        title="Payslip"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <Field>
              <select style={inputStyle} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </Field>
            <Field>
              <select style={inputStyle} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {[now.getFullYear() - 1, now.getFullYear()].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
          </div>
        }
      />

      <Card style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid var(--border)", paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{slip.user.name}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{slip.user.designation} · {slip.user.department}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Pay period</div>
            <div style={{ fontWeight: 800 }}>{MONTHS[slip.month]} {slip.year}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 26 }} className="slip-stats">
          <MiniStat label="Working days" value={slip.workingDays} />
          <MiniStat label="Present days" value={slip.presentDays} />
          <MiniStat label="Approved leave" value={slip.approvedLeaveDays} />
          <MiniStat label="Paid days" value={slip.paidDays} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="slip-cols">
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Earnings
            </div>
            <Row label="Monthly base salary" value={rupee(slip.baseSalary)} />
            <Row label={`Pro-rated (${slip.paidDays}/${slip.workingDays} days)`} value={rupee(slip.gross)} bold />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
              Deductions
            </div>
            <Row label="Provident Fund (12%)" value={rupee(slip.deductions.pf)} />
            <Row label="Professional tax" value={rupee(slip.deductions.professionalTax)} />
            <Row label="Total deductions" value={rupee(slip.deductions.total)} bold />
          </div>
        </div>

        <div style={{ marginTop: 26, paddingTop: 20, borderTop: "2px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Net pay</span>
          <span style={{ fontWeight: 800, fontSize: 26, color: "var(--teal)" }}>{rupee(slip.netPay)}</span>
        </div>
      </Card>

      <style>{`
        @media (max-width: 700px) {
          .slip-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .slip-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ background: "var(--surface-sunk)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
      <div style={{ fontSize: 19, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, fontWeight: bold ? 800 : 500, color: bold ? "var(--ink)" : "var(--ink-soft)" }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
