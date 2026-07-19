// Small shared UI primitives used across pages.

export function Card({ children, style, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", size = "md", style, ...props }) {
  const variants = {
    primary: { background: "var(--ink)", color: "#fff", border: "1px solid var(--ink)" },
    amber: { background: "var(--amber)", color: "#fff", border: "1px solid var(--amber)" },
    teal: { background: "var(--teal)", color: "#fff", border: "1px solid var(--teal)" },
    ghost: { background: "transparent", color: "var(--ink)", border: "1px solid var(--border)" },
    danger: { background: "var(--danger)", color: "#fff", border: "1px solid var(--danger)" },
  };
  const sizes = {
    sm: { padding: "7px 14px", fontSize: 13 },
    md: { padding: "11px 20px", fontSize: 14.5 },
  };
  return (
    <button
      style={{
        fontWeight: 700,
        borderRadius: "var(--radius-sm)",
        transition: "opacity 0.15s ease, transform 0.1s ease",
        ...variants[variant],
        ...sizes[size],
        ...style,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { background: "var(--surface-sunk)", color: "var(--ink-soft)" },
    amber: { background: "var(--amber-soft)", color: "#8a5717" },
    teal: { background: "var(--teal-soft)", color: "var(--teal)" },
    danger: { background: "var(--danger-soft)", color: "var(--danger)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        textTransform: "capitalize",
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}

export function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>
      {label}
      {children}
    </label>
  );
}

export const inputStyle = {
  padding: "10px 12px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)",
  fontSize: 16,
  fontWeight: 500,
  background: "var(--bg)",
  color: "var(--ink)",
  outline: "none",
};

export function EmptyState({ title, hint }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 4 }}>{title}</div>
      {hint && <div style={{ fontSize: 13 }}>{hint}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
      <div>
        {eyebrow && (
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}
