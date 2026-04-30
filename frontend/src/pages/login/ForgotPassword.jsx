import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Loader2,
  Send,
} from "lucide-react";
import { forgotPassword } from "../../../services/auth.service";
import { useTheme } from "../../../hooks/useTheme";

import logoDark from "../../assets/logo-dark.png";
import logoLight from "../../assets/logo-light.png";

/* ═══════════════════════════════════════════════════
   ALERT MODAL
═══════════════════════════════════════════════════ */
function AlertModal({ type, message, onClose }) {
  const isSuccess = type === "success";
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
        className="w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl"
        style={{ background: "#fff", animation: "scaleIn 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
        >
          {isSuccess ? (
            <CheckCircle2 size={32} className="text-white" />
          ) : (
            <AlertCircle size={32} className="text-white" />
          )}
        </div>
        <h3
          className={`text-lg font-bold mb-2 ${isSuccess ? "text-green-700" : "text-red-700"}`}
        >
          {isSuccess ? "OTP Sent!" : "Request Failed"}
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${isSuccess ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
        >
          OK
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN FORGOT PASSWORD
═══════════════════════════════════════════════════ */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const isFormValid = email.trim() !== "";

  const closeAlert = () => {
    const wasSuccess = alert?.type === "success";
    setAlert(null);
    if (wasSuccess) navigate("/reset-password", { state: { email } });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);
    try {
      await forgotPassword({ email });
      setAlert({
        type: "success",
        message: "OTP sent to your email. Please check your inbox.",
      });
    } catch (err) {
      setAlert({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
          onClose={closeAlert}
        />
      )}

      <div
        className="min-h-screen flex items-center justify-center p-4 sm:p-6"
        style={{
          background: "var(--bg-base)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
          transition: "background 0.3s ease",
        }}
      >
        {/* ── CARD ── */}
        <div
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Top accent */}
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500" />

          <div className="px-8 py-10 sm:px-10">
            {/* Back button */}
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm font-semibold mb-6 transition-all duration-200 hover:-translate-x-1"
              style={{
                color: "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>

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
                Forgot Password?
              </h2>
              <p
                className="text-sm mt-2 text-center leading-relaxed max-w-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Enter your registered email and we'll send you an OTP to reset
                your password.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Email input */}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    style={inputStyle}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !isFormValid}
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
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send OTP
                  </>
                )}
              </button>

              {/* Sign in link */}
              <p
                className="text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Remember your password?{" "}
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
          </div>
          <div className="h-2.5 w-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500" />
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
