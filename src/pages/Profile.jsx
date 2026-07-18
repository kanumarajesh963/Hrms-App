import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Field, inputStyle, Button, Badge } from "../components/ui";
import { updateUser } from "../lib/store";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ email: user.email, phone: user.phone });
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    updateUser(user.id, form);
    refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <PageHeader eyebrow="Account" title="My profile" />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }} className="profile-grid">
        <Card style={{ padding: 24, textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: user.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 26,
              margin: "0 auto 14px",
            }}
          >
            {user.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>{user.designation}</div>
          <Badge tone={user.role === "admin" ? "amber" : "teal"}>{user.role}</Badge>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}>
            <MiniRow label="Department" value={user.department} />
            <MiniRow label="Joined" value={new Date(user.joinDate).toLocaleDateString()} />
            <MiniRow label="Base salary" value={`₹${user.baseSalary.toLocaleString("en-IN")}/mo`} />
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Contact details</div>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380 }}>
            <Field label="Email">
              <input style={inputStyle} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Button variant="amber" type="submit" style={{ alignSelf: "flex-start" }}>
              Save changes
            </Button>
            {saved && <div style={{ color: "var(--teal)", fontSize: 13, fontWeight: 600 }}>Saved.</div>}
          </form>
        </Card>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
