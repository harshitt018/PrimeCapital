import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  FileText,
  HeadphonesIcon,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import { loginUser } from "../../../services/auth.service";
import { useTheme } from "../../../hooks/useTheme";

import logoDark from "../../assets/logo-dark.png";
import logoLight from "../../assets/logo-light.png";

/* ═══════════════════════════════════════════════════
   ALERT MODAL
═══════════════════════════════════════════════════ */
function AlertModal({ type, message, onClose }) {
  const cfg = {
    success: {
      icon: <CheckCircle2 size={32} className="text-white" />,
      iconBg: "bg-green-500",
      title: "Login Successful!",
      titleColor: "text-green-700",
      btn: "bg-green-500 hover:bg-green-600",
      accent: "border-t-4 border-green-500",
    },
    error: {
      icon: <AlertCircle size={32} className="text-white" />,
      iconBg: "bg-red-500",
      title: "Login Failed",
      titleColor: "text-red-700",
      btn: "bg-red-500 hover:bg-red-600",
      accent: "border-t-4 border-red-500",
    },
    info: {
      icon: <AlertCircle size={32} className="text-white" />,
      iconBg: "bg-blue-500",
      title: "Info",
      titleColor: "text-blue-700",
      btn: "bg-blue-500 hover:bg-blue-600",
      accent: "border-t-4 border-blue-500",
    },
  };
  const c = cfg[type] || cfg.error;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl text-center shadow-2xl overflow-hidden ${c.accent}`}
        style={{
          background: "var(--bg-card)",
          animation: "scaleIn 0.25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${c.iconBg}`}
          >
            {c.icon}
          </div>
          <h3 className={`text-lg font-bold mb-2 ${c.titleColor}`}>
            {c.title}
          </h3>
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {message}
          </p>
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${c.btn}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN LOGIN
═══════════════════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const isFormValid = form.email.trim() !== "" && form.password.trim() !== "";

  const handleSubmit = async (e) => {
    e?.preventDefault();
    console.log("handleSubmit called", form);
    if (loading) return;
    if (!form.email.trim()) {
      setAlert({ type: "error", message: "Please enter your email address." });
      return;
    }
    if (!form.password.trim()) {
      setAlert({ type: "error", message: "Please enter your password." });
      return;
    }
    setLoading(true);
    try {
      // ── Step 1: Login ──
      const res = await loginUser(form);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.user));

      // ── Step 2: Company (optional — don't block login if fails) ──
      try {
        const companyRes = await api.get("/company");
        if (companyRes.data?._id) {
          localStorage.setItem("companyId", companyRes.data._id);
          localStorage.setItem("hasCompany", "true");
        }
      } catch {
        // Company not found — that's ok, Dashboard will handle it
        localStorage.setItem("hasCompany", "false");
      }

      setAlert({
        type: "success",
        message: "Welcome back! Redirecting to your dashboard...",
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Login error:", err);
      const data = err?.response?.data;
      let msg = "Invalid email or password. Please try again.";
      if (data?.message) msg = data.message;
      setAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  // input style helper
  const inputStyle = {
    width: "100%",
    padding: "12px 14px 12px 44px",
    borderRadius: "12px",
    border: `2px solid var(--border)`,
    background: "var(--bg-input)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  return (
    <>
      {alert && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6"
        style={{
          background: "var(--bg-base)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
          transition: "background 0.3s ease",
        }}
      >
        {/* ── LOGIN CARD ── */}
        <div
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Card top accent */}
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500" />

          <div className="px-8 py-10 sm:px-10">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <img
                src={isDark ? logoDark : logoLight}
                alt="PrimeCapital"
                className="h-20 object-contain mb-5 transition-all duration-300"
              />
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Welcome Back
              </h2>
              <p
                className="text-sm mt-2 text-center leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                Sign in to manage invoices, customers and track your business
                growth.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    autoComplete="email"
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#2563eb";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(37,99,235,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: "44px" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#2563eb";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(37,99,235,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors duration-200"
                    style={{
                      color: "var(--text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label
                  className="flex items-center gap-2 cursor-pointer text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: "#2563eb" }}
                  />
                  Remember me
                </label>
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                style={{
                  background:
                    loading || !isFormValid
                      ? "linear-gradient(135deg, #94a3b8, #64748b)"
                      : "linear-gradient(135deg, #2563eb, #3b82f6, #2563eb)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />{" "}
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>

              {/* Sign up */}
              <p
                className="text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-bold text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500" />
        </div>

        {/* ── FOOTER ── */}
        <div className="mt-8 text-center space-y-4 w-full max-w-md">
          <div className="flex justify-center gap-6 flex-wrap">
            {[
              [ShieldCheck, "Secure & Encrypted", "text-green-500"],
              [FileText, "GST Management", "text-blue-500"],
              [HeadphonesIcon, "24/7 Support", "text-amber-500"],
            ].map(([Icon, label, cls]) => (
              <span
                key={label}
                className={`flex items-center gap-1.5 text-xs font-medium ${cls}`}
              >
                <Icon size={13} />{" "}
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
              </span>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2025 PrimeCapital. All rights reserved. · Need help?{" "}
            <a
              href="mailto:bscit.harshitjaiswal@gmail.com"
              className="text-blue-500 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
