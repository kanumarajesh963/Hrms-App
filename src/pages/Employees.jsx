import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Field, inputStyle, Badge } from "../components/ui";
import { getUsers, addEmployee, getCompanyById } from "../lib/store";
import ProfileDrawer from "../components/ProfileDrawer";

const DEPARTMENTS = ["Engineering", "Human Resources", "Sales", "Marketing", "Finance", "Operations"];

export default function Employees() {
  const { user } = useAuth();
  const company = getCompanyById(user.companyId);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    department: DEPARTMENTS[0],
    designation: "",
    baseSalary: 40000,
  });
  const [error, setError] = useState("");

  function refresh() {
    setEmployees(getUsers(user.companyId));
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.username || !form.password) {
      setError("Name, username and password are required.");
      return;
    }
    const res = addEmployee({ ...form, companyId: user.companyId, baseSalary: Number(form.baseSalary) });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setShowForm(false);
    setForm({ name: "", username: "", password: "", email: "", phone: "", department: DEPARTMENTS[0], designation: "", baseSalary: 40000 });
    refresh();
  }

  return (
    <div>
      <PageHeader
        eyebrow={company?.name || "Team"}
        title="Employees"
        action={
          <Button variant="amber" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "Add employee"}
          </Button>
        }
      />

      {showForm && (
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="emp-form">
            <Field label="Full name">
              <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Designation">
              <input style={inputStyle} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </Field>
            <Field label="Username">
              <input style={inputStyle} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Field>
            <Field label="Password">
              <input style={inputStyle} type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
            <Field label="Email">
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Department">
              <select style={inputStyle} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Monthly base salary (₹)">
              <input style={inputStyle} type="number" value={form.baseSalary} onChange={(e) => setForm({ ...form, baseSalary: e.target.value })} />
            </Field>
            {error && <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600, gridColumn: "1 / -1" }}>{error}</div>}
            <Button variant="teal" type="submit" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
              Create employee
            </Button>
          </form>
        </Card>
      )}

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "var(--surface-sunk)" }}>
                {["Employee ID", "Name", "Department", "Designation", "Base salary", "Role"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 18px", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)", fontWeight: 700 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  style={{ borderTop: "1px solid var(--border)", cursor: "pointer" }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--surface-sunk)")}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 800, color: "var(--teal)" }}>{e.employeeId}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: e.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12 }}>
                        {e.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13.5 }}>{e.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--ink-soft)" }}>{e.department}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, color: "var(--ink-soft)" }}>{e.designation}</td>
                  <td style={{ padding: "14px 18px", fontSize: 13.5, fontWeight: 700 }}>₹{e.baseSalary.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 18px" }}>
                    <Badge tone={e.role === "admin" ? "amber" : "neutral"}>{e.role}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && <ProfileDrawer person={selected} onClose={() => setSelected(null)} />}

      <style>{`
        @media (max-width: 640px) {
          .emp-form { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
