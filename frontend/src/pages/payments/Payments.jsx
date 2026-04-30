import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../../hooks/useTheme";
import {
  CreditCard,
  Pencil,
  FileText,
  Trash2,
  Bell,
  Send,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  TrendingUp,
  Clock,
  AlertTriangle,
  Loader2,
  Receipt,
  History,
  BookOpen,
  ClipboardList,
  ListChecks,
  Search,
  Filter,
  ChevronDown,
  Users,
} from "lucide-react";

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
  const C = {
    success: {
      Icon: CheckCircle,
      label: "Success",
    },
    error: {
      Icon: AlertCircle,
      label: "Error",
    },
    info: {
      Icon: Info,
      label: "Info",
    },
  };
  const borderColor = { success: "#22c55e", error: "#ef4444", info: "#2563eb" };
  const iconColor = {
    success: "var(--green)",
    error: "var(--red)",
    info: "var(--primary)",
  };

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => {
        const c = C[t.type] || C.info;
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl px-4 py-3.5 min-w-[300px] max-w-[380px] shadow-xl pointer-events-auto animate-in slide-in-from-right-4 duration-300"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: `4px solid ${borderColor[t.type] || borderColor.info}`,
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
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000] p-4 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
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

function PayConfirmModal({ open, invoice, onCancel, onConfirm }) {
  if (!open || !invoice) return null;
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000] p-4 animate-in fade-in duration-200"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mb-4 shadow-lg ring-4 ring-blue-100/20">
            <CreditCard size={22} className="text-white" />
          </div>
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Confirm Payment
          </h3>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Did you receive payment for invoice{" "}
            <span
              className="font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {invoice.invoiceNo}
            </span>
            ?
          </p>
          <div
            className="rounded-xl p-4 mb-6 space-y-2"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
            }}
          >
            {[
              ["Customer", invoice.customerId?.name, "var(--text-primary)"],
              ["Total", `₹${invoice.total}`, "var(--text-primary)"],
              ["Due", `₹${invoice.due}`, "var(--red)"],
            ].map(([k, v, vc]) => (
              <div key={k} className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>{k}</span>
                <span className="font-semibold" style={{ color: vc }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
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
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <CreditCard size={14} /> Yes, Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const TAB_CFG = {
  record: {
    Icon: ClipboardList,
    label: "Loading Record Payment",
    grad: "from-blue-500 via-blue-600 to-blue-500",
    ring: "ring-blue-100",
  },
  invoices: {
    Icon: Receipt,
    label: "Loading Invoices",
    grad: "from-violet-500 via-violet-600 to-violet-500",
    ring: "ring-violet-100",
  },
  pending: {
    Icon: Clock,
    label: "Loading Pending",
    grad: "from-amber-500 via-amber-600 to-amber-500",
    ring: "ring-amber-100",
  },
  history: {
    Icon: History,
    label: "Loading History",
    grad: "from-cyan-500 via-cyan-600 to-cyan-500",
    ring: "ring-cyan-100",
  },
  ledger: {
    Icon: BookOpen,
    label: "Loading Customer Ledger",
    grad: "from-emerald-500 via-emerald-600 to-emerald-500",
    ring: "ring-emerald-100",
  },
};

function TabLoader({ tab }) {
  const c = TAB_CFG[tab] || TAB_CFG.record;
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="relative w-20 h-20">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            border: "4px solid var(--border)",
            borderTop: "4px solid #2563eb",
          }}
        />
        <div
          className={`absolute rounded-full bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-lg`}
          style={{ inset: "8px" }}
        >
          <c.Icon size={22} className="text-white" />
        </div>
      </div>
      <div className="text-center">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {c.label}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    green: {
      grad: "from-green-500 via-green-600 to-green-500",
      ring: "ring-green-100",
    },
    amber: {
      grad: "from-amber-500 via-amber-600 to-amber-500",
      ring: "ring-amber-100",
    },
    red: { grad: "from-red-500 via-red-600 to-red-500", ring: "ring-red-100" },
    blue: {
      grad: "from-blue-500 via-blue-600 to-blue-500",
      ring: "ring-blue-100",
    },
    violet: {
      grad: "from-violet-500 via-violet-600 to-violet-500",
      ring: "ring-violet-100",
    },
    cyan: {
      grad: "from-cyan-500 via-cyan-600 to-cyan-500",
      ring: "ring-cyan-100",
    },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div
      className="group rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-xl ring-4 ${c.ring} group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-white">{icon}</div>
        </div>
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </p>
          <p
            className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    paid: {
      background: "var(--green-bg)",
      color: "var(--green-text)",
      border: "2px solid var(--green)",
    },
    pending: {
      background: "var(--amber-bg)",
      color: "var(--amber-text)",
      border: "2px solid var(--amber)",
    },
    overdue: {
      background: "var(--red-bg)",
      color: "var(--red-text)",
      border: "2px solid var(--red)",
    },
  };
  const dot = {
    paid: "bg-green-500",
    pending: "bg-amber-500",
    overdue: "bg-red-500",
  };
  const s = styles[status] || {
    background: "var(--bg-subtle)",
    color: "var(--text-secondary)",
    border: "2px solid var(--border)",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm`}
      style={s}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dot[status] || "bg-slate-400"}`}
      />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

function Btn({ onClick, className = "", children, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function DataTable({ headers, rows, emptyMsg = "No records found" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="rounded-2xl shadow-lg overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                background: isDark
                  ? "linear-gradient(90deg,#0f172a,#1e293b,#0f172a)"
                  : "linear-gradient(90deg,#f8fafc,#eff6ff,#f8fafc)",
                borderBottom: "2px solid var(--border)",
              }}
            >
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                      style={{ background: "var(--bg-subtle)" }}
                    >
                      <ListChecks
                        size={28}
                        style={{ color: "var(--text-muted)" }}
                      />
                    </div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {emptyMsg}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="group transition-all duration-200"
                  style={{ borderTop: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--primary-bg)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  {row.cells.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-5 py-4 text-sm align-middle"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, Icon, grad, ring }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-5">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-xl ring-4 ${ring}`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <h3
          className="text-base sm:text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="text-xs sm:text-sm mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  children,
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
      {children || (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
          style={{
            background: "var(--bg-input)",
            border: "2px solid var(--border)",
            color: "var(--text-primary)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#2563eb";
            e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";
            e.target.style.background = "var(--bg-card)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
            e.target.style.background = "var(--bg-input)";
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAYMENTS COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Payments() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get("tab") || "record";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loadingTab, setLoadingTab] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [summary, setSummary] = useState({
    totalReceived: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchSummary();
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const invRes = await fetch("http://localhost:5000/api/invoices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const invoicesData = await invRes.json();
      const invoices = Array.isArray(invoicesData)
        ? invoicesData
        : invoicesData.invoices || [];

      const payRes = await fetch("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const paymentsData = await payRes.json();
      const payments = Array.isArray(paymentsData)
        ? paymentsData
        : paymentsData.payments || [];

      const totalReceived = payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
      );
      const pendingAmount = invoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + Number(inv.due || 0), 0);
      const overdueAmount = invoices
        .filter((inv) => inv.status === "overdue")
        .reduce((sum, inv) => sum + Number(inv.due || 0), 0);
      setSummary({ totalReceived, pendingAmount, overdueAmount });
    } catch (err) {
      console.error("Summary error:", err);
    }
  };

  const TABS = [
    { key: "record", label: "Record Payment", Icon: ClipboardList },
    { key: "invoices", label: "Invoices", Icon: Receipt },
    { key: "pending", label: "Pending", Icon: Clock },
    { key: "history", label: "History", Icon: History },
    { key: "ledger", label: "Customer Ledger", Icon: BookOpen },
  ];

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setLoadingTab(tab);
    setTimeout(() => {
      setActiveTab(tab);
      setLoadingTab(null);
    }, 1200);
  };

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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl ring-4 ring-blue-100/20">
                <CreditCard size={24} className="text-white" />
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
                Payments
              </h1>
              <p
                className="text-xs sm:text-sm mt-0.5 sm:mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Manage payments, invoices and customer ledger
              </p>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Total Received"
            value={`₹${summary.totalReceived.toLocaleString("en-IN")}`}
            color="green"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Pending Amount"
            value={`₹${summary.pendingAmount.toLocaleString("en-IN")}`}
            color="amber"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            label="Overdue Amount"
            value={`₹${summary.overdueAmount.toLocaleString("en-IN")}`}
            color="red"
          />
        </div>

        {/* ── TABS ── */}
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex overflow-x-auto"
            style={{
              borderBottom: "2px solid var(--border)",
              background: isDark
                ? "linear-gradient(90deg,#0f172a,#1e293b,#0f172a)"
                : "linear-gradient(90deg,#f8fafc,#eff6ff,#f8fafc)",
            }}
          >
            {TABS.map(({ key, label, Icon }) => {
              const isActive = activeTab === key;
              const isLoading = loadingTab === key;
              return (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className="flex items-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-all duration-200"
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
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-blue-600" />
                  ) : (
                    <Icon size={14} />
                  )}
                  {label}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {loadingTab ? (
              <TabLoader tab={loadingTab} />
            ) : (
              <>
                {activeTab === "record" && (
                  <RecordPayment
                    selectedInvoice={selectedInvoice}
                    addToast={addToast}
                    onPaymentDone={fetchSummary}
                  />
                )}
                {activeTab === "invoices" && (
                  <InvoicesTable
                    addToast={addToast}
                    onRefreshSummary={fetchSummary}
                    onPay={(inv) => {
                      setSelectedInvoice(inv);
                      setShowPayModal(true);
                    }}
                  />
                )}
                {activeTab === "pending" && (
                  <PendingInvoices addToast={addToast} />
                )}
                {activeTab === "history" && <PaymentHistory />}
                {activeTab === "ledger" && (
                  <CustomerLedger addToast={addToast} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <PayConfirmModal
        open={showPayModal && !!selectedInvoice}
        invoice={selectedInvoice}
        onCancel={() => setShowPayModal(false)}
        onConfirm={() => {
          setShowPayModal(false);
          fetchSummary();
          switchTab("record");
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RECORD PAYMENT TAB
═══════════════════════════════════════════════════════════════════ */
function RecordPayment({ selectedInvoice, addToast, onPaymentDone }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedInvoice) {
      addToast(
        "Please select an invoice first. Go to Invoices tab and click Pay.",
        "error",
      );
      return;
    }
    if (!amount) {
      addToast("Please enter the payment amount.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice._id,
          amount: Number(amount),
          method,
          referenceNo,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || "Failed to record payment.", "error");
        return;
      }
      addToast("Payment recorded successfully.", "success");
      setAmount("");
      setReferenceNo("");
      setNotes("");
      onPaymentDone?.();
    } catch (err) {
      console.error(err);
      addToast("Server error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Record Payment"
        subtitle="Record a payment received against an invoice"
        Icon={ClipboardList}
        grad="from-blue-500 via-blue-600 to-blue-500"
        ring="ring-blue-100"
      />
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-72 shrink-0">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Selected Invoice
          </p>
          {selectedInvoice ? (
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--primary-bg)",
                border: "1px solid var(--border-focus)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg ring-4 ring-blue-100/20">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: "var(--primary)" }}
                  >
                    {selectedInvoice.invoiceNo}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {selectedInvoice.customerId?.name}
                  </p>
                </div>
              </div>
              {[
                [
                  "Total Amount",
                  `₹${selectedInvoice.total}`,
                  "var(--text-primary)",
                ],
                [
                  "Amount Paid",
                  `₹${selectedInvoice.amountPaid}`,
                  "var(--green-text)",
                ],
                ["Amount Due", `₹${selectedInvoice.due}`, "var(--red-text)"],
              ].map(([label, val, vc]) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 last:border-0"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: vc }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: "var(--bg-subtle)",
                border: "2px dashed var(--border)",
              }}
            >
              <Receipt
                size={28}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                No invoice selected
              </p>
              <p
                className="text-xs mt-1.5 leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                Go to <b>Invoices</b> tab and click <b>Pay</b> on an invoice.
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Payment Details
          </p>
          <FormInput
            label="Payment Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            type="number"
            required
          />
          <FormInput label="Payment Method" required>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
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
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </FormInput>
          <FormInput
            label="Reference No."
            value={referenceNo}
            onChange={(e) => setReferenceNo(e.target.value)}
            placeholder="Transaction / Cheque reference (optional)"
          />
          <FormInput
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes (optional)"
          />
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Recording...
              </>
            ) : (
              <>
                <CreditCard size={16} /> Record Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PENDING INVOICES TAB
═══════════════════════════════════════════════════════════════════ */
function PendingInvoices({ addToast }) {
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPendingInvoices();
  }, []);

  const fetchPendingInvoices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/invoices", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setPendingInvoices(data.filter((inv) => inv.status === "pending"));
    } catch (err) {
      console.error("Pending invoices error:", err);
    }
  };

  const sendReminder = async (invoice) => {
    const customerName = invoice.customerId?.name || "Customer";
    let phone = invoice.customerId?.contactNo || "";
    phone = phone.replace(/\s+/g, "");
    if (!phone.startsWith("91")) phone = "91" + phone;
    const BASE_URL = "https://irruptive-touristically-westin.ngrok-free.dev";
    const pdfLink = `${BASE_URL}/api/invoices/download-pdf/${invoice._id}`;
    const message = `Reminder\n\nHello ${customerName}\n\nInvoice ${invoice.invoiceNo} is still pending.\n\nAmount Due: ₹${invoice.due}\n\nDownload Invoice:\n${pdfLink}\n\nPrimeCapital`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    await fetch("http://localhost:5000/api/activity/reminder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({
        invoiceId: invoice._id,
        customerId: invoice.customerId._id,
        amount: invoice.due,
      }),
    });
    addToast(`Reminder sent to ${customerName}.`, "success");
  };

  const totalOutstanding = pendingInvoices.reduce(
    (sum, inv) => sum + inv.due,
    0,
  );
  const filtered = pendingInvoices.filter(
    (inv) =>
      inv.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerId?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const rows = filtered.map((inv) => ({
    cells: [
      <span className="font-bold" style={{ color: "var(--text-primary)" }}>
        {inv.invoiceNo}
      </span>,
      <span style={{ color: "var(--text-secondary)" }}>
        {inv.customerId?.name}
      </span>,
      <span style={{ color: "var(--text-secondary)" }}>
        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
      </span>,
      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
        ₹{inv.total}
      </span>,
      <span className="font-semibold" style={{ color: "var(--green-text)" }}>
        ₹{inv.amountPaid}
      </span>,
      <span className="font-bold" style={{ color: "var(--red-text)" }}>
        ₹{inv.due}
      </span>,
      <Btn
        onClick={() => sendReminder(inv)}
        className="text-white bg-[#25D366] hover:bg-[#22c55e]"
      >
        <Bell size={12} /> Send Reminder
      </Btn>,
    ],
  }));

  return (
    <div>
      <SectionHeader
        title="Pending Invoices"
        subtitle="Invoices awaiting payment — send WhatsApp reminders"
        Icon={Clock}
        grad="from-amber-500 via-amber-600 to-amber-500"
        ring="ring-amber-100"
      />
      <div
        className="inline-flex items-center gap-4 mb-5 p-4 sm:p-5 rounded-2xl shadow-sm"
        style={{
          background: "var(--amber-bg)",
          border: "1px solid var(--amber)",
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-500 flex items-center justify-center shadow-xl ring-4 ring-amber-100">
          <AlertTriangle size={22} className="text-white" />
        </div>
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--amber-text)" }}
          >
            Total Outstanding
          </p>
          <p
            className="text-2xl sm:text-3xl font-bold mt-0.5"
            style={{ color: "var(--amber-text)" }}
          >
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--amber-text)" }}>
            {pendingInvoices.length} invoice
            {pendingInvoices.length !== 1 ? "s" : ""} pending
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className="rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5 mb-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search by invoice no. or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 rounded-xl text-sm transition-all duration-200"
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
          </div>
          <span
            className="text-xs whitespace-nowrap"
            style={{ color: "var(--text-muted)" }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <DataTable
        headers={[
          "Invoice",
          "Customer",
          "Date",
          "Total",
          "Paid",
          "Due",
          "Action",
        ]}
        rows={rows}
        emptyMsg="No pending invoices match your search"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAYMENT HISTORY TAB
═══════════════════════════════════════════════════════════════════ */
function PaymentHistory() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/activity", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error("Activity history error:", err);
    }
  };

  const TYPES = {
    payment_received: {
      Icon: CreditCard,
      label: "Payment Received",
      grad: "from-green-500 via-green-600 to-green-500",
      ring: "ring-green-100",
    },
    invoice_updated: {
      Icon: Pencil,
      label: "Invoice Updated",
      grad: "from-amber-500 via-amber-600 to-amber-500",
      ring: "ring-amber-100",
    },
    invoice_created: {
      Icon: FileText,
      label: "Invoice Created",
      grad: "from-blue-500 via-blue-600 to-blue-500",
      ring: "ring-blue-100",
    },
    invoice_deleted: {
      Icon: Trash2,
      label: "Invoice Deleted",
      grad: "from-red-500 via-red-600 to-red-500",
      ring: "ring-red-100",
    },
    reminder_sent: {
      Icon: Bell,
      label: "Reminder Sent",
      grad: "from-violet-500 via-violet-600 to-violet-500",
      ring: "ring-violet-100",
    },
  };

  const filteredActivities = activities.filter((act) => {
    const resolvedInvoiceNo = act.invoiceNo || act.invoiceId?.invoiceNo || "";
    const sm =
      resolvedInvoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      act.customerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      act.method?.toLowerCase().includes(search.toLowerCase());
    const tm = typeFilter === "all" || act.type === typeFilter;
    return sm && tm;
  });

  const rows = filteredActivities.map((act) => {
    const c = TYPES[act.type] || {
      Icon: ListChecks,
      label: act.type,
      grad: "from-slate-400 to-slate-500",
      ring: "ring-slate-100",
    };
    const displayInvoiceNo = act.invoiceNo || act.invoiceId?.invoiceNo || "—";
    return {
      cells: [
        <span className="flex items-center gap-3">
          <span
            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.grad} flex items-center justify-center shadow-md shrink-0`}
          >
            <c.Icon size={13} className="text-white" />
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {c.label}
          </span>
        </span>,
        <span
          className="font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {displayInvoiceNo}
        </span>,
        <span style={{ color: "var(--text-secondary)" }}>
          {act.customerId?.name || "—"}
        </span>,
        <span className="font-bold" style={{ color: "var(--green-text)" }}>
          ₹{Number(act.amount || 0).toLocaleString("en-IN")}
        </span>,
        <span
          className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
          style={{
            background: "var(--bg-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          {act.method || "—"}
        </span>,
        <span style={{ color: "var(--text-secondary)" }}>
          {new Date(act.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>,
      ],
    };
  });

  return (
    <div>
      <SectionHeader
        title="Activity History"
        subtitle="Complete log of all payment and invoice activities"
        Icon={History}
        grad="from-cyan-500 via-cyan-600 to-cyan-500"
        ring="ring-cyan-100"
      />
      <div
        className="rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5 mb-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search by invoice, customer or method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 rounded-xl text-sm transition-all duration-200"
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
          </div>
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-9 pr-4 py-2.5 sm:py-3.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
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
            >
              <option value="all">All Activity</option>
              <option value="payment_received">Payment Received</option>
              <option value="invoice_created">Invoice Created</option>
              <option value="invoice_updated">Invoice Updated</option>
              <option value="invoice_deleted">Invoice Deleted</option>
              <option value="reminder_sent">Reminder Sent</option>
            </select>
          </div>
          <span
            className="self-center text-xs whitespace-nowrap"
            style={{ color: "var(--text-muted)" }}
          >
            {filteredActivities.length} result
            {filteredActivities.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <DataTable
        headers={[
          "Activity",
          "Invoice",
          "Customer",
          "Amount",
          "Method",
          "Date",
        ]}
        rows={rows}
        emptyMsg="No activity history found"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CUSTOMER LEDGER TAB
═══════════════════════════════════════════════════════════════════ */
function CustomerLedger({ addToast }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [ledger, setLedger] = useState([]);
  const [ledgerSearch, setLedgerSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const companyId = localStorage.getItem("companyId");
      const res = await fetch(
        `http://localhost:5000/api/customers?companyId=${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
      else if (Array.isArray(data.customers)) setCustomers(data.customers);
      else setCustomers([]);
    } catch (err) {
      console.error("Customer fetch error:", err);
    }
  };

  const fetchLedger = async (customerId) => {
    const res = await fetch(
      `http://localhost:5000/api/payments/ledger/${customerId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );
    const data = await res.json();
    setLedger(data);
  };

  const totalDebit = ledger.reduce((s, r) => s + (r.debit || 0), 0);
  const totalCredit = ledger.reduce((s, r) => s + (r.credit || 0), 0);
  const finalBalance = totalDebit - totalCredit;

  const exportLedger = () => {
    let content = "Date,Type,Invoice,Debit,Credit,Balance\n";
    ledger.forEach((row) => {
      content += `${new Date(row.date).toLocaleDateString()},${row.type},${row.invoiceNo || "-"},${row.debit || 0},${row.credit || 0},${row.balance}\n`;
    });
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger.csv";
    a.click();
    addToast("Ledger exported as CSV.", "success");
  };

  const shareLedger = () => {
    if (!selectedCustomer) {
      addToast("Please select a customer first.", "error");
      return;
    }
    const customer = customers.find((c) => c._id === selectedCustomer);
    let phone = customer?.contactNo || "";
    phone = phone.replace(/\s+/g, "");
    if (!phone.startsWith("91")) phone = "91" + phone;
    let message = `Customer Ledger\n\nName: ${customer.name}\n\n`;
    ledger.forEach((row) => {
      message += `${new Date(row.date).toLocaleDateString()} | ${row.type.toUpperCase()}\nInvoice: ${row.invoiceNo || "-"}\nDebit: ₹${row.debit || 0} | Credit: ₹${row.credit || 0}\nBalance: ₹${row.balance}\n\n`;
    });
    message += `Total Balance: ₹${ledger.length ? ledger[ledger.length - 1].balance : 0}\n\n- PrimeCapital`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    addToast(`Ledger shared with ${customer.name} on WhatsApp.`, "info");
  };

  const selectedCust = customers.find((c) => c._id === selectedCustomer);
  const filteredLedger = ledger.filter(
    (row) =>
      row.invoiceNo?.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      row.type?.toLowerCase().includes(ledgerSearch.toLowerCase()),
  );

  const rows = filteredLedger.map((row) => ({
    cells: [
      <span style={{ color: "var(--text-secondary)" }}>
        {new Date(row.date).toLocaleDateString("en-IN")}
      </span>,
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
        style={
          row.type === "invoice"
            ? { background: "var(--primary-bg)", color: "var(--primary)" }
            : { background: "var(--green-bg)", color: "var(--green-text)" }
        }
      >
        {row.type === "invoice" ? "Invoice" : "Payment"}
      </span>,
      <span style={{ color: "var(--text-secondary)" }}>
        {row.invoiceNo || "—"}
      </span>,
      row.debit ? (
        <span className="font-bold" style={{ color: "var(--red-text)" }}>
          ₹{row.debit}
        </span>
      ) : (
        <span style={{ color: "var(--border-strong)" }}>—</span>
      ),
      row.credit ? (
        <span className="font-bold" style={{ color: "var(--green-text)" }}>
          ₹{row.credit}
        </span>
      ) : (
        <span style={{ color: "var(--border-strong)" }}>—</span>
      ),
      <span
        className="font-bold text-sm"
        style={{
          color: row.balance > 0 ? "var(--red-text)" : "var(--green-text)",
        }}
      >
        ₹{row.balance}
      </span>,
    ],
  }));

  return (
    <div>
      <SectionHeader
        title="Customer Ledger"
        subtitle="View complete debit/credit ledger for any customer"
        Icon={BookOpen}
        grad="from-emerald-500 via-emerald-600 to-emerald-500"
        ring="ring-emerald-100"
      />

      {/* Customer Select */}
      <div
        className="rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 mb-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <select
            value={selectedCustomer}
            onChange={(e) => {
              setSelectedCustomer(e.target.value);
              fetchLedger(e.target.value);
            }}
            className="w-full sm:w-72 pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
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
          >
            <option value="">Select a customer...</option>
            {Array.isArray(customers) &&
              customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {!selectedCustomer && (
        <div
          className="rounded-2xl shadow-lg p-12 sm:p-16 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ background: "var(--bg-subtle)" }}
            >
              <BookOpen size={36} style={{ color: "var(--text-muted)" }} />
            </div>
            <div>
              <p
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Select a customer
              </p>
              <p
                className="text-sm mt-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                All invoice and payment records will appear here
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <>
          <div
            className="flex items-center gap-3 p-4 rounded-2xl mb-4 shadow-sm"
            style={{
              background: "var(--green-bg)",
              border: "1px solid var(--green)",
            }}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-500 flex items-center justify-center text-white font-bold text-base shadow-lg ring-4 ring-emerald-100/20">
              {selectedCust?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p
                className="font-bold text-sm"
                style={{ color: "var(--green-text)" }}
              >
                {selectedCust?.name}
              </p>
              <p className="text-xs" style={{ color: "var(--green-text)" }}>
                {ledger.length} ledger entries
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
            <StatCard
              icon={<FileText size={20} />}
              label="Total Invoiced"
              value={`₹${totalDebit.toLocaleString("en-IN")}`}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Total Received"
              value={`₹${totalCredit.toLocaleString("en-IN")}`}
              color="green"
            />
            <StatCard
              icon={<AlertTriangle size={20} />}
              label="Balance Due"
              value={`₹${finalBalance.toLocaleString("en-IN")}`}
              color="red"
            />
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Btn
          onClick={exportLedger}
          className="text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md hover:shadow-lg px-4 py-2 text-sm"
        >
          <Download size={14} /> Export CSV
        </Btn>
        <Btn
          onClick={shareLedger}
          className="text-white bg-[#25D366] hover:bg-[#22c55e] shadow-md hover:shadow-lg px-4 py-2 text-sm"
        >
          <Send size={14} /> Share on WhatsApp
        </Btn>
      </div>

      {selectedCustomer && (
        <>
          <div
            className="rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5 mb-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  placeholder="Search by invoice no. or entry type..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 rounded-xl text-sm transition-all duration-200"
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
              </div>
              <span
                className="text-xs whitespace-nowrap"
                style={{ color: "var(--text-muted)" }}
              >
                {filteredLedger.length} result
                {filteredLedger.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <DataTable
            headers={["Date", "Type", "Invoice", "Debit", "Credit", "Balance"]}
            rows={rows}
            emptyMsg="No ledger entries match your search"
          />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INVOICES TABLE TAB
═══════════════════════════════════════════════════════════════════ */
function InvoicesTable({ onPay, addToast, onRefreshSummary }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    invoiceId: null,
    invoiceNo: "",
  });
  const [editConfirm, setEditConfirm] = useState({
    open: false,
    invoice: null,
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/invoices", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) setInvoices(data);
      else if (Array.isArray(data.invoices)) setInvoices(data.invoices);
      else setInvoices([]);
    } catch (err) {
      console.error("Invoice fetch error:", err);
    }
  };

  const handleDelete = async () => {
    const { invoiceId, invoiceNo } = confirmDelete;
    setConfirmDelete({ open: false, invoiceId: null, invoiceNo: "" });
    try {
      const res = await fetch(
        `http://localhost:5000/api/invoices/${invoiceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || "Delete failed.", "error");
        return;
      }
      addToast(`Invoice ${invoiceNo} deleted successfully.`, "success");
      fetchInvoices();
      onRefreshSummary?.();
    } catch (err) {
      console.error(err);
      addToast("Server error. Please try again.", "error");
    }
  };

  const shareOnWhatsApp = (invoice) => {
    const customerName = invoice.customerId?.name || "Customer";
    let phone = invoice.customerId?.contactNo || "";
    phone = phone.replace(/\s+/g, "");
    if (!phone.startsWith("91")) phone = "91" + phone;
    const BASE_URL = "https://irruptive-touristically-westin.ngrok-free.dev";
    const pdfLink = `${BASE_URL}/api/invoices/download-pdf/${invoice._id}`;
    const message = `Hello ${customerName}\n\nYour invoice is ready.\n\nInvoice No: ${invoice.invoiceNo}\nAmount: ₹${invoice.total}\n\nDownload Invoice PDF:\n${pdfLink}\n\nThank you\nPrimeCapital`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    addToast(`Invoice shared with ${customerName} on WhatsApp.`, "info");
  };

  const filteredInvoices = invoices.filter((inv) => {
    const sm =
      inv.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerId?.name?.toLowerCase().includes(search.toLowerCase());
    return sm && (statusFilter === "all" || inv.status === statusFilter);
  });

  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const rows = filteredInvoices.map((inv) => ({
    cells: [
      <span className="font-bold" style={{ color: "var(--text-primary)" }}>
        {inv.invoiceNo}
      </span>,
      <span style={{ color: "var(--text-secondary)" }}>
        {inv.customerId?.name}
      </span>,
      <span style={{ color: "var(--text-secondary)" }}>
        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
      </span>,
      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
        ₹{inv.total}
      </span>,
      <span className="font-semibold" style={{ color: "var(--green-text)" }}>
        ₹{inv.amountPaid}
      </span>,
      <span
        className="font-semibold"
        style={{ color: inv.due > 0 ? "var(--red-text)" : "var(--green-text)" }}
      >
        ₹{inv.due}
      </span>,
      <StatusBadge status={inv.status} />,
      <div className="flex gap-1.5 flex-wrap">
        {inv.due > 0 && (
          <Btn
            onClick={() => onPay(inv)}
            className="text-white bg-blue-600 hover:bg-blue-700"
          >
            <CreditCard size={11} /> Pay
          </Btn>
        )}
        <Btn
          onClick={() => setEditConfirm({ open: true, invoice: inv })}
          className="text-amber-700 bg-amber-100 hover:bg-amber-200"
        >
          <Pencil size={11} /> Edit
        </Btn>
        <Btn
          onClick={() => shareOnWhatsApp(inv)}
          className="text-white bg-[#25D366] hover:bg-[#22c55e]"
        >
          <Send size={11} /> Share
        </Btn>
        <Btn
          onClick={() =>
            setConfirmDelete({
              open: true,
              invoiceId: inv._id,
              invoiceNo: inv.invoiceNo,
            })
          }
          className="text-red-700 bg-red-100 hover:bg-red-200"
        >
          <Trash2 size={11} /> Delete
        </Btn>
      </div>,
    ],
  }));

  return (
    <div>
      <SectionHeader
        title="Invoices"
        subtitle="Manage all invoices — pay, edit, share or delete"
        Icon={Receipt}
        grad="from-violet-500 via-violet-600 to-violet-500"
        ring="ring-violet-100"
      />

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {[
          {
            label: "Total",
            value: invoices.length,
            bg: "var(--primary-bg)",
            color: "var(--primary)",
          },
          {
            label: "Paid",
            value: paidCount,
            bg: "var(--green-bg)",
            color: "var(--green-text)",
          },
          {
            label: "Pending",
            value: pendingCount,
            bg: "var(--amber-bg)",
            color: "var(--amber-text)",
          },
          {
            label: "Overdue",
            value: overdueCount,
            bg: "var(--red-bg)",
            color: "var(--red-text)",
          },
        ].map(({ label, value, bg, color }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: bg, color }}
          >
            <span className="text-base font-extrabold">{value}</span> {label}
          </span>
        ))}
      </div>

      {/* Search + Filter */}
      <div
        className="rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5 mb-5"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 rounded-xl text-sm transition-all duration-200"
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
          </div>
          <div className="relative">
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-2.5 sm:py-3.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
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
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <span
            className="self-center text-xs whitespace-nowrap"
            style={{ color: "var(--text-muted)" }}
          >
            {filteredInvoices.length} result
            {filteredInvoices.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <DataTable
        headers={[
          "Invoice",
          "Customer",
          "Date",
          "Total",
          "Paid",
          "Due",
          "Status",
          "Actions",
        ]}
        rows={rows}
        emptyMsg="No invoices match your search"
      />

      <ConfirmModal
        open={confirmDelete.open}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${confirmDelete.invoiceNo}"? This action cannot be undone.`}
        confirmLabel="Delete Invoice"
        confirmColor="bg-red-600 hover:bg-red-700"
        icon={Trash2}
        iconBg="bg-red-100"
        iconColor="text-red-600"
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirmDelete({ open: false, invoiceId: null, invoiceNo: "" })
        }
      />
      <ConfirmModal
        open={editConfirm.open}
        title="Edit Invoice"
        message={`Do you want to edit invoice "${editConfirm.invoice?.invoiceNo}"? You will be redirected to the edit page.`}
        confirmLabel="Yes, Edit Invoice"
        confirmColor="bg-amber-500 hover:bg-amber-600"
        icon={Pencil}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        onConfirm={() => {
          window.location.href = `/invoice/edit/${editConfirm.invoice?._id}`;
          setEditConfirm({ open: false, invoice: null });
        }}
        onCancel={() => setEditConfirm({ open: false, invoice: null })}
      />
    </div>
  );
}
