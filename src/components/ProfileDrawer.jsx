import {
  Dialog,
  DialogContent,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Typography,
  Divider,
  useMediaQuery,
  Slide,
  Box,
} from "@mui/material";
import { forwardRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { getCompanyById, getAllLeaveBalances, getMonthlyAttendance } from "../lib/store";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Centered modal (full-screen on small viewports) showing a full read-only
// profile for any employee — used by HR to inspect details, role, and
// standing without leaving the page.
export default function ProfileDrawer({ person, onClose }) {
  const fullScreen = useMediaQuery("(max-width:640px)");
  if (!person) return null;

  const company = getCompanyById(person.companyId);
  const balances = getAllLeaveBalances(person.id);
  const now = new Date();
  const monthRecords = getMonthlyAttendance(person.id, now.getFullYear(), now.getMonth());
  const presentDays = monthRecords.filter((r) => r.punchOut).length;

  return (
    <Dialog
      open={!!person}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 4 } }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, position: "relative" }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 14, right: 14, bgcolor: "var(--surface-sunk)" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: person.color, fontWeight: 800, fontSize: 22 }}>
            {person.name.split(" ").map((n) => n[0]).join("")}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 19 }}>{person.name}</Typography>
            <Typography sx={{ fontSize: 13.5, color: "var(--muted)" }}>{person.designation}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
              <Chip
                size="small"
                label={person.role === "admin" ? "HR / Admin" : "Employee"}
                sx={{
                  bgcolor: person.role === "admin" ? "var(--amber-soft)" : "var(--teal-soft)",
                  color: person.role === "admin" ? "#8a5717" : "var(--teal)",
                }}
              />
              <Chip size="small" label={person.employeeId || "—"} sx={{ bgcolor: "var(--surface-sunk)" }} />
            </Stack>
          </Box>
        </Stack>

        <Section title="Organization">
          <Row label="Employee ID" value={person.employeeId || "Not assigned"} />
          <Row label="Company" value={company?.name} />
          <Row label="Department" value={person.department} />
          <Row label="Designation" value={person.designation} />
          <Row label="Role" value={person.role === "admin" ? "HR / Admin" : "Employee"} />
          <Row label="Joined" value={new Date(person.joinDate).toLocaleDateString()} />
        </Section>

        <Section title="Contact">
          <Row label="Email" value={person.email} />
          <Row label="Phone" value={person.phone} />
          <Row label="Username" value={person.username} />
        </Section>

        <Section title="Payroll">
          <Row label="Base salary" value={`₹${person.baseSalary.toLocaleString("en-IN")}/mo`} />
        </Section>

        <Section title="Door access">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {["mainDoor", "inside", "outside"].map((key) => {
              const labels = { mainDoor: "Main door", inside: "Inside", outside: "Outside" };
              const granted = person.doorAccess?.[key];
              return (
                <Chip
                  key={key}
                  size="small"
                  label={labels[key]}
                  sx={{
                    bgcolor: granted ? "var(--teal-soft)" : "var(--surface-sunk)",
                    color: granted ? "var(--teal)" : "var(--muted)",
                    fontWeight: 700,
                  }}
                />
              );
            })}
          </Stack>
        </Section>

        <Section title="This month" last>
          <Row label="Present days" value={presentDays} />
          {balances.map((b) => (
            <Row key={b.code} label={`${b.name} balance`} value={`${b.remaining} / ${b.quota} days`} />
          ))}
        </Section>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children, last }) {
  return (
    <Box sx={{ mb: last ? 0 : 2.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6, mb: 1.2 }}>
        {title}
      </Typography>
      <Stack spacing={1}>{children}</Stack>
      {!last && <Divider sx={{ mt: 2.5 }} />}
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, textAlign: "right", wordBreak: "break-word" }}>{value}</Typography>
    </Stack>
  );
}
