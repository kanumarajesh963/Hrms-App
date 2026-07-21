import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Badge, PageHeader } from "../components/ui";
import ShiftRing from "../components/ShiftRing";
import AttendanceCalendar from "../components/AttendanceCalendar";
import {
  getTodayRecord,
  punchIn,
  punchOut,
  getMonthlyAttendance,
  getAllLeaveBalances,
  getUserLeaveRequests,
  getCompanyById,
  getUpcomingHolidays,
  getUsers,
} from "../lib/store";
import { CalendarDays, Timer, PartyPopper, Cake, Megaphone } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const company = getCompanyById(user.companyId);
  const [today, setToday] = useState(getTodayRecord(user.id));
  const [now, setNow] = useState(Date.now());
  const [monthRecords, setMonthRecords] = useState([]);
  const [balances, setBalances] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [holidays, setHolidays] = useState([]);
  const [anniversaries, setAnniversaries] = useState([]);

  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  function refreshAll() {
    setToday(getTodayRecord(user.id));
    setMonthRecords(getMonthlyAttendance(user.id, year, month));
    setBalances(getAllLeaveBalances(user.id));
    setPendingCount(getUserLeaveRequests(user.id).filter((r) => r.status === "pending").length);
    setHolidays(getUpcomingHolidays(4));
    const todayMD = new Date().toISOString().slice(5, 10);
    setAnniversaries(
      getUsers(user.companyId).filter((u) => u.joinDate?.slice(5, 10) === todayMD)
    );
  }

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoursToday = today
    ? today.totalHours ?? (now - new Date(today.punchIn).getTime()) / 3600000
    : 0;

  const presentDays = monthRecords.filter((r) => r.punchOut).length;
  const absentDays = monthRecords.length
    ? new Date(year, month, Math.min(new Date().getDate(), new Date(year, month + 1, 0).getDate())).getDate() -
      presentDays
    : 0;
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

      <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,0.9fr)", gap: 20, alignItems: "start" }}>
        {/* Column 1 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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

          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>Time, Attendance &amp; Leave</div>
            </div>
            <AttendanceCalendar userId={user.id} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Button variant="primary" style={{ flex: 1 }} onClick={() => navigate("/leave")}>
                Apply Leave
              </Button>
              <Button variant="ghost" style={{ flex: 1 }} onClick={() => navigate("/attendance", { state: { tab: "regularize" } })}>
                Regularize
              </Button>
            </div>
          </Card>
        </div>

        {/* Column 2 */}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {balances.map((b, i) => {
                const tiles = ["#2e86de", "#7bc96f", "#4fd1c5", "#9b8cf0", "#3f7fd6", "#0f6e5c"];
                return (
                  <div key={b.code} style={{ background: tiles[i % tiles.length], color: "#fff", borderRadius: 12, padding: "14px 12px" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{b.remaining}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.9, marginTop: 2 }}>{b.name}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, marginBottom: 14 }}>
              <Megaphone size={16} /> Announcements
            </div>
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: 13.5, fontWeight: 600 }}>
              No announcements right now
            </div>
          </Card>
        </div>

        {/* Column 3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, marginBottom: 14 }}>
              <PartyPopper size={16} /> Upcoming holidays
            </div>
            {holidays.length === 0 ? (
              <div style={{ textAlign: "center", padding: "12px 0", color: "var(--muted)", fontSize: 13.5 }}>No holidays remaining this year</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {holidays.map((h) => (
                  <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--amber-soft)", color: "#8a5717", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase" }}>{new Date(h.date).toLocaleDateString(undefined, { month: "short" })}</div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{new Date(h.date).getDate()}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{h.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{new Date(h.date).toLocaleDateString(undefined, { weekday: "long" })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, marginBottom: 14 }}>
              <Cake size={16} /> Work anniversaries today
            </div>
            {anniversaries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "12px 0", color: "var(--muted)", fontSize: 13.5 }}>No anniversaries today</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {anniversaries.map((a) => (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: a.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                      {a.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 1180px) {
          .dash-grid { grid-template-columns: 1fr 1fr !important; }
          .dash-grid > div:nth-child(3) { grid-column: 1 / -1; }
        }
        @media (max-width: 780px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .dash-grid > div:nth-child(3) { grid-column: auto; }
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
