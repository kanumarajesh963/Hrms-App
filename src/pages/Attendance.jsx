import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge, EmptyState } from "../components/ui";
import AttendanceCalendar from "../components/AttendanceCalendar";
import { getUserAttendance, requestRegularization, getUserRegularizations } from "../lib/store";
import { Tabs, Tab, TextField, Alert, Fade } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";

const ISO = "YYYY-MM-DD";

export default function Attendance() {
  const { user } = useAuth();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(location.state?.tab === "regularize" ? 1 : 0);
  const [records, setRecords] = useState([]);
  const [regs, setRegs] = useState([]);

  const [date, setDate] = useState(null);
  const [punchIn, setPunchIn] = useState(null);
  const [punchOut, setPunchOut] = useState(null);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState(null);

  function refresh() {
    setRecords(getUserAttendance(user.id));
    setRegs(getUserRegularizations(user.id));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function submitRegularization(e) {
    e.preventDefault();
    const payload = {
      date: date && date.isValid() ? date.format(ISO) : "",
      punchIn: punchIn && punchIn.isValid() ? punchIn.format("HH:mm") : "",
      punchOut: punchOut && punchOut.isValid() ? punchOut.format("HH:mm") : "",
      reason,
    };
    const res = requestRegularization(user.id, payload);
    if (!res.ok) {
      setStatus({ type: "error", text: res.error });
      enqueueSnackbar(res.error, { variant: "error" });
      return;
    }
    setStatus({ type: "success", text: "Regularization request sent for approval." });
    enqueueSnackbar("Regularization request submitted", { variant: "success" });
    setDate(null);
    setPunchIn(null);
    setPunchOut(null);
    setReason("");
    refresh();
  }

  return (
    <div>
      <PageHeader eyebrow="Time tracking" title="Attendance" />

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <AttendanceCalendar userId={user.id} />
      </Card>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, minHeight: 40, "& .MuiTab-root": { minHeight: 40, fontWeight: 700, textTransform: "none" } }}
      >
        <Tab label="History" />
        <Tab label="Regularize" />
      </Tabs>

      {tab === 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {records.length === 0 ? (
            <EmptyState title="No attendance recorded yet" hint="Punch in from the dashboard to start logging your hours." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
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
                      <td style={{ padding: "14px 18px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.punchOut ? <Badge tone="teal">Complete</Badge> : <Badge tone="amber">In progress</Badge>}
                        {r.regularized && <Badge tone="neutral">Regularized</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 20 }} className="reg-grid">
          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Regularize attendance</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
              Missed a punch-in or punch-out? Submit a correction — your manager or HR needs to approve it before it reflects in your history.
            </div>
            <form onSubmit={submitRegularization} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <DatePicker
                label="Date"
                format="DD-MM-YYYY"
                disableFuture
                value={date}
                onChange={setDate}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <TimePicker label="Punch in" value={punchIn} onChange={setPunchIn} />
                <TimePicker label="Punch out" value={punchOut} onChange={setPunchOut} />
              </div>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Reason"
                placeholder="Why does this date need correction?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              {status && (
                <Fade in>
                  <Alert severity={status.type} sx={{ borderRadius: 2 }}>{status.text}</Alert>
                </Fade>
              )}
              <Button variant="amber" type="submit">Submit request</Button>
            </form>
          </Card>

          <Card style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", fontWeight: 800, fontSize: 15 }}>
              My regularization requests
            </div>
            {regs.length === 0 ? (
              <EmptyState title="No requests yet" hint="Corrections you submit will show up here." />
            ) : (
              regs.map((r) => {
                const tone = r.status === "approved" ? "teal" : r.status === "rejected" ? "danger" : "amber";
                return (
                  <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {new Date(r.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                        {r.punchIn} → {r.punchOut}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{r.reason}</div>
                    </div>
                    <Badge tone={tone}>{r.status}</Badge>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .reg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
