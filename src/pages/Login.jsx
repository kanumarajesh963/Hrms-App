import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, Alert, Fade } from "@mui/material";
import { Button } from "../components/ui";

const schema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: schema,
    onSubmit: (values, { setStatus }) => {
      const res = login(values.username.trim(), values.password);
      if (!res.ok) {
        setStatus(res.error);
        return;
      }
      navigate("/");
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ink)",
        padding: 20,
      }}
    >
      <Fade in timeout={500}>
        <div style={{ display: "flex", width: "100%", maxWidth: 880, borderRadius: 24, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>
          <div
            style={{
              flex: 1,
              background: "linear-gradient(160deg, #16241f 0%, #0f6e5c 100%)",
              color: "#fff",
              padding: 44,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 480,
            }}
            className="login-hero"
          >
            <div>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>
                H
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 28, marginBottom: 12, letterSpacing: -0.5, lineHeight: 1.15 }}>
                One place for attendance, leave & payroll.
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 320 }}>
                Punch in, track hours, apply for leave, and view payslips — all computed live from your real activity.
              </p>
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>
              4 demo companies are seeded — <b>cashe</b>, <b>bhanix</b>, <b>aeries</b>, <b>karatclub</b>.
              <br />
              HR login: <b>hr1.&lt;company&gt;</b> or <b>hr2.&lt;company&gt;</b> · Employee login: <b>emp1.&lt;company&gt;</b> through <b>emp20.&lt;company&gt;</b>
              <br />
              Password for everyone in a company: <b>&lt;company&gt;123</b> (e.g. <b>hr1.cashe / cashe123</b>)
            </div>
          </div>

          <div style={{ flex: 1, background: "var(--surface)", padding: 44, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome back</h2>
            <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 26 }}>Sign in to continue to your dashboard.</p>

            <form onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                autoFocus
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && !!formik.errors.username}
                helperText={formik.touched.username && formik.errors.username}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && !!formik.errors.password}
                helperText={formik.touched.password && formik.errors.password}
              />
              {formik.status && (
                <Fade in>
                  <Alert severity="error" sx={{ borderRadius: 2 }}>{formik.status}</Alert>
                </Fade>
              )}
              <Button type="submit" variant="amber" style={{ marginTop: 8 }}>
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </Fade>

      <style>{`
        @media (max-width: 720px) {
          .login-hero { display: none; }
        }
      `}</style>
    </div>
  );
}
