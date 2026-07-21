import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge, EmptyState } from "../components/ui";
import { getLeaveTypes, applyLeave, getUserLeaveRequests, getAllLeaveBalances, getUpcomingHolidays } from "../lib/store";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, MenuItem, Alert, Fade, Grow } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "notistack";
import { PartyPopper } from "lucide-react";
import dayjs from "dayjs";

const ISO = "YYYY-MM-DD";

const schema = Yup.object({
  leaveTypeId: Yup.string().required("Required"),
  startDate: Yup.string().required("Pick a start date"),
  endDate: Yup.string()
    .required("Pick an end date")
    .test("after-start", "End date can't be before start date", function (value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      return value >= startDate;
    }),
  reason: Yup.string().trim().min(3, "Give a brief reason").required("Required"),
});

export default function Leave() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [holidays, setHolidays] = useState([]);

  function refresh() {
    setTypes(getLeaveTypes());
    setRequests(getUserLeaveRequests(user.id));
    setBalances(getAllLeaveBalances(user.id));
    setHolidays(getUpcomingHolidays(3));
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const formik = useFormik({
    initialValues: { leaveTypeId: "", startDate: "", endDate: "", reason: "" },
    validationSchema: schema,
    enableReinitialize: false,
    onSubmit: (values, { setStatus, setSubmitting, resetForm }) => {
      const res = applyLeave(user.id, values);
      if (!res.ok) {
        setStatus({ type: "error", text: res.error });
        setSubmitting(false);
        enqueueSnackbar(res.error, { variant: "error" });
        return;
      }
      setStatus({ type: "success", text: "Leave request submitted." });
      enqueueSnackbar("Leave request submitted for approval", { variant: "success" });
      resetForm({ values: { ...values, startDate: "", endDate: "", reason: "" } });
      refresh();
    },
  });

  useEffect(() => {
    if (types.length && !formik.values.leaveTypeId) {
      formik.setFieldValue("leaveTypeId", types[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types]);

  return (
    <div>
      <PageHeader eyebrow="Time off" title="Leave management" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }} className="leave-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Apply for leave</div>
            <form onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <TextField
                select
                fullWidth
                label="Leave type"
                name="leaveTypeId"
                value={formik.values.leaveTypeId}
                onChange={formik.handleChange}
              >
                {types.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                ))}
              </TextField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <DatePicker
                  label="Start date"
                  format="DD-MM-YYYY"
                  value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                  onChange={(v) => formik.setFieldValue("startDate", v && v.isValid() ? v.format(ISO) : "")}
                  onClose={() => formik.setFieldTouched("startDate", true)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onBlur: formik.handleBlur,
                      name: "startDate",
                      error: formik.touched.startDate && !!formik.errors.startDate,
                      helperText: formik.touched.startDate && formik.errors.startDate,
                    },
                  }}
                />
                <DatePicker
                  label="End date"
                  format="DD-MM-YYYY"
                  minDate={formik.values.startDate ? dayjs(formik.values.startDate) : undefined}
                  value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                  onChange={(v) => formik.setFieldValue("endDate", v && v.isValid() ? v.format(ISO) : "")}
                  onClose={() => formik.setFieldTouched("endDate", true)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onBlur: formik.handleBlur,
                      name: "endDate",
                      error: formik.touched.endDate && !!formik.errors.endDate,
                      helperText: formik.touched.endDate && formik.errors.endDate,
                    },
                  }}
                />
              </div>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Reason"
                name="reason"
                placeholder="Briefly describe the reason"
                value={formik.values.reason}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.reason && !!formik.errors.reason}
                helperText={formik.touched.reason && formik.errors.reason}
              />

              {formik.status && (
                <Fade in>
                  <Alert severity={formik.status.type} sx={{ borderRadius: 2 }}>{formik.status.text}</Alert>
                </Fade>
              )}

              <Button variant="amber" type="submit">
                Submit request
              </Button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Balance
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {balances.map((b) => (
                  <div key={b.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}>{b.name}</span>
                    <span style={{ fontWeight: 800 }}>{b.remaining} / {b.quota}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {holidays.length > 0 && (
            <Card style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13, marginBottom: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                <PartyPopper size={15} /> Upcoming holidays
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {holidays.map((h) => (
                  <div key={h.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                    <span style={{ fontWeight: 700 }}>{h.name}</span>
                    <span style={{ color: "var(--muted)" }}>
                      {new Date(h.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card style={{ padding: 0, overflow: "hidden", alignSelf: "start" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", fontWeight: 800, fontSize: 15 }}>
            My requests
          </div>
          {requests.length === 0 ? (
            <EmptyState title="No leave requests yet" hint="Requests you submit will show up here." />
          ) : (
            <div>
              {requests.map((r, i) => {
                const type = types.find((t) => t.id === r.leaveTypeId);
                const tone = r.status === "approved" ? "teal" : r.status === "rejected" ? "danger" : "amber";
                return (
                  <Grow in key={r.id} style={{ transformOrigin: "top" }} timeout={300 + i * 60}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{type?.name}</div>
                        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
                          {r.startDate} → {r.endDate} · {r.days} day{r.days > 1 ? "s" : ""}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{r.reason}</div>
                      </div>
                      <Badge tone={tone}>{r.status}</Badge>
                    </div>
                  </Grow>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .leave-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
