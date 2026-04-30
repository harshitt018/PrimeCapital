import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/auth.service";
import { useTheme } from "../../../hooks/useTheme";
import {
  Shield,
  Users,
  Zap,
  Eye,
  EyeOff,
  Check,
  X,
  Lock,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import logoDark from "../../assets/logo-dark.png";
import logoLight from "../../assets/logo-light.png";

/* ═══════════════════════════════════════════════════
   PASSWORD STRENGTH
═══════════════════════════════════════════════════ */
const passwordStrength = (password) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#]/.test(password),
  };
  Object.values(checks).forEach((v) => {
    if (v) score++;
  });

  const levels = [
    { label: "Weak", color: "#ef4444", pct: 20 },
    { label: "Weak", color: "#ef4444", pct: 20 },
    { label: "Fair", color: "#f97316", pct: 40 },
    { label: "Good", color: "#f59e0b", pct: 60 },
    { label: "Strong", color: "#84cc16", pct: 80 },
    { label: "Very Strong", color: "#22c55e", pct: 100 },
  ];
  const { label, color, pct: percentage } = levels[score];
  return { label, color, percentage, checks, score };
};

/* ═══════════════════════════════════════════════════
   ALERT MODAL
═══════════════════════════════════════════════════ */
function AlertModal({ type, message, onClose }) {
  const cfg = {
    success: {
      icon: <CheckCircle2 size={32} className="text-white" />,
      iconBg: "bg-green-500",
      title: "Success!",
      titleColor: "text-green-700",
      btn: "bg-green-500 hover:bg-green-600",
      accent: "border-t-4 border-green-500",
    },
    error: {
      icon: <AlertCircle size={32} className="text-white" />,
      iconBg: "bg-red-500",
      title: "Error",
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
   MAIN REGISTER
═══════════════════════════════════════════════════ */
export default function Register() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const strength = passwordStrength(form.password);
  const passwordMismatch =
    form.confirmPassword && form.password !== form.confirmPassword;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      setAlert({ type: "error", message: "Full name is required." });
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setAlert({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    if (!strength.checks.length) {
      setAlert({
        type: "error",
        message: "Password must be at least 8 characters.",
      });
      return;
    }
    if (!strength.checks.uppercase || !strength.checks.lowercase) {
      setAlert({
        type: "error",
        message: "Password must contain both uppercase and lowercase letters.",
      });
      return;
    }
    if (!strength.checks.number) {
      setAlert({
        type: "error",
        message: "Password must contain at least one number.",
      });
      return;
    }
    if (!strength.checks.special) {
      setAlert({
        type: "error",
        message: "Password must contain a special character (@$!%*?&#).",
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      const data = err?.response?.data;
      let msg = "Registration failed. Please try again.";
      if (data?.message) {
        msg = data.message;
      } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
        msg = data.errors
          .map((e) => e.msg || e.message || JSON.stringify(e))
          .join(" · ");
      }
      setAlert({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    width: "100%",
    borderRadius: "12px",
    border: `2px solid var(--border)`,
    background: "var(--bg-input)",
    color: "var(--text-primary)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    padding: "12px 14px 12px 44px",
  };
  const onFocus = (e) => {
    e.target.style.borderColor = "#2563eb";
    e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
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
        <div className="w-full max-w-lg">
          {/* ── TOP: Logo + header ── */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={isDark ? logoDark : logoLight}
              alt="PrimeCapital"
              className="h-20 object-contain mb-4 transition-all duration-300"
            />
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-center"
              style={{ color: "var(--text-primary)" }}
            >
              Create Your Business Account
            </h2>
            <p
              className="text-sm mt-2 text-center leading-relaxed max-w-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Join thousands of manufacturers who trust PrimeCapital for GST
              Invoice & Business Management.
            </p>
          </div>

          {/* ── Feature badges ── */}
          <div className="flex justify-center gap-6 sm:gap-16 mb-6 flex-wrap">
            {[
              [Shield, "GST Compliant", "text-green-500"],
              [Users, "Customer Management", "text-blue-500"],
              [Zap, "Quick Invoicing", "text-amber-500"],
            ].map(([Icon, label, cls]) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <Icon size={30} className={cls} />
                <span
                  className="text-xs font-medium text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* ── FORM CARD ── */}
          <div
            className="rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Top accent */}
            <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500" />

            <div className="px-7 py-8 sm:px-10 space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    style={inputBase}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required
                  />
                </div>
              </div>

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
                    size={15}
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
                    style={inputBase}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required
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
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    style={{ ...inputBase, paddingRight: "44px" }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{
                      color: "var(--text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Must include uppercase, lowercase, number and special
                  character
                </p>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs font-bold"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {strength.percentage}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full rounded-full overflow-hidden"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${strength.percentage}%`,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    {[
                      { label: "8+ characters", check: strength.checks.length },
                      {
                        label: "Uppercase letter",
                        check: strength.checks.uppercase,
                      },
                      {
                        label: "Lowercase letter",
                        check: strength.checks.lowercase,
                      },
                      { label: "Number", check: strength.checks.number },
                      {
                        label: "Special char (@$!%*?&#)",
                        check: strength.checks.special,
                      },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        {req.check ? (
                          <Check
                            size={12}
                            className="text-green-500 shrink-0"
                          />
                        ) : (
                          <X size={12} className="text-red-400  shrink-0" />
                        )}
                        <span
                          className="text-xs"
                          style={{
                            color: req.check ? "#22c55e" : "var(--text-muted)",
                          }}
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  className="block text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    style={{
                      ...inputBase,
                      paddingRight: "44px",
                      borderColor: passwordMismatch
                        ? "#ef4444"
                        : "var(--border)",
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{
                      color: "var(--text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-xs text-red-500 font-medium">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb, #3b82f6, #2563eb)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />{" "}
                    Creating Account...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} /> Create Account
                  </>
                )}
              </button>

              {/* Sign in */}
              <p
                className="text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-bold text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              </p>
            </div>
            <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500" />
          </div>

          {/* ── FOOTER ── */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex justify-center gap-6 flex-wrap">
              {[
                [Shield, "Secure & Encrypted", "text-green-500"],
                [Check, "GST Management", "text-blue-500"],
                [Lock, "24/7 Support", "text-amber-500"],
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
            <div
              className="text-xs space-y-1"
              style={{ color: "var(--text-muted)" }}
            >
              <p>
                Powered by Harshit Jaiswal Co. · India's most trusted Business
                Manager
              </p>
              <p>
                Trusted by 1000+ manufacturers · © 2025 PrimeCapital. All rights
                reserved.
              </p>
              <p>
                Need help?{" "}
                <a
                  href="mailto:bscit.harshitjaiswal@gmail.com"
                  className="text-blue-500 hover:underline"
                >
                  bscit.harshitjaiswal@gmail.com
                </a>
              </p>
            </div>
          </div>
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
