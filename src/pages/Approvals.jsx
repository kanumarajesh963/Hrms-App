import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge, EmptyState } from "../components/ui";
import { getCompanyLeaveRequests, getLeaveTypes, getUserById, actionLeaveRequest, getCompanyById } from "../lib/store";
import ProfileDrawer from "../components/ProfileDrawer";

export default function Approvals() {
  const { user } = useAuth();
  const company = getCompanyById(user.companyId);
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);

  function refresh() {
    setRequests(getCompanyLeaveRequests(user.companyId));
    setTypes(getLeaveTypes());
  }

  useEffect(() => {
    refresh();
  }, []);

  function act(id, status) {
    actionLeaveRequest(id, status, user.id);
    refresh();
  }

  const visible = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div>
      <PageHeader
        eyebrow={company?.name || "Team"}
        title="Leave approvals"
        action={
          <div style={{ display: "flex", gap: 6 }}>
            {["pending", "approved", "rejected", "all"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "1px solid var(--border)",
                  background: filter === f ? "var(--ink)" : "var(--surface)",
                  color: filter === f ? "#fff" : "var(--ink)",
                  fontWeight: 700,
                  fontSize: 12.5,
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {visible.length === 0 ? (
          <EmptyState title="Nothing here" hint="Requests matching this filter will appear as they come in." />
        ) : (
          visible.map((r) => {
            const emp = getUserById(r.userId);
            const type = types.find((t) => t.id === r.leaveTypeId);
            const tone = r.status === "approved" ? "teal" : r.status === "rejected" ? "danger" : "amber";
            return (
              <div key={r.id} style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setSelected(emp)}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: emp?.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {emp?.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{emp?.name} <span style={{ color: "var(--muted)", fontWeight: 600 }}>· {type?.name}</span></div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{r.startDate} → {r.endDate} · {r.days} day{r.days > 1 ? "s" : ""}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>{r.reason}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.status === "pending" ? (
                    <>
                      <Button size="sm" variant="teal" onClick={() => act(r.id, "approved")}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => act(r.id, "rejected")}>Reject</Button>
                    </>
                  ) : (
                    <Badge tone={tone}>{r.status}</Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </Card>

      {selected && <ProfileDrawer person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
