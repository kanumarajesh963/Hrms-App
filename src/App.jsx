import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppShell from "./components/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Holidays from "./pages/Holidays";
import Payslips from "./pages/Payslips";
import Profile from "./pages/Profile";
import Approvals from "./pages/Approvals";
import Employees from "./pages/Employees";
import Biometrics from "./pages/Biometrics";
import AccessControl from "./pages/AccessControl";

function Protected({ children, adminOnly = false }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicOnly({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/attendance" element={<Protected><Attendance /></Protected>} />
          <Route path="/leave" element={<Protected><Leave /></Protected>} />
          <Route path="/holidays" element={<Protected><Holidays /></Protected>} />
          <Route path="/payslips" element={<Protected><Payslips /></Protected>} />
          <Route path="/biometrics" element={<Protected><Biometrics /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/approvals" element={<Protected adminOnly><Approvals /></Protected>} />
          <Route path="/employees" element={<Protected adminOnly><Employees /></Protected>} />
          <Route path="/access-control" element={<Protected adminOnly><AccessControl /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
