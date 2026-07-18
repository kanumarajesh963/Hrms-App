import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Badge, PageHeader } from "../components/ui";
import ShiftRing from "../components/ShiftRing";
import {
  getTodayRecord,
  punchIn,
  punchOut,
  getMonthlyAttendance,
  getAllLeaveBalances,
  getUserLeaveRequests,
  getCompanyById,
} from "../lib/store";
import { CalendarDays, TrendingUp, Timer } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const company = getCompanyById(user.companyId);
  const [today, setToday] = useState(getTodayRecord(user.id));
  const [now, setNow] = useState(Date.now());
  const [monthRecords, setMonthRecords] = useState([]);
  const [balances, setBalances] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  function refreshAll() {
    setToday(getTodayRecord(user.id));
    setMonthRecords(getMonthlyAttendance(user.id, year, month));
    setBalances(getAllLeaveBalances(user.id));
    setPendingCount(getUserLeaveRequests(user.id).filter((r) => r.status === "pending").length);
  }

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  const hoursToday = today
    ? today.totalHours ?? (now - new Date(today.punchIn).getTime()) / 3600000
    : 0;

  const presentDays = monthRecords.filter((r) => r.punchOut).length;
  const avgHours =
    monthRecords.filter((r) => r.totalHours).length > 0
      ? monthRecords.filter((r) => r.totalHours).reduce((s, r) => s + r.totalHours, 0) /
        monthRecords.filter((r) => r.totalHours).length
      : 0;

  function handlePunchIn() {
    punchIn(user.id);
    refreshAll();
  }
  function handlePunchOut() {
    punchOut(user.id);
    refreshAll();
  }

  return (
    <div>
      <PageHeader eyebrow={`${company?.name || ""} · ${user.department}`} title="Today's overview" />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: 20 }} className="dash-grid">
        <Card style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <ShiftRing
            hours={hoursToday}
            sublabel={today?.punchOut ? "Shift complete" : today ? "Shift in progress" : "Not started"}
          />
          {!today && (
            <Button variant="amber" onClick={handlePunchIn} style={{ width: "100%" }}>
              Punch in
            </Button>
          )}
          {today && !today.punchOut && (
            <Button variant="teal" onClick={handlePunchOut} style={{ width: "100%" }}>
              Punch out
            </Button>
          )}
          {today && today.punchOut && (
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
              In {new Date(today.punchIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Out{" "}
              {new Date(today.punchOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card style={{ padding: 20 }}>
              <StatBlock icon={CalendarDays} label="Present days (this month)" value={presentDays} tone="teal" />
            </Card>
            <Card style={{ padding: 20 }}>
              <StatBlock icon={Timer} label="Avg hours / day" value={avgHours ? avgHours.toFixed(1) : "0.0"} tone="amber" />
            </Card>
          </div>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Leave balance</div>
              {pendingCount > 0 && <Badge tone="amber">{pendingCount} pending</Badge>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {balances.map((b) => (
                <div key={b.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-soft)" }}>{b.name}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 800 }}>
                    {b.remaining}
                    <span style={{ color: "var(--muted)", fontWeight: 600 }}> / {b.quota} days</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value, tone }) {
  const bg = tone === "teal" ? "var(--teal-soft)" : "var(--amber-soft)";
  const color = tone === "teal" ? "var(--teal)" : "#8a5717";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={19} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}
