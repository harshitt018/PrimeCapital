import { Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Login from "./pages/login/Login";
import Register from "./pages/registration/Register";
import VerifyOtp from "./pages/registration/VerifyOtp";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";

// Layout
import MainLayout from "./layout/MainLayout";

// Protected pages
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/customers/Customers";
import Invoices from "./pages/invoices/Invoices";
import Payments from "./pages/payments/Payments";
import Reports from "./pages/reports/Reports";
import Settings from "./pages/settings/Settings";
import EditInvoice from "./pages/invoices/EditInvoice";

// Utils
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";

function App() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes with Layout */}
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/invoice/edit/:id" element={<EditInvoice />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
