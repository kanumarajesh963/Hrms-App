import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge } from "../components/ui";
import { getUsers, addEmployee, getCompanyById } from "../lib/store";
import ProfileDrawer from "../components/ProfileDrawer";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, MenuItem, Alert, Fade, Collapse, Grow } from "@mui/material";

const DEPARTMENTS = ["Engineering", "Human Resources", "Sales", "Marketing", "Finance", "Operations"];

const schema = Yup.object({
  name: Yup.string().trim().required("Required"),
  designation: Yup.string().trim().required("Required"),
  username: Yup.string().trim().required("Required"),
  password: Yup.string().min(4, "At least 4 characters").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  phone: Yup.string().required("Required"),
  department: Yup.string().required("Required"),
  baseSalary: Yup.number().typeError("Must be a number").positive("Must be positive").required("Required"),
});

export default function Employees() {
  const { user } = useAuth();
  const company = getCompanyById(user.companyId);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setEmployees(getUsers(user.companyId));
  }

  useEffect(() => {
    refresh();
  }, [user.companyId]);

  const formik = useFormik({
    initialValues: {
      name: "",
      username: "",
      password: "",
      email: "",
      phone: "",
      department: DEPARTMENTS[0],
      designation: "",
      baseSalary: 40000,
    },
    validationSchema: schema,
    onSubmit: (values, { setStatus, resetForm }) => {
      const res = addEmployee({ ...values, companyId: user.companyId, baseSalary: Number(values.baseSalary) });
      if (!res.ok) {
        setStatus(res.error);
        return;
      }
      setShowForm(false);
      resetForm();
      refresh();
    },
  });

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

      <Collapse in={showForm}>
        <Card style={{ padding: 24, marginBottom: 20 }}>
          <form onSubmit={formik.handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="emp-form">
            <TextField
              fullWidth label="Full name" name="name"
              value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.name && !!formik.errors.name} helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth label="Designation" name="designation"
              value={formik.values.designation} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.designation && !!formik.errors.designation} helperText={formik.touched.designation && formik.errors.designation}
            />
            <TextField
              fullWidth label="Username" name="username"
              value={formik.values.username} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.username && !!formik.errors.username} helperText={formik.touched.username && formik.errors.username}
            />
            <TextField
              fullWidth label="Password" name="password"
              value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.password && !!formik.errors.password} helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
              fullWidth type="email" label="Email" name="email"
              value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.email && !!formik.errors.email} helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              fullWidth label="Phone" name="phone"
              value={formik.values.phone} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.phone && !!formik.errors.phone} helperText={formik.touched.phone && formik.errors.phone}
            />
            <TextField
              select fullWidth label="Department" name="department"
              value={formik.values.department} onChange={formik.handleChange}
            >
              {DEPARTMENTS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
            <TextField
              fullWidth type="number" label="Monthly base salary (₹)" name="baseSalary"
              value={formik.values.baseSalary} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.baseSalary && !!formik.errors.baseSalary} helperText={formik.touched.baseSalary && formik.errors.baseSalary}
            />
            {formik.status && (
              <Fade in>
                <Alert severity="error" sx={{ borderRadius: 2, gridColumn: "1 / -1" }}>{formik.status}</Alert>
              </Fade>
            )}
            <Button variant="teal" type="submit" style={{ gridColumn: "1 / -1", justifySelf: "start" }}>
              Create employee
            </Button>
          </form>
        </Card>
      </Collapse>

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
              {employees.map((e, i) => (
                <Grow in key={e.id} timeout={200 + i * 30} style={{ transformOrigin: "top" }}>
                  <tr
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
                </Grow>
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
