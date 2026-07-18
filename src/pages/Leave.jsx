import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Field, inputStyle, Badge, EmptyState } from "../components/ui";
import { getLeaveTypes, applyLeave, getUserLeaveRequests, getAllLeaveBalances } from "../lib/store";

export default function Leave() {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [form, setForm] = useState({ leaveTypeId: "", startDate: "", endDate: "", reason: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function refresh() {
    setTypes(getLeaveTypes());
    setRequests(getUserLeaveRequests(user.id));
    setBalances(getAllLeaveBalances(user.id));
  }

  useEffect(() => {
    refresh();
  }, [user.id]);

  useEffect(() => {
    if (types.length && !form.leaveTypeId) {
      setForm((f) => ({ ...f, leaveTypeId: types[0].id }));
    }
  }, [types]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setError("Please fill every field.");
      return;
    }
    const res = applyLeave(user.id, form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSuccess("Leave request submitted.");
    setForm((f) => ({ ...f, startDate: "", endDate: "", reason: "" }));
    refresh();
  }

  return (
    <div>
      <PageHeader eyebrow="Time off" title="Leave management" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }} className="leave-grid">
        <Card style={{ padding: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Apply for leave</div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Leave type">
              <select
                style={inputStyle}
                value={form.leaveTypeId}
                onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Start date">
                <input type="date" style={inputStyle} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </Field>
              <Field label="End date">
                <input type="date" style={inputStyle} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </Field>
            </div>
            <Field label="Reason">
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Briefly describe the reason"
              />
            </Field>
            {error && <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>{error}</div>}
            {success && <div style={{ color: "var(--teal)", fontSize: 13, fontWeight: 600 }}>{success}</div>}
            <Button variant="amber" type="submit">
              Submit request
            </Button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Balance
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {balances.map((b) => (
                <div key={b.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                  <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}>{b.name}</span>
                  <span style={{ fontWeight: 800 }}>{b.remaining} / {b.quota}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", fontWeight: 800, fontSize: 15 }}>
            My requests
          </div>
          {requests.length === 0 ? (
            <EmptyState title="No leave requests yet" hint="Requests you submit will show up here." />
          ) : (
            <div>
              {requests.map((r) => {
                const type = types.find((t) => t.id === r.leaveTypeId);
                const tone = r.status === "approved" ? "teal" : r.status === "rejected" ? "danger" : "amber";
                return (
                  <div key={r.id} style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{type?.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                        {r.startDate} → {r.endDate} · {r.days} day{r.days > 1 ? "s" : ""}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{r.reason}</div>
                    </div>
                    <Badge tone={tone}>{r.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .leave-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
