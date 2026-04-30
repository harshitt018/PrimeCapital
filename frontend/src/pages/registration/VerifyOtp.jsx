import { useState, useEffect } from "react";
import {
  Clock,
  Mail,
  RefreshCw,
  Shield,
  AlertCircle,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import { useLocation } from "react-router-dom";
import logoDark from "../../assets/logo-dark.png";
import logoLight from "../../assets/logo-light.png";
import {
  verifyRegisterOtp,
  resendRegisterOtp,
} from "../../../services/auth.service";

/* ═══════════════════════════════════════════════════
   ALERT MODAL
═══════════════════════════════════════════════════ */
function AlertModal({ type, title, message, onClose }) {
  const cfg = {
    error: { bg: "bg-red-500", Icon: AlertCircle, titleCls: "text-red-700" },
    info: { bg: "bg-blue-500", Icon: Info, titleCls: "text-blue-700" },
    success: {
      bg: "bg-green-500",
      Icon: CheckCircle2,
      titleCls: "text-green-700",
    },
  }[type] || { bg: "bg-blue-500", Icon: Info, titleCls: "text-blue-700" };

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
          className={`w-16 h-16 rounded-full ${cfg.bg} flex items-center justify-center mx-auto mb-5`}
        >
          <cfg.Icon size={32} className="text-white" />
        </div>
        <h3 className={`text-lg font-bold mb-2 ${cfg.titleCls}`}>{title}</h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95 ${cfg.bg} hover:opacity-90`}
        >
          OK
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN VERIFY OTP
═══════════════════════════════════════════════════ */
export default function VerifyOtp() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const email = location.state?.email || "user@example.com";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [resendAvailable, setResendAvailable] = useState(60);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alertModal, setAlertModal] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setIsInitialLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  useEffect(() => {
    if (resendAvailable <= 0) return;
    const t = setInterval(() => setResendAvailable((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendAvailable]);

  const fmt = (s) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5)
      document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    const next = newOtp.findIndex((v) => !v);
    document.getElementById(`otp-${next !== -1 ? next : 5}`)?.focus();
  };

  const submitOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setAlertModal({
        show: true,
        type: "error",
        title: "Incomplete OTP",
        message: "Please enter all 6 digits.",
      });
      return;
    }
    setLoading(true);
    try {
      await verifyRegisterOtp({ email, code });
      setShowSuccess(true);
    } catch (err) {
      setAlertModal({
        show: true,
        type: "error",
        title: "Invalid Code",
        message: err?.response?.data?.message || "Invalid or expired OTP.",
      });
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    try {
      await resendRegisterOtp({ email });
      setTimeLeft(15 * 60);
      setResendAvailable(60);
      setOtp(["", "", "", "", "", ""]);
      setAlertModal({
        show: true,
        type: "info",
        title: "OTP Resent",
        message: "Check your email for the new verification code.",
      });
      document.getElementById("otp-0")?.focus();
    } catch (err) {
      setAlertModal({
        show: true,
        type: "error",
        title: "Resend Failed",
        message: err?.response?.data?.message || "Failed to resend OTP.",
      });
    } finally {
      setResending(false);
    }
  };

  const isExpired = timeLeft <= 0;
  const canResend = resendAvailable <= 0;
  const canSubmit = otp.every((d) => d !== "") && !isExpired;

  return (
    <>
      {/* Alert Modal */}
      {alertModal.show && (
        <AlertModal
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          onClose={() =>
            setAlertModal({ show: false, type: "", title: "", message: "" })
          }
        />
      )}

      {/* Initial Loading */}
      {isInitialLoading && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-10 text-center shadow-2xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="relative w-14 h-14 mx-auto mb-5">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `4px solid var(--border)`,
                  borderTop: "4px solid #2563eb",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <div
                className="absolute rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                style={{ inset: "8px" }}
              >
                <Mail size={14} className="text-white" />
              </div>
            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Sending OTP...
            </h3>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Sending verification code to your email
            </p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "scaleIn 0.25s ease",
            }}
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-white" />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Email Verified!
            </h3>
            <p
              className="text-sm mb-6 leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Your email has been verified. You can now login to your account.
            </p>
            <button
              onClick={() => {
                window.location.href = "/login";
              }}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6"
        style={{
          background: "var(--bg-base)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
          transition: "background 0.3s ease",
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* ── BLUE HEADER ── */}
          <div
            className="px-8 py-8 text-center"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
            }}
          >
            <img
              src={isDark ? logoDark : logoLight}
              alt="PrimeCapital"
              className="h-20 object-contain mx-auto mb-5 transition-all duration-300"
            />
            <h2 className="text-xl font-bold text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              We've sent a 6-digit code to
              <br />
              <span className="font-bold text-white">{email}</span>
            </p>
          </div>

          {/* ── CONTENT ── */}
          <div className="px-7 py-7 sm:px-10 space-y-5">
            {/* Timer */}
            <div
              className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl"
              style={{
                background: isExpired ? "var(--red-bg)" : "var(--primary-bg)",
                border: `1px solid ${isExpired ? "var(--red)" : "var(--primary)"}`,
              }}
            >
              <Clock
                size={16}
                style={{ color: isExpired ? "var(--red)" : "var(--primary)" }}
              />
              <span
                className="text-sm font-bold"
                style={{
                  color: isExpired ? "var(--red-text)" : "var(--primary)",
                }}
              >
                {isExpired
                  ? "Code Expired — Please resend"
                  : `Expires in ${fmt(timeLeft)}`}
              </span>
            </div>

            {/* OTP Inputs */}
            <div>
              <label
                className="block text-sm font-bold mb-3 text-center"
                style={{ color: "var(--text-primary)" }}
              >
                Enter 6-digit verification code
              </label>
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={isExpired}
                    autoComplete="off"
                    className="w-full h-14 text-center text-xl font-bold rounded-xl transition-all duration-200"
                    style={{
                      border: `2px solid ${digit ? "#2563eb" : "var(--border)"}`,
                      background: isExpired
                        ? "var(--bg-subtle)"
                        : "var(--bg-input)",
                      color: isExpired
                        ? "var(--text-muted)"
                        : "var(--text-primary)",
                      outline: "none",
                      cursor: isExpired ? "not-allowed" : "text",
                    }}
                    onFocus={(e) => {
                      if (!isExpired) {
                        e.target.style.borderColor = "#2563eb";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(37,99,235,0.15)";
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "none";
                      if (!digit) e.target.style.borderColor = "var(--border)";
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={submitOtp}
              disabled={!canSubmit || loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #2563eb, #3b82f6, #2563eb)"
                  : "linear-gradient(135deg, #94a3b8, #64748b)",
              }}
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    style={{ animation: "spin 0.7s linear infinite" }}
                  />{" "}
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Verify Email
                </>
              )}
            </button>

            {/* Resend */}
            <div
              className="text-center pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <p
                className="text-sm mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Didn't receive the code?
              </p>
              <button
                onClick={resendOtp}
                disabled={resending || !canResend}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed"
                style={{
                  color:
                    canResend && !resending
                      ? "var(--primary)"
                      : "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: canResend && !resending ? "pointer" : "not-allowed",
                }}
                onMouseEnter={(e) => {
                  if (canResend && !resending)
                    e.currentTarget.style.background = "var(--primary-bg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                }}
              >
                <RefreshCw
                  size={14}
                  style={{
                    animation: resending ? "spin 1s linear infinite" : "none",
                  }}
                />
                {resending
                  ? "Sending..."
                  : canResend
                    ? "Resend Code"
                    : `Resend in ${resendAvailable}s`}
              </button>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            className="px-7 py-5 sm:px-10 text-center"
            style={{
              background: "var(--bg-subtle)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="flex justify-center gap-6 mb-4 flex-wrap">
              {[
                [Shield, "Secure & Encrypted", "text-green-500"],
                [Mail, "Email Verification", "text-blue-500"],
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
              © 2025 PrimeCapital · Need help?{" "}
              <a
                href="mailto:bscit.harshitjaiswal@gmail.com"
                className="text-blue-500 hover:underline"
              >
                Contact Support
              </a>
            </p>
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
