import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../../hooks/useTheme";
import {
  User,
  Building2,
  FileText,
  Landmark,
  Phone,
  Mail,
  Camera,
  MapPin,
  Hash,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Settings as SettingsIcon,
  Loader2,
  Shield,
  Percent,
  FolderOpen,
  AlignLeft,
  Edit3,
  Trash2,
  Lock,
  KeyRound,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
} from "../../../services/settings.service";
import { changePassword } from "../../../services/auth.service";

/* ── Toast ── */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);
  const removeToast = useCallback(
    (id) => setToasts((p) => p.filter((t) => t.id !== id)),
    [],
  );
  return { toasts, addToast, removeToast };
}

function ToastContainer({ toasts, removeToast }) {
  const borderColor = { success: "#22c55e", error: "#ef4444", info: "#2563eb" };
  const iconColor = {
    success: "var(--green)",
    error: "var(--red)",
    info: "var(--primary)",
  };
  const C = {
    success: { Icon: CheckCircle, label: "Success" },
    error: { Icon: AlertCircle, label: "Error" },
    info: { Icon: Info, label: "Info" },
  };
  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => {
        const c = C[t.type] || C.info;
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl px-4 py-3.5 min-w-[300px] max-w-[380px] shadow-xl pointer-events-auto"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: `4px solid ${borderColor[t.type] || borderColor.info}`,
              animation: "slideInRight 0.28s ease",
            }}
          >
            <c.Icon
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: iconColor[t.type] || iconColor.info }}
            />
            <div className="flex-1">
              <p
                className="font-bold text-[13px]"
                style={{ color: "var(--text-primary)" }}
              >
                {c.label}
              </p>
              <p
                className="text-[12.5px] leading-snug mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {t.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ── ConfirmModal ── */
function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  confirmColor = "bg-blue-600 hover:bg-blue-700",
  icon: IconComp,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000] p-4"
      style={{ background: "rgba(0,0,0,0.6)", animation: "fadeIn 0.15s ease" }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          animation: "fadeUp 0.2s ease",
        }}
      >
        <div className="p-6 sm:p-8">
          {IconComp && (
            <div
              className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}
            >
              <IconComp size={22} className={iconColor} />
            </div>
          )}
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h3>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {message}
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-card)",
                border: "2px solid var(--border)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${confirmColor}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FormField ── */
