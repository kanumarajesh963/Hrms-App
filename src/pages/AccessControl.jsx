import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Badge, EmptyState } from "../components/ui";
import { getUsers, updateDoorAccess, getCompanyAccessLogs, getCompanyById } from "../lib/store";
import { Switch, Tooltip } from "@mui/material";
import ProfileDrawer from "../components/ProfileDrawer";

const DOORS = [
  { key: "mainDoor", label: "Main Door" },
  { key: "inside", label: "Inside" },
  { key: "outside", label: "Outside" },
];

export default function AccessControl() {
  const { user } = useAuth();
  const company = getCompanyById(user.companyId);
  const [employees, setEmployees] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);

  function refresh() {
    setEmployees(getUsers(user.companyId));
    setLogs(getCompanyAccessLogs(user.companyId));
  }

  useEffect(() => {
    refresh();
  }, []);

  function toggle(person, key) {
    const doorAccess = { ...(person.doorAccess || {}), [key]: !person.doorAccess?.[key] };
    updateDoorAccess(person.id, doorAccess);
    refresh();
  }

  return (
    <div>
      <PageHeader eyebrow={company?.name || "Security"} title="Access control" />

      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
            <thead>
              <tr style={{ background: "var(--surface-sunk)" }}>
                <th style={thStyle}>Employee</th>
                {DOORS.map((d) => (
                  <th key={d.key} style={{ ...thStyle, textAlign: "center" }}>{d.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 18px", cursor: "pointer" }} onClick={() => setSelected(e)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: e.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11 }}>
                        {e.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{e.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{e.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  {DOORS.map((d) => (
                    <td key={d.key} style={{ textAlign: "center" }}>
                      <Tooltip title={`${e.doorAccess?.[d.key] ? "Revoke" : "Grant"} ${d.label} access`}>
                        <Switch
                          checked={!!e.doorAccess?.[d.key]}
                          onChange={() => toggle(e, d.key)}
                          color="success"
                        />
                      </Tooltip>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 800, fontSize: 15 }}>
          Recent check-ins (company-wide)
        </div>
        {logs.length === 0 ? (
          <EmptyState title="No check-ins yet" hint="Once employees enroll their fingerprint and check in, records will show here." />
        ) : (
          logs.slice(0, 25).map((l) => {
            const person = employees.find((e) => e.id === l.userId);
            return (
              <div key={l.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{person?.name || "Unknown"}</span>
                <Badge tone="teal">{DOORS.find((d) => d.key === l.door)?.label || l.door}</Badge>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{new Date(l.at).toLocaleString()}</span>
              </div>
            );
          })
        )}
      </Card>

      {selected && <ProfileDrawer person={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

const thStyle = { textAlign: "left", padding: "12px 18px", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)", fontWeight: 700 };
