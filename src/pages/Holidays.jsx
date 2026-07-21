import { useEffect, useState } from "react";
import { PageHeader, Card, Badge } from "../components/ui";
import { getHolidays, getNextHoliday } from "../lib/store";
import { Grow } from "@mui/material";
import { PartyPopper } from "lucide-react";

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [next, setNext] = useState(null);

  useEffect(() => {
    setHolidays(getHolidays());
    setNext(getNextHoliday());
  }, []);

  function daysAway(date) {
    const diff = Math.round((new Date(date) - new Date(new Date().toDateString())) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  }

  return (
    <div>
      <PageHeader eyebrow="Time off" title="Holiday calendar" />

      {next && (
        <Card
          style={{
            padding: "22px 24px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            background: "linear-gradient(135deg, var(--amber-soft), var(--surface))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--amber)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <PartyPopper size={22} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Next holiday
              </div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{next.name}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>
              {new Date(next.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{daysAway(next.date)}</div>
          </div>
        </Card>
      )}

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", fontWeight: 800, fontSize: 15 }}>
          All holidays this year
        </div>
        <div>
          {holidays.map((h, i) => {
            const past = h.date < new Date().toISOString().slice(0, 10);
            return (
              <Grow in key={h.id} timeout={250 + i * 40} style={{ transformOrigin: "top" }}>
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    opacity: past ? 0.5 : 1,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 50, textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase" }}>
                        {new Date(h.date).toLocaleDateString(undefined, { month: "short" })}
                      </div>
                      <div style={{ fontSize: 19, fontWeight: 800 }}>{new Date(h.date).getDate()}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{h.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--muted)" }}>
                        {new Date(h.date).toLocaleDateString(undefined, { weekday: "long" })}
                      </div>
                    </div>
                  </div>
                  <Badge tone={h.type === "public" ? "teal" : "amber"}>
                    {h.type === "public" ? "Public holiday" : "Restricted holiday"}
                  </Badge>
                </div>
              </Grow>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