function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  disabled = false,
  required = false,
  hint,
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-xs sm:text-sm font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <div
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
            style={{ color: "var(--text-muted)" }}
          >
            <Icon size={15} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="new-password"
          className={`w-full ${Icon ? "pl-10 sm:pl-11" : "pl-4"} pr-4 py-2.5 sm:py-3 rounded-xl text-sm transition-all duration-200`}
          style={{
            background: disabled ? "var(--bg-subtle)" : "var(--bg-input)",
            border: "2px solid var(--border)",
            color: disabled ? "var(--text-muted)" : "var(--text-primary)",
            cursor: disabled ? "not-allowed" : "text",
            outline: "none",
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = "#2563eb";
              e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";
              e.target.style.background = "var(--bg-card)";
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
            e.target.style.background = disabled
              ? "var(--bg-subtle)"
              : "var(--bg-input)";
          }}
        />
      </div>
      {hint && (
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── PasswordField ── */
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  required,
  show,
  onToggle,
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-xs sm:text-sm font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <Lock
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl text-sm transition-all duration-200"
          style={{
            background: "var(--bg-input)",
            border: "2px solid var(--border)",
            color: "var(--text-primary)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#2563eb";
            e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2"
          style={{
            color: "var(--text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ── FormSection ── */
function FormSection({ title, Icon, grad, ring }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div
        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md ring-4 ${ring} shrink-0`}
      >
        <Icon size={14} className="text-white" />
      </div>
      <h3
        className="text-sm font-bold uppercase tracking-wider"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </h3>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

/* ── EditBadge ── */
function EditBadge({ editing, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
      style={
        editing
          ? { background: "var(--amber-bg)", color: "var(--amber-text)" }
          : { background: "var(--primary-bg)", color: "var(--primary)" }
      }
    >
      <Edit3 size={12} />
      {editing ? "Editing..." : "Edit"}
    </button>
  );
}

/* ══════════════════════════════════════════════════
   MAIN SETTINGS
══════════════════════════════════════════════════ */
export default function Settings() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [editCompany, setEditCompany] = useState(false);
  const [editInvoice, setEditInvoice] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showNoChangesModal, setShowNoChangesModal] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [showDangerStep1, setShowDangerStep1] = useState(false);
  const [showDangerStep2, setShowDangerStep2] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showPathModal, setShowPathModal] = useState(false);
  const [tempPath, setTempPath] = useState("");

  // Password change
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: null,
  });
  const [company, setCompany] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    stateCode: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    branch: "",
    phone: "",
    email: "",
  });
  const [invoice, setInvoice] = useState({
    cgst: 2.5,
    sgst: 2.5,
    pdfPath: "",
    fileNameFormat: "",
    showBank: true,
    terms: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSettings();
      if (!data) {
        setLoading(false);
        return;
      }
      setProfile({
        name: data.profile?.name || "",
        email: data.profile?.email || "",
        phone: data.profile?.phone || "",
        avatar: null,
      });
      setCompany({
        name: data.company?.name || "",
        address: data.company?.address || "",
        city: data.company?.city || "",
        state: data.company?.state || "",
        pincode: data.company?.pincode || "",
        gstin: data.company?.gstin || "",
        stateCode: data.company?.stateCode || "",
        bankName: data.company?.bankName || "",
        accountNumber: data.company?.accountNumber || "",
        ifsc: data.company?.ifsc || "",
        branch: data.company?.branch || "",
        phone: data.company?.phone || "",
        email: data.company?.email || "",
      });
      setInvoice({
        cgst: data.invoice?.cgst || 2.5,
        sgst: data.invoice?.sgst || 2.5,
        pdfPath: data.invoice?.pdfPath || "",
        fileNameFormat: data.invoice?.fileNameFormat || "",
        showBank: data.invoice?.showBank ?? true,
        terms: data.invoice?.terms || "",
      });
      setOriginalData({
        profile: {
          name: data.profile?.name || "",
          email: data.profile?.email || "",
          phone: data.profile?.phone || "",
        },
        company: {
          name: data.company?.name || "",
          address: data.company?.address || "",
          city: data.company?.city || "",
          state: data.company?.state || "",
          pincode: data.company?.pincode || "",
          gstin: data.company?.gstin || "",
          stateCode: data.company?.stateCode || "",
          bankName: data.company?.bankName || "",
          accountNumber: data.company?.accountNumber || "",
          ifsc: data.company?.ifsc || "",
          branch: data.company?.branch || "",
          phone: data.company?.phone || "",
          email: data.company?.email || "",
        },
        invoice: {
          cgst: data.invoice?.cgst || 2.5,
          sgst: data.invoice?.sgst || 2.5,
          pdfPath: data.invoice?.pdfPath || "",
          fileNameFormat: data.invoice?.fileNameFormat || "",
          showBank: data.invoice?.showBank ?? true,
          terms: data.invoice?.terms || "",
        },
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleProfileChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleAvatar = (e) =>
    setProfile({ ...profile, avatar: e.target.files[0] });
  const handleCompanyChange = (e) =>
    setCompany({ ...company, [e.target.name]: e.target.value });
  const handleInvoiceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvoice({ ...invoice, [name]: type === "checkbox" ? checked : value });
  };

  const handleDeleteCompany = async () => {
    if (deleteConfirmText !== company.name) return;
    if (!deletePassword.trim()) {
      addToast("Please enter your password to confirm.", "error");
      return;
    }
    setDeletingCompany(true);
    try {
      const token = localStorage.getItem("accessToken");

      // Verify password first
      const verifyRes = await fetch(
        "http://localhost:5000/api/auth/verify-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: deletePassword }),
        },
      );

      if (!verifyRes.ok) {
        addToast("Incorrect password. Please try again.", "error");
        setDeletingCompany(false);
        return;
      }

      // Delete company
      const deleteRes = await fetch("http://localhost:5000/api/company", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!deleteRes.ok) throw new Error("Delete failed");

      localStorage.removeItem("companyId");
      localStorage.setItem("hasCompany", "false");
      window.dispatchEvent(new Event("companyUpdated"));
      addToast("Company deleted successfully.", "success");
      setShowDangerStep2(false);
      setDeleteConfirmText("");
      setDeletePassword("");
      setTimeout(() => (window.location.href = "/dashboard"), 1200);
    } catch (err) {
      addToast("Failed to delete company. Please try again.", "error");
    } finally {
      setDeletingCompany(false);
    }
  };

  const handleSaveAll = async () => {
    setShowSaveConfirm(false);
    setSaving(true);
    try {
      await updateSettings({ profile, company, invoice });
      const user = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, name: profile.name, email: profile.email }),
      );
      addToast("Settings saved successfully.", "success");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      addToast("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!originalData) {
      setShowSaveConfirm(true);
      return;
    }
    const profileChanged =
      profile.name !== originalData.profile.name ||
      profile.email !== originalData.profile.email ||
      profile.phone !== originalData.profile.phone ||
      profile.avatar != null;
    const companyChanged = Object.keys(originalData.company).some(
      (k) => company[k] !== originalData.company[k],
    );
    const invoiceChanged = Object.keys(originalData.invoice).some(
      (k) => String(invoice[k]) !== String(originalData.invoice[k]),
    );
    if (!profileChanged && !companyChanged && !invoiceChanged)
      setShowNoChangesModal(true);
    else setShowSaveConfirm(true);
  };

  const handleChangePassword = async () => {
    if (
      !pwForm.currentPassword ||
      !pwForm.newPassword ||
      !pwForm.confirmPassword
    ) {
      addToast("All password fields are required.", "error");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      addToast("Password must be at least 6 characters.", "error");
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm);
      addToast("Password changed! Logging out in 2 seconds...", "success");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      addToast(
        err?.response?.data?.message || "Failed to change password.",
        "error",
      );
    } finally {
      setPwLoading(false);
    }
  };

  const totalGST = Number(invoice.cgst || 0) + Number(invoice.sgst || 0);
  const headerGrad = isDark
    ? "linear-gradient(90deg,#0f172a,#1e293b,#0f172a)"
    : "linear-gradient(90deg,#f8fafc,#eff6ff,#f8fafc)";

  const inputFocus = (e) => {
    e.target.style.borderColor = "#2563eb";
    e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";
    e.target.style.background = "var(--bg-card)";
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "var(--bg-input)";
  };

  const pwMismatch =
    pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "var(--bg-base)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "4px solid var(--border)",
                borderTop: "4px solid #2563eb",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div
              className="absolute rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-lg"
              style={{ inset: "8px" }}
            >
              <SettingsIcon size={18} className="text-white" />
            </div>
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Loading Settings...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const TABS = [
    { key: "profile", label: "Profile", Icon: User },
    { key: "company", label: "Company Details", Icon: Building2 },
    { key: "invoice", label: "Invoice Settings", Icon: FileText },
    { key: "security", label: "Security", Icon: Shield },
  ];

  return (
    <div
      className="min-h-screen p-3 sm:p-6 lg:p-8"
      style={{
        background: "var(--bg-base)",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* ── HEADER ── */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl ring-4 ring-blue-100/20">
              <SettingsIcon size={24} className="text-white" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-4"
              style={{ borderColor: "var(--bg-base)" }}
            />
          </div>
          <div>
            <h1
              className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Settings
            </h1>
            <p
              className="text-xs sm:text-sm mt-0.5 sm:mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Manage your profile, company and invoice preferences
            </p>
          </div>
        </div>

        {/* ── MAIN CARD ── */}
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* TAB BAR */}
          <div
            className="flex overflow-x-auto"
            style={{
              background: headerGrad,
              borderBottom: "2px solid var(--border)",
            }}
          >
            {TABS.map(({ key, label, Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="flex items-center gap-2 px-5 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-all duration-200"
                  style={{
                    borderBottomColor: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "#2563eb" : "var(--text-muted)",
                    background: isActive ? "var(--bg-card)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.color = "var(--text-muted)";
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT */}
          <div className="p-5 sm:p-6 lg:p-8">
            {/* ═══ PROFILE TAB ═══ */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-md ring-4 ring-blue-100/20">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Profile Information
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Your personal account details
                      </p>
                    </div>
                  </div>
                  <EditBadge
                    editing={editProfile}
                    onToggle={() => setEditProfile(!editProfile)}
                  />
                </div>

                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-blue-100/20">
                      {profile.name ? profile.name[0].toUpperCase() : "U"}
                    </div>
                    <label
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 transition-colors"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--primary-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "var(--bg-card)")
                      }
                    >
                      <Camera
                        size={13}
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <input type="file" hidden onChange={handleAvatar} />
                    </label>
                  </div>
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {profile.name || "Your Name"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {profile.email || "your@email.com"}
                    </p>
                    <p
                      className="text-xs mt-1 font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      Click camera to change photo
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Full Name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    icon={User}
                    disabled={!editProfile}
                    required
                  />
                  <FormField
                    label="Email Address"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="your@email.com"
                    icon={Mail}
                    disabled={!editProfile}
                    required
                    type="email"
                  />
                  <FormField
                    label="Phone Number"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+91 12345 67890"
                    icon={Phone}
                    disabled={!editProfile}
                  />
                </div>

                {!editProfile && (
                  <div
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                    style={{
                      background: "var(--primary-bg)",
                      border: "1px solid var(--border-focus)",
                    }}
                  >
                    <Info
                      size={15}
                      className="shrink-0"
                      style={{ color: "var(--primary)" }}
                    />
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      Click <b>Edit</b> to modify your profile information.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ COMPANY TAB ═══ */}
            {activeTab === "company" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-500 flex items-center justify-center shadow-md ring-4 ring-violet-100/20">
                      <Building2 size={16} className="text-white" />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Company Details
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Business information used in invoices
                      </p>
                    </div>
                  </div>
                  <EditBadge
                    editing={editCompany}
                    onToggle={() => setEditCompany(!editCompany)}
                  />
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="Basic Information"
                    Icon={Building2}
                    grad="from-violet-500 via-violet-600 to-violet-500"
                    ring="ring-violet-100"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Company Name"
                      name="name"
                      value={company.name}
                      onChange={handleCompanyChange}
                      placeholder="Your Company Pvt. Ltd."
                      icon={Building2}
                      disabled={!editCompany}
                      required
                    />
                    <FormField
                      label="Address"
                      name="address"
                      value={company.address}
                      onChange={handleCompanyChange}
                      placeholder="Street address"
                      icon={MapPin}
                      disabled={!editCompany}
                    />
                    <FormField
                      label="City"
                      name="city"
                      value={company.city}
                      onChange={handleCompanyChange}
                      placeholder="Mumbai"
                      icon={MapPin}
                      disabled={!editCompany}
                    />
                    <FormField
                      label="State"
                      name="state"
                      value={company.state}
                      onChange={handleCompanyChange}
                      placeholder="Maharashtra"
                      icon={MapPin}
                      disabled={!editCompany}
                    />
                    <FormField
                      label="Pincode"
                      name="pincode"
                      value={company.pincode}
                      onChange={handleCompanyChange}
                      placeholder="400001"
                      icon={Hash}
                      disabled={!editCompany}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="GST Information"
                    Icon={FileText}
                    grad="from-amber-500 via-amber-600 to-amber-500"
                    ring="ring-amber-100"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="GSTIN Number"
                      name="gstin"
                      value={company.gstin}
                      onChange={handleCompanyChange}
                      placeholder="27AAAAP1234A1ZM"
                      icon={Shield}
                      disabled={!editCompany}
                      hint="15-digit GST Identification Number"
                    />
                    <FormField
                      label="State Code"
                      name="stateCode"
                      value={company.stateCode}
                      onChange={handleCompanyChange}
                      placeholder="27"
                      icon={Hash}
                      disabled={!editCompany}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="Bank Details"
                    Icon={Landmark}
                    grad="from-emerald-500 via-emerald-600 to-emerald-500"
                    ring="ring-emerald-100"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Bank Name"
                      name="bankName"
                      value={company.bankName}
                      onChange={handleCompanyChange}
                      placeholder="State Bank of India"
                      icon={Landmark}
                      disabled={!editCompany}
                    />
                    <FormField
                      label="Branch"
                      name="branch"
                      value={company.branch}
                      onChange={handleCompanyChange}
                      placeholder="Main Branch, Mumbai"
                      icon={MapPin}
                      disabled={!editCompany}
                    />
                    <FormField
                      label="Account Number"
                      name="accountNumber"
                      value={company.accountNumber}
                      onChange={handleCompanyChange}
                      placeholder="1234567890"
                      icon={CreditCard}
                      disabled={!editCompany}
                    />
                    <FormField
                      label="IFSC Code"
                      name="ifsc"
                      value={company.ifsc}
                      onChange={handleCompanyChange}
                      placeholder="SBIN0001234"
                      icon={Hash}
                      disabled={!editCompany}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="Contact Information"
                    Icon={Phone}
                    grad="from-cyan-500 via-cyan-600 to-cyan-500"
                    ring="ring-cyan-100"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Company Phone"
                      name="phone"
                      value={company.phone}
                      onChange={handleCompanyChange}
                      placeholder="+91 12345 67890"
                      icon={Phone}
                      disabled={!editCompany}
                    />
                    <FormField
                      label="Company Email"
                      name="email"
                      value={company.email}
                      onChange={handleCompanyChange}
                      placeholder="company@example.com"
                      icon={Mail}
                      disabled={!editCompany}
                      type="email"
                    />
                  </div>
                </div>

                {!editCompany && (
                  <div
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                    style={{
                      background: "var(--primary-bg)",
                      border: "1px solid var(--border-focus)",
                    }}
                  >
                    <Info
                      size={15}
                      className="shrink-0"
                      style={{ color: "var(--primary)" }}
                    />
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      Click <b>Edit</b> to modify company details.
                    </p>
                  </div>
                )}

                {/* Danger Zone */}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "2px solid var(--red)" }}
                >
                  <div
                    className="flex items-center gap-3 px-5 py-4"
                    style={{
                      background: "var(--red-bg)",
                      borderBottom: "1px solid var(--red)",
                    }}
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-500 flex items-center justify-center shadow-md ring-4 ring-red-100/20 shrink-0">
                      <AlertCircle size={14} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ color: "var(--red-text)" }}
                      >
                        Danger Zone
                      </h3>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--red-text)" }}
                      >
                        These actions are permanent and cannot be undone
                      </p>
                    </div>
                  </div>
                  <div
                    className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Delete Company
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Permanently delete{" "}
                        <span
                          className="font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {company.name || "this company"}
                        </span>{" "}
                        and all associated data. This cannot be reversed.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDangerStep1(true)}
                      className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                      style={{
                        color: "var(--red-text)",
                        background: "var(--red-bg)",
                        border: "2px solid var(--red)",
                      }}
                    >
                      <Trash2 size={13} /> Delete Company
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ INVOICE TAB ═══ */}
            {activeTab === "invoice" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-center shadow-md ring-4 ring-emerald-100/20">
                      <FileText size={16} className="text-white" />
                    </div>
                    <div>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Invoice Settings
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Tax, PDF and display configuration
                      </p>
                    </div>
                  </div>
                  <EditBadge
                    editing={editInvoice}
                    onToggle={() => setEditInvoice(!editInvoice)}
                  />
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="Tax Configuration"
                    Icon={Percent}
                    grad="from-red-500 via-red-600 to-red-500"
                    ring="ring-red-100"
                  />
                  <div className="flex items-end gap-4 flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                      <FormField
                        label="CGST (%)"
                        name="cgst"
                        value={invoice.cgst}
                        onChange={handleInvoiceChange}
                        placeholder="2.5"
                        type="number"
                        icon={Percent}
                        disabled={!editInvoice}
                        hint="Central GST percentage"
                      />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <FormField
                        label="SGST (%)"
                        name="sgst"
                        value={invoice.sgst}
                        onChange={handleInvoiceChange}
                        placeholder="2.5"
                        type="number"
                        icon={Percent}
                        disabled={!editInvoice}
                        hint="State GST percentage"
                      />
                    </div>
                    <div
                      className="flex flex-col"
                      style={{ paddingBottom: "20px" }}
                    >
                      <p
                        className="text-xs font-bold uppercase tracking-wider mb-1.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Total GST
                      </p>
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-[11px] rounded-xl whitespace-nowrap"
                        style={{
                          background: "var(--green-bg)",
                          border: "1px solid var(--green)",
                        }}
                      >
                        <Percent
                          size={12}
                          style={{ color: "var(--green-text)" }}
                        />
                        <span
                          className="text-sm font-bold"
                          style={{ color: "var(--green-text)" }}
                        >
                          {totalGST}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="PDF Configuration"
                    Icon={FolderOpen}
                    grad="from-blue-500 via-blue-600 to-blue-500"
                    ring="ring-blue-100"
                  />
                  <div className="space-y-1.5">
                    <label
                      className="block text-xs sm:text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      PDF Save Path
                    </label>
                    <div className="relative group">
                      <FolderOpen
                        size={15}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" }}
                      />
                      <input
                        type="text"
                        name="pdfPath"
                        value={invoice.pdfPath || ""}
                        onChange={handleInvoiceChange}
                        placeholder="D:/Invoices"
                        disabled={!editInvoice}
                        className="w-full pl-10 sm:pl-11 pr-12 py-2.5 sm:py-3 rounded-xl text-sm transition-all duration-200"
                        style={{
                          background: !editInvoice
                            ? "var(--bg-subtle)"
                            : "var(--bg-input)",
                          border: "2px solid var(--border)",
                          color: "var(--text-primary)",
                          outline: "none",
                          cursor: !editInvoice ? "not-allowed" : "text",
                        }}
                        onFocus={(e) => {
                          if (!editInvoice) return;
                          e.target.style.borderColor = "#2563eb";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(37,99,235,0.15)";
                          e.target.style.background = "var(--bg-card)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "var(--border)";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = !editInvoice
                            ? "var(--bg-subtle)"
                            : "var(--bg-input)";
                        }}
                      />
                      {editInvoice && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempPath(invoice.pdfPath || "");
                            setShowPathModal(true);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-subtle)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <FolderOpen size={15} />
                        </button>
                      )}
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Folder path jahan invoices save honge (e.g. D:/Invoices)
                    </p>
                  </div>
                  <FormField
                    label="File Name Format"
                    name="fileNameFormat"
                    value={invoice.fileNameFormat}
                    onChange={handleInvoiceChange}
                    placeholder="e.g. {year} {no} {customer}"
                    icon={FileText}
                    disabled={!editInvoice}
                    hint="Template for PDF file names"
                  />
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="Display Settings"
                    Icon={Eye}
                    grad="from-violet-500 via-violet-600 to-violet-500"
                    ring="ring-violet-100"
                  />
                  <div
                    className="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
                    style={{
                      border: "2px solid var(--border)",
                      background: editInvoice
                        ? "var(--bg-card)"
                        : "var(--bg-subtle)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                        <Landmark size={15} className="text-white" />
                      </div>
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Show Bank Details
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Display bank info on generated invoices
                        </p>
                      </div>
                    </div>
                    <label
                      className={`relative inline-flex items-center cursor-pointer ${!editInvoice ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <input
                        type="checkbox"
                        name="showBank"
                        checked={invoice.showBank}
                        onChange={handleInvoiceChange}
                        className="sr-only peer"
                      />
                      <div
                        className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                        style={{
                          background: invoice.showBank
                            ? ""
                            : "var(--bg-subtle)",
                          border: "2px solid var(--border)",
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormSection
                    title="Terms & Conditions"
                    Icon={AlignLeft}
                    grad="from-slate-500 via-slate-600 to-slate-500"
                    ring="ring-slate-100"
                  />
                  <div>
                    <label
                      className="block text-xs sm:text-sm font-bold mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Terms & Conditions Text
                    </label>
                    <textarea
                      name="terms"
                      value={invoice.terms}
                      onChange={handleInvoiceChange}
                      disabled={!editInvoice}
                      rows={4}
                      placeholder="Enter terms and conditions shown on invoices..."
                      className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200"
                      style={{
                        background: !editInvoice
                          ? "var(--bg-subtle)"
                          : "var(--bg-input)",
                        border: "2px solid var(--border)",
                        color: !editInvoice
                          ? "var(--text-muted)"
                          : "var(--text-primary)",
                        cursor: !editInvoice ? "not-allowed" : "text",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        if (!editInvoice) return;
                        e.target.style.borderColor = "#2563eb";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(37,99,235,0.15)";
                        e.target.style.background = "var(--bg-card)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border)";
                        e.target.style.boxShadow = "none";
                        e.target.style.background = !editInvoice
                          ? "var(--bg-subtle)"
                          : "var(--bg-input)";
                      }}
                    />
                  </div>
                </div>

                {!editInvoice && (
                  <div
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                    style={{
                      background: "var(--primary-bg)",
                      border: "1px solid var(--border-focus)",
                    }}
                  >
                    <Info
                      size={15}
                      className="shrink-0"
                      style={{ color: "var(--primary)" }}
                    />
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--primary)" }}
                    >
                      Click <b>Edit Settings</b> to modify invoice
                      configuration.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ SECURITY TAB ═══ */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 via-red-600 to-red-500 flex items-center justify-center shadow-md ring-4 ring-red-100/20">
                    <Shield size={16} className="text-white" />
                  </div>
                  <div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Security Settings
                    </h3>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Manage your password and account security
                    </p>
                  </div>
                </div>

                {/* Change Password Card */}
                <div className="space-y-4">
                  <FormSection
                    title="Change Password"
                    Icon={KeyRound}
                    grad="from-red-500 via-red-600 to-red-500"
                    ring="ring-red-100"
                  />

                  <div
                    className="rounded-2xl p-5 sm:p-6 space-y-5"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {/* Warning */}
                    <div
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                      style={{
                        background: "var(--amber-bg)",
                        border: "1px solid var(--amber)",
                      }}
                    >
                      <AlertCircle
                        size={14}
                        className="shrink-0"
                        style={{ color: "var(--amber-text)" }}
                      />
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--amber-text)" }}
                      >
                        After changing your password, you will be automatically
                        logged out for security.
                      </p>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PasswordField
                        label="Current Password"
                        value={pwForm.currentPassword}
                        onChange={(e) =>
                          setPwForm({
                            ...pwForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        required
                        show={showCurrent}
                        onToggle={() => setShowCurrent(!showCurrent)}
                      />
                      <PasswordField
                        label="New Password"
                        value={pwForm.newPassword}
                        onChange={(e) =>
                          setPwForm({ ...pwForm, newPassword: e.target.value })
                        }
                        placeholder="Enter new password (min 6 chars)"
                        required
                        show={showNew}
                        onToggle={() => setShowNew(!showNew)}
                      />
                    </div>

                    <div className="sm:max-w-sm space-y-1.5">
                      <PasswordField
                        label="Confirm New Password"
                        value={pwForm.confirmPassword}
                        onChange={(e) =>
                          setPwForm({
                            ...pwForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        required
                        show={showConfirm}
                        onToggle={() => setShowConfirm(!showConfirm)}
                      />
                      {pwMismatch && (
                        <p className="text-xs font-medium text-red-500">
                          Passwords do not match
                        </p>
                      )}
                      {pwForm.confirmPassword &&
                        !pwMismatch &&
                        pwForm.newPassword && (
                          <p
                            className="text-xs font-medium flex items-center gap-1"
                            style={{ color: "var(--green-text)" }}
                          >
                            <CheckCircle size={12} /> Passwords match
                          </p>
                        )}
                    </div>

                    {/* Buttons row */}
                    <div className="flex items-center gap-4 flex-wrap pt-1">
                      <button
                        onClick={handleChangePassword}
                        disabled={
                          pwLoading ||
                          !pwForm.currentPassword ||
                          !pwForm.newPassword ||
                          !pwForm.confirmPassword ||
                          !!pwMismatch
                        }
                        className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                        style={{
                          background:
                            "linear-gradient(135deg, #dc2626, #ef4444, #dc2626)",
                        }}
                      >
                        {pwLoading ? (
                          <>
                            <Loader2
                              size={15}
                              style={{ animation: "spin 0.7s linear infinite" }}
                            />{" "}
                            Changing...
                          </>
                        ) : (
                          <>
                            <Lock size={15} /> Change Password
                          </>
                        )}
                      </button>

                      {/* Forgot password link */}
                      <div
                        className="flex items-center gap-1.5 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <span>Forgot current password?</span>
                        <button
                          onClick={() =>
                            (window.location.href = "/forgot-password")
                          }
                          className="font-bold transition-colors duration-200 hover:underline"
                          style={{
                            color: "var(--primary)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Reset via Email →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info Card */}
                <div className="space-y-4">
                  <FormSection
                    title="Account Information"
                    Icon={User}
                    grad="from-blue-500 via-blue-600 to-blue-500"
                    ring="ring-blue-100"
                  />
                  <div
                    className="rounded-2xl p-5 space-y-3"
                    style={{
                      background: "var(--bg-subtle)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {[
                      ["Account Email", profile.email || "—", Mail],
                      ["Account Name", profile.name || "—", User],
                    ].map(([label, value, Icon]) => (
                      <div key={label} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "var(--bg-card)" }}
                        >
                          <Icon
                            size={14}
                            style={{ color: "var(--text-muted)" }}
                          />
                        </div>
                        <div>
                          <p
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {label}
                          </p>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {value}
                          </p>
                        </div>
                      </div>
                    ))}
                    <p
                      className="text-xs pt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      To update your email or name, go to the{" "}
                      <button
                        onClick={() => setActiveTab("profile")}
                        className="font-bold hover:underline"
                        style={{
                          color: "var(--primary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Profile tab
                      </button>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SAVE BUTTON — hide on security tab ── */}
        {activeTab !== "security" && (
          <div className="flex items-center gap-3 pb-6">
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ring-4 ring-blue-100/20"
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    style={{ animation: "spin 0.7s linear infinite" }}
                  />{" "}
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save All Settings
                </>
              )}
            </button>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              All tabs will be saved together
            </p>
          </div>
        )}
      </div>

      {/* ════ MODALS ════ */}
      <ConfirmModal
        open={showSaveConfirm}
        title="Save Settings"
        message="Are you sure you want to save all settings? This will update your profile, company details and invoice configuration."
        confirmLabel="Yes, Save All"
        confirmColor="bg-blue-600 hover:bg-blue-700"
        icon={Save}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        onConfirm={handleSaveAll}
        onCancel={() => setShowSaveConfirm(false)}
      />

      <ConfirmModal
        open={showNoChangesModal}
        title="No Changes Detected"
        message="You haven't made any changes yet. Please edit your profile, company or invoice settings before saving."
        confirmLabel="Got it"
        confirmColor="bg-amber-500 hover:bg-amber-600"
        icon={AlertCircle}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        onConfirm={() => setShowNoChangesModal(false)}
        onCancel={() => setShowNoChangesModal(false)}
      />

      {/* Danger Step 1 */}
      {showDangerStep1 && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000] p-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "fadeUp 0.2s ease",
            }}
          >
            <div className="p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Delete Company?
              </h3>
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                You are about to permanently delete{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {company.name}
                </span>
                .
              </p>
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6"
                style={{
                  background: "var(--red-bg)",
                  border: "1px solid var(--red)",
                }}
              >
                <AlertCircle
                  size={14}
                  className="shrink-0 mt-0.5"
                  style={{ color: "var(--red-text)" }}
                />
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--red-text)" }}
                >
                  <b>This will permanently delete:</b> all invoices, payments,
                  customer data and company information. This action{" "}
                  <b>cannot be undone</b>.
                </p>
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setShowDangerStep1(false)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl"
                  style={{
                    color: "var(--text-secondary)",
                    background: "var(--bg-card)",
                    border: "2px solid var(--border)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDangerStep1(false);
                    setShowDangerStep2(true);
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  I understand — Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Step 2 */}
      {showDangerStep2 && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000] p-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "fadeUp 0.2s ease",
            }}
          >
            <div className="p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Final Confirmation
              </h3>
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: "var(--text-secondary)" }}
              >
                To confirm deletion, type the company name exactly:
              </p>
              <div
                className="px-4 py-2.5 rounded-xl mb-4 text-center"
                style={{ background: "var(--bg-subtle)" }}
              >
                <span
                  className="text-sm font-bold select-all"
                  style={{ color: "var(--text-primary)" }}
                >
                  {company.name}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Enter your password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type={showDeletePassword ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
                      style={{
                        background: "var(--bg-input)",
                        border: "2px solid var(--border)",
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#ef4444";
                        e.target.style.boxShadow =
                          "0 0 0 4px rgba(239,68,68,0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--border)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword(!showDeletePassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{
                        color: "var(--text-muted)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {showDeletePassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    className="block text-xs font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Type company name to confirm{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`Type "${company.name}" here...`}
                    className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
                    style={{
                      background: "var(--bg-input)",
                      border: "2px solid var(--border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ef4444";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(239,68,68,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  {deleteConfirmText && deleteConfirmText !== company.name && (
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--red-text)" }}
                    >
                      Name does not match. Type exactly: <b>{company.name}</b>
                    </p>
                  )}
                  {deleteConfirmText === company.name && deleteConfirmText && (
                    <p
                      className="text-xs font-medium flex items-center gap-1"
                      style={{ color: "var(--green-text)" }}
                    >
                      <CheckCircle size={12} /> Name matches — you can now
                      delete
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    setShowDangerStep2(false);
                    setDeleteConfirmText("");
                    setDeletePassword("");
                  }}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl"
                  style={{
                    color: "var(--text-secondary)",
                    background: "var(--bg-card)",
                    border: "2px solid var(--border)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCompany}
                  disabled={
                    deleteConfirmText !== company.name ||
                    !deletePassword.trim() ||
                    deletingCompany
                  }
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {deletingCompany ? (
                    <>
                      <Loader2
                        size={15}
                        style={{ animation: "spin 0.7s linear infinite" }}
                      />{" "}
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} /> Delete Company
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Path Modal */}
      {showPathModal && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000] p-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "fadeUp 0.2s ease",
            }}
          >
            <div className="p-6 sm:p-8">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <FolderOpen size={22} className="text-blue-600" />
              </div>
              <h3
                className="text-lg font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Set PDF Save Location
              </h3>
              <p
                className="text-sm mb-5"
                style={{ color: "var(--text-muted)" }}
              >
                Folder ka full path type karo jahan invoices save hone chahiye
              </p>
              <div className="space-y-1.5 mb-4">
                <label
                  className="block text-xs font-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Folder Path
                </label>
                <div className="relative">
                  <FolderOpen
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    type="text"
                    value={tempPath}
                    onChange={(e) => setTempPath(e.target.value)}
                    placeholder="e.g. D:/Invoices"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200"
                    style={{
                      background: "var(--bg-input)",
                      border: "2px solid var(--border)",
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tempPath.trim()) {
                        setInvoice((p) => ({ ...p, pdfPath: tempPath.trim() }));
                        setShowPathModal(false);
                      }
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  💡 Example: <b>D:/Invoices</b> |{" "}
                  <b>C:/Users/Admin/Documents/Invoices</b>
                </p>
              </div>
              <div className="mb-6">
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Quick Select
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "D:/Invoices",
                    "C:/Invoices",
                    "D:/My Invoices",
                    "E:/Invoices",
                    "C:/Users/Admin/Documents/Invoices",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setTempPath(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        background: "var(--bg-subtle)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--primary-bg)";
                        e.currentTarget.style.color = "var(--primary)";
                        e.currentTarget.style.borderColor = "var(--primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-subtle)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setShowPathModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
                  style={{
                    color: "var(--text-secondary)",
                    background: "var(--bg-card)",
                    border: "2px solid var(--border)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (tempPath.trim())
                      setInvoice((p) => ({ ...p, pdfPath: tempPath.trim() }));
                    setShowPathModal(false);
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Set Path
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin         { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeIn       { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeUp       { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
