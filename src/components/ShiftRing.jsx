// Signature element: a live circular "shift ring" that fills as the day's
// worked hours accumulate toward the target. Values are always computed
// from real punch-in/out timestamps, never hardcoded.
export default function ShiftRing({ hours, target = 8, size = 168, label, sublabel }) {
  const pct = Math.max(0, Math.min(hours / target, 1));
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const over = hours > target;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-sunk)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={over ? "var(--teal)" : "var(--amber)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
          {hours.toFixed(1)}
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--muted)" }}>h</span>
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label || `of ${target}h target`}
        </span>
        {sublabel && (
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{sublabel}</span>
        )}
      </div>
    </div>
  );
}
