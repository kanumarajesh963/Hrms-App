import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Badge, EmptyState } from "../components/ui";
import { getUserAttendance } from "../lib/store";

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setRecords(getUserAttendance(user.id));
  }, [user.id]);

  return (
    <div>
      <PageHeader eyebrow="Time tracking" title="Attendance history" />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {records.length === 0 ? (
          <EmptyState title="No attendance recorded yet" hint="Punch in from the dashboard to start logging your hours." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
              <thead>
                <tr style={{ background: "var(--surface-sunk)" }}>
                  {["Date", "Punch in", "Punch out", "Hours", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 18px", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)", fontWeight: 700 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 18px", fontWeight: 700, fontSize: 14 }}>
                      {new Date(r.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--ink-soft)" }}>
                      {new Date(r.punchIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--ink-soft)" }}>
                      {r.punchOut ? new Date(r.punchOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: 13.5, fontWeight: 700 }}>
                      {r.totalHours ? `${r.totalHours}h` : "—"}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      {r.punchOut ? <Badge tone="teal">Complete</Badge> : <Badge tone="amber">In progress</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
