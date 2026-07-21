import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthDayStatuses } from "../lib/store";

const DOT_COLOR = {
  present: "#0f6e5c",
  absent: "#c0392b",
  leaveApplied: "#9a9587",
  leaveApproved: "#6b4fa0",
};

const LEGEND = [
  { key: "absent", label: "Absent" },
  { key: "present", label: "Present" },
  { key: "leaveApplied", label: "Leave applied" },
  { key: "leaveApproved", label: "Leave approved" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendar({ userId, onSelectDate }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const statuses = getMonthDayStatuses(userId, year, month);
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayD = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : null;

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1);
  }

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={prevMonth} style={{ background: "var(--surface-sunk)", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ fontWeight: 800, fontSize: 15 }}>
          {new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button onClick={nextMonth} style={{ background: "var(--surface-sunk)", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center" }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", padding: "4px 0" }}>{w}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const isToday = d === todayD;
          const status = statuses[d];
          return (
            <button
              key={d}
              onClick={() => onSelectDate?.(d)}
              style={{
                position: "relative",
                border: "none",
                background: isToday ? "var(--teal)" : "transparent",
                color: isToday ? "#fff" : "var(--ink)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                margin: "0 auto",
                fontWeight: isToday ? 800 : 600,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {d}
              {status && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -3,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isToday ? "#fff" : DOT_COLOR[status],
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        {LEGEND.map((l) => (
          <div key={l.key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: DOT_COLOR[l.key] }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
