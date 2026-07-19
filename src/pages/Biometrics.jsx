import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge, EmptyState } from "../components/ui";
import {
  hasWebAuthnSupport,
  enrollBiometric,
  verifyBiometric,
  logAccessEvent,
  getUserAccessLogs,
} from "../lib/store";
import { Fingerprint, DoorOpen, ArrowRightToLine, ArrowLeftFromLine } from "lucide-react";
import { Fade, Zoom, Alert } from "@mui/material";

const DOORS = [
  { key: "mainDoor", label: "Main Door", icon: DoorOpen },
  { key: "inside", label: "Inside Access", icon: ArrowRightToLine },
  { key: "outside", label: "Outside Access", icon: ArrowLeftFromLine },
];

export default function Biometrics() {
  const { user, refresh } = useAuth();
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const supported = hasWebAuthnSupport();

  function refreshLogs() {
    setLogs(getUserAccessLogs(user.id));
  }

  useEffect(() => {
    refreshLogs();
  }, []);

  async function handleEnroll() {
    setBusy(true);
    setMessage(null);
    try {
      await enrollBiometric(user.id);
      refresh();
      setMessage({ type: "success", text: "Fingerprint enrolled on this device." });
    } catch (err) {
      setMessage({ type: "error", text: "Enrollment cancelled or unsupported on this device." });
    }
    setBusy(false);
  }

  async function handleCheckIn(door, label) {
    setBusy(true);
    setMessage(null);
    const res = await verifyBiometric(user.id);
    if (!res.ok) {
      setMessage({ type: "error", text: res.error });
      setBusy(false);
      return;
    }
    logAccessEvent(user.id, door);
    refreshLogs();
    setMessage({ type: "success", text: `Verified at ${label}.` });
    setBusy(false);
  }

  const granted = DOORS.filter((d) => user.doorAccess?.[d.key]);

  return (
    <div>
      <PageHeader eyebrow="Security" title="Fingerprint access" />

      {!supported && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          This browser/device doesn't support platform fingerprint verification (WebAuthn). Try this on a
          phone or laptop with Touch ID, Windows Hello, or Android fingerprint enabled.
        </Alert>
      )}

      {message && (
        <Fade in>
          <Alert severity={message.type} sx={{ mb: 2, borderRadius: 2 }}>
            {message.text}
          </Alert>
        </Fade>
      )}

      <Card style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: user.biometricCredentialId ? "var(--teal-soft)" : "var(--surface-sunk)",
              color: user.biometricCredentialId ? "var(--teal)" : "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Fingerprint size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              {user.biometricCredentialId ? "Fingerprint enrolled on this device" : "No fingerprint enrolled yet"}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              Uses your device's own Touch ID / Windows Hello / fingerprint sensor.
            </div>
          </div>
          <Button variant={user.biometricCredentialId ? "ghost" : "amber"} disabled={busy || !supported} onClick={handleEnroll}>
            {user.biometricCredentialId ? "Re-enroll" : "Enroll now"}
          </Button>
        </div>
      </Card>

      <Card style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Check in at a door</div>
        {granted.length === 0 ? (
          <EmptyState title="No door access granted yet" hint="Ask HR to grant you access from the Access Control page." />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {granted.map(({ key, label, icon: Icon }) => (
              <Zoom in key={key} style={{ transitionDelay: "50ms" }}>
                <button
                  onClick={() => handleCheckIn(key, label)}
                  disabled={busy || !user.biometricCredentialId}
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    borderRadius: "var(--radius-md)",
                    padding: "20px 14px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    cursor: busy || !user.biometricCredentialId ? "not-allowed" : "pointer",
                    opacity: busy || !user.biometricCredentialId ? 0.5 : 1,
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <Icon size={22} color="var(--teal)" />
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>{label}</span>
                </button>
              </Zoom>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 800, fontSize: 15 }}>
          Recent check-ins
        </div>
        {logs.length === 0 ? (
          <EmptyState title="No check-ins yet" />
        ) : (
          logs.slice(0, 10).map((l) => (
            <div key={l.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>
                {DOORS.find((d) => d.key === l.door)?.label || l.door}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{new Date(l.at).toLocaleString()}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
