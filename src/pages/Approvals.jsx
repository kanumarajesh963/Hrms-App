import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge, EmptyState } from "../components/ui";
import {
  getCompanyLeaveRequests,
  getLeaveTypes,
  getUserById,
  actionLeaveRequest,
  getCompanyById,
  getCompanyRegularizations,
  actionRegularization,
} from "../lib/store";
import { Tabs, Tab } from "@mui/material";
import { useSnackbar } from "notistack";
import ProfileDrawer from "../components/ProfileDrawer";

export default function Approvals() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const company = getCompanyById(user.companyId);
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [regs, setRegs] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);

  function refresh() {
    setRequests(getCompanyLeaveRequests(user.companyId));
    setTypes(getLeaveTypes());
    setRegs(getCompanyRegularizations(user.companyId));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function act(id, status) {
    actionLeaveRequest(id, status, user.id);
    enqueueSnackbar(`Leave request ${status}`, { variant: status === "approved" ? "success" : "warning" });
    refresh();
  }

  function actReg(id, status) {
    actionRegularization(id, status, user.id);
    enqueueSnackbar(`Regularization ${status}`, { variant: status === "approved" ? "success" : "warning" });
    refresh();
  }

  const visibleLeave = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const visibleRegs = filter === "all" ? regs : regs.filter((r) => r.status === filter);

  const filterBar = (
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
  );

  return (
    <div>
      <PageHeader eyebrow={company?.name || "Team"} title="Approvals" action={filterBar} />

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, minHeight: 40, "& .MuiTab-root": { minHeight: 40, fontWeight: 700, textTransform: "none" } }}
      >
        <Tab label={`Leave requests${requests.filter((r) => r.status === "pending").length ? ` (${requests.filter((r) => r.status === "pending").length})` : ""}`} />
        <Tab label={`Regularizations${regs.filter((r) => r.status === "pending").length ? ` (${regs.filter((r) => r.status === "pending").length})` : ""}`} />
      </Tabs>

      {tab === 0 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {visibleLeave.length === 0 ? (
            <EmptyState title="Nothing here" hint="Requests matching this filter will appear as they come in." />
          ) : (
            visibleLeave.map((r) => {
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
      )}

      {tab === 1 && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {visibleRegs.length === 0 ? (
            <EmptyState title="Nothing here" hint="Attendance regularization requests will appear as they come in." />
          ) : (
            visibleRegs.map((r) => {
              const emp = getUserById(r.userId);
              const tone = r.status === "approved" ? "teal" : r.status === "rejected" ? "danger" : "amber";
              return (
                <div key={r.id} style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setSelected(emp)}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: emp?.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {emp?.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {emp?.name}{" "}
                        <span style={{ color: "var(--muted)", fontWeight: 600 }}>
                          · {new Date(r.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{r.punchIn} → {r.punchOut}</div>
                      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>{r.reason}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {r.status === "pending" ? (
                      <>
                        <Button size="sm" variant="teal" onClick={() => actReg(r.id, "approved")}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => actReg(r.id, "rejected")}>Reject</Button>
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
      )}

      {selected && <ProfileDrawer person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
