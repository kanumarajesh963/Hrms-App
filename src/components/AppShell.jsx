import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Clock,
  CalendarDays,
  Wallet,
  User,
  Bell,
  LogOut,
  ClipboardCheck,
  Users,
  Menu,
  X,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllRead, getCompanyById } from "../lib/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/attendance", label: "Attendance", icon: Clock },
  { to: "/leave", label: "Leave", icon: CalendarDays },
  { to: "/payslips", label: "Payslips", icon: Wallet },
  { to: "/biometrics", label: "Biometrics", icon: Fingerprint },
  { to: "/profile", label: "Profile", icon: User },
];

const ADMIN_NAV = [
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/access-control", label: "Access Control", icon: ShieldCheck },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) setNotifications(getNotifications(user.id));
  }, [user, notifOpen]);

  const nav = user?.role === "admin" ? [...NAV, ...ADMIN_NAV] : NAV;
  const unread = notifications.filter((n) => !n.read).length;
  const company = user ? getCompanyById(user.companyId) : null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function openNotifications() {
    setNotifOpen((v) => !v);
    if (user) markAllRead(user.id);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      <aside
        className="app-sidebar"
        style={{
          width: 240,
          flexShrink: 0,
          background: "var(--ink)",
          color: "#fff",
          padding: "26px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div style={{ padding: "0 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
              H
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>Havn HR</span>
          </div>
          {company && (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.6 }}>
              {company.name}
            </div>
          )}
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                color: isActive ? "var(--ink)" : "rgba(255,255,255,0.75)",
                background: isActive ? "#fff" : "transparent",
                fontWeight: 700,
                fontSize: 14.5,
                transition: "background 0.15s ease",
              })}
            >
              <Icon size={18} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "#fff",
            padding: "10px 12px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <LogOut size={17} /> Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div
        className="app-mobile-topbar"
        style={{
          display: "none",
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--ink)",
          color: "#fff",
          padding: "14px 16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>
            H
          </div>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Havn HR</span>
        </div>
        <button onClick={() => setMenuOpen(true)} style={{ background: "transparent", border: "none", color: "#fff" }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile slide-over menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 30 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 250, background: "var(--ink)", color: "#fff", padding: 20, display: "flex", flexDirection: "column", gap: 18 }}
          >
            <button onClick={() => setMenuOpen(false)} style={{ alignSelf: "flex-end", background: "transparent", border: "none", color: "#fff" }}>
              <X size={22} />
            </button>
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 4px",
                  textDecoration: "none",
                  color: isActive ? "var(--amber)" : "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                })}
              >
                <Icon size={19} /> {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", padding: "10px 12px", borderRadius: 10, fontWeight: 700, marginTop: "auto" }}
            >
              <LogOut size={17} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          className="app-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 28px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Hi, {user?.name?.split(" ")[0]} 👋</div>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={openNotifications}
              style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Bell size={19} />
              {unread > 0 && (
                <span style={{ position: "absolute", top: 6, right: 7, width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} />
              )}
            </button>
            {notifOpen && (
              <div style={{ position: "absolute", right: 0, top: 50, width: 300, maxHeight: 360, overflowY: "auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)", padding: 10, zIndex: 40 }}>
                {notifications.length === 0 && (
                  <div style={{ padding: 16, color: "var(--muted)", fontSize: 13.5 }}>No notifications yet</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)", fontSize: 13.5 }}>
                    <div>{n.message}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: "24px 28px 90px", maxWidth: 1100, width: "100%", margin: "0 auto" }}>
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="app-bottom-nav"
        style={{
          display: "none",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          padding: "8px 6px calc(8px + env(safe-area-inset-bottom))",
          justifyContent: "space-around",
          zIndex: 20,
        }}
      >
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              textDecoration: "none",
              color: isActive ? "var(--amber)" : "var(--muted)",
              fontSize: 10.5,
              fontWeight: 700,
              padding: "4px 8px",
            })}
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main { animation: pageFadeIn 0.35s ease; }

        @media (max-width: 860px) {
          .app-sidebar { display: none; }
          .app-mobile-topbar { display: flex !important; }
          .app-bottom-nav { display: flex !important; }
          main { padding-bottom: 100px !important; }
        }
        @media (max-width: 420px) {
          .app-bottom-nav a { font-size: 9.5px !important; padding: 4px 4px !important; }
        }
      `}</style>
    </div>
  );
}
