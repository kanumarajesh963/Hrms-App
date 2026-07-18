import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Field, inputStyle, Card } from "../components/ui";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const res = login(username, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/");
  }

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
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
            Demo logins — Admin: <b>admin / admin123</b> · Employee: <b>rahul / rahul123</b>
          </div>
        </div>

        <div style={{ flex: 1, background: "var(--surface)", padding: 44, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Welcome back</h2>
          <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 26 }}>Sign in to continue to your dashboard.</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Username">
              <input
                style={inputStyle}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul"
                autoFocus
              />
            </Field>
            <Field label="Password">
              <input
                style={inputStyle}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            {error && (
              <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>{error}</div>
            )}
            <Button type="submit" variant="amber" style={{ marginTop: 8 }}>
              Sign in
            </Button>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .login-hero { display: none; }
        }
      `}</style>
    </div>
  );
}
