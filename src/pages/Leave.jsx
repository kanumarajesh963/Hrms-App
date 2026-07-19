import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge, EmptyState } from "../components/ui";
import { getLeaveTypes, applyLeave, getUserLeaveRequests, getAllLeaveBalances } from "../lib/store";
import { useFormik } from "formik";
import * as Yup from "yup";
import { TextField, MenuItem, Alert, Fade, Grow } from "@mui/material";

const schema = Yup.object({
  leaveTypeId: Yup.string().required("Required"),
  startDate: Yup.date().required("Required"),
  endDate: Yup.date().min(Yup.ref("startDate"), "End date can't be before start date").required("Required"),
  reason: Yup.string().trim().min(3, "Give a brief reason").required("Required"),
});

export default function Leave() {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);

  function refresh() {
    setTypes(getLeaveTypes());
    setRequests(getUserLeaveRequests(user.id));
    setBalances(getAllLeaveBalances(user.id));
  }

  useEffect(() => {
    refresh();
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
        return;
      }
      setStatus({ type: "success", text: "Leave request submitted." });
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
              <TextField
                fullWidth
                type="date"
                label="Start date"
                name="startDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.startDate && !!formik.errors.startDate}
                helperText={formik.touched.startDate && formik.errors.startDate}
              />
              <TextField
                fullWidth
                type="date"
                label="End date"
                name="endDate"
                InputLabelProps={{ shrink: true }}
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.endDate && !!formik.errors.endDate}
                helperText={formik.touched.endDate && formik.errors.endDate}
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
