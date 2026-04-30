import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Plus,
  Send,
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  User,
  IndianRupee,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin    { to { transform:rotate(360deg); } }
    @keyframes slideInRight { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }

    .ei-input {
      width: 100%;
      padding: 8px 12px;
      background: var(--bg-input);
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 14px;
      color: var(--text-primary);
      transition: all 0.2s;
    }
    .ei-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-ring);
      background: var(--bg-card);
    }
    .ei-input:hover:not(:focus) { border-color: var(--border-strong); }
    .ei-input::placeholder { color: var(--text-muted); }

    .ei-textarea {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg-input);
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 14px;
      color: var(--text-primary);
      transition: all 0.2s;
      resize: none;
    }
    .ei-textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-ring);
      background: var(--bg-card);
    }
    .ei-textarea::placeholder { color: var(--text-muted); }

    ::-webkit-scrollbar       { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
    ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius:4px; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════════════════ */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  return { toasts, addToast, removeToast };
}

function ToastContainer({ toasts, removeToast }) {
  const C = {
    success: {
      borderColor: "var(--green)",
      bg: "var(--green-bg)",
      iconColor: "var(--green-text)",
      Icon: CheckCircle,
      label: "Success",
    },
    error: {
      borderColor: "var(--red)",
      bg: "var(--red-bg)",
      iconColor: "var(--red-text)",
      Icon: AlertCircle,
      label: "Error",
    },
    info: {
      borderColor: "var(--primary)",
      bg: "var(--primary-bg)",
      iconColor: "var(--primary)",
      Icon: AlertCircle,
      label: "Info",
    },
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
              background: c.bg,
              border: `1px solid var(--border)`,
              borderLeft: `4px solid ${c.borderColor}`,
              animation: "slideInRight 0.28s ease",
            }}
          >
            <c.Icon
              size={18}
              style={{ color: c.iconColor, marginTop: 2, flexShrink: 0 }}
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
              style={{
                color: "var(--text-muted)",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARE / SUCCESS MODAL
═══════════════════════════════════════════════════════════════════ */
function ShareModal({ open, changesList, onShare, onSkip }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[5000] p-4"
      style={{ background: "rgba(0,0,0,0.6)", animation: "fadeIn 0.2s ease" }}
    >
      <div
        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          animation: "fadeUp 0.22s ease",
        }}
      >
        {/* Header */}
        <div
          className="p-6 sm:p-8 text-center"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <CheckCircle size={34} className="text-white" />
            </div>
          </div>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Invoice Updated!
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            The following changes were saved successfully
          </p>
        </div>

        {/* Changes list */}
        <div className="px-6 py-4">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Changes Made
          </p>
          <ul className="space-y-2">
            {changesList.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: "var(--primary-bg)",
                    color: "var(--primary)",
                  }}
                >
                  {i + 1}
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#25D366] hover:bg-[#22c55e] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Send size={15} /> Share on WhatsApp
          </button>
          <button
            onClick={onSkip}
            className="flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-200"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-subtle)",
              border: "2px solid var(--border)",
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EditInvoice COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [invoice, setInvoice] = useState(null);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [notes, setNotes] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [changesList, setChangesList] = useState([]);
  const [saving, setSaving] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const data = await res.json();
      setInvoice(data);
      setOriginalInvoice(JSON.parse(JSON.stringify(data)));
      setNotes(data.notes || "");
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoice.items];
    updatedItems[index][field] = value;
    setInvoice({ ...invoice, items: updatedItems });
  };

  const handleAddItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { description: "", qty: 1, rate: 0 }],
    });
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...invoice.items];
    updatedItems.splice(index, 1);
    setInvoice({ ...invoice, items: updatedItems });
  };

  const getChanges = () => {
    const changes = [];
    if (!originalInvoice) return changes;
    if ((originalInvoice.notes || "") !== notes) changes.push("Notes updated");
    invoice.items.forEach((item, index) => {
      const oldItem = originalInvoice.items[index];
      if (!oldItem) {
        changes.push(`New item added: ${item.description}`);
        return;
      }
      if (item.description !== oldItem.description)
        changes.push(`Item description updated`);
      if (item.qty !== oldItem.qty)
        changes.push(`Quantity updated (${oldItem.qty} → ${item.qty})`);
      if (item.rate !== oldItem.rate)
        changes.push(`Rate updated (₹${oldItem.rate} → ₹${item.rate})`);
    });
    if (invoice.items.length < originalInvoice.items.length)
      changes.push("An item was removed");
    return changes;
  };

  const handleSave = async () => {
    const changes = getChanges();
    if (changes.length === 0) {
      addToast("No changes detected.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ items: invoice.items, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || "Update failed.", "error");
        return;
      }
      setChangesList(changes);
      setShowSharePopup(true);
    } catch (err) {
      console.error(err);
      addToast("Server error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const shareUpdatedInvoice = () => {
    const customerName = invoice.customerId?.name || "Customer";
    let phone = invoice.customerId?.contactNo || "";
    phone = phone.replace(/\s+/g, "");
    if (!phone.startsWith("91")) phone = "91" + phone;
    const BASE_URL = "https://irruptive-touristically-westin.ngrok-free.dev";
    const pdfLink = `${BASE_URL}/api/invoices/download-pdf/${invoice._id}`;
    const changeText = changesList.map((c) => "• " + c).join("\n");
    const message = `Hello ${customerName}\n\nYour invoice has been updated.\n\nChanges made:\n${changeText}\n\nUpdated Invoice:\n${pdfLink}\n\nThank you for doing business with us.\n\nPrimeCapital`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    navigate("/payments");
  };

  /* ── loading state ── */
  if (!invoice) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "var(--bg-base)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}
      >
        <GlobalStyles />
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "4px solid var(--border)",
                borderTop: "4px solid var(--primary)",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div
              className="absolute rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-lg"
              style={{ inset: "8px" }}
            >
              <FileText size={18} className="text-white" />
            </div>
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0,
  );

  // Table header background
  const tableHdr = {
    background: isDark
      ? "linear-gradient(90deg,#0f172a,#1e293b,#0f172a)"
      : "linear-gradient(90deg,#f8fafc,#eff6ff,#f8fafc)",
    borderBottom: "2px solid var(--border)",
  };

  return (
    <div
      className="min-h-screen p-3 sm:p-6 lg:p-8"
      style={{
        background: "var(--bg-base)",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <GlobalStyles />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-5xl mx-auto space-y-5">
        {/* ── PAGE HEADER ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-500 flex items-center justify-center shadow-xl ring-4 ring-amber-100">
                <Pencil size={22} className="text-white" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4"
                style={{ borderColor: "var(--bg-base)" }}
              />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Edit Invoice
              </h1>
              <p
                className="text-xs sm:text-sm mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Modifying{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {invoice.invoiceNo}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/payments")}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:scale-105"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        {/* ── INVOICE INFO CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer */}
          <div
            className="group rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300 flex items-center gap-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-xl ring-4 ring-blue-100 shrink-0 group-hover:scale-110 transition-transform duration-300">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Customer
              </p>
              <p
                className="text-lg font-bold mt-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                {invoice.customerId?.name}
              </p>
            </div>
          </div>

          {/* Subtotal */}
          <div
            className="group rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300 flex items-center gap-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 via-green-600 to-green-500 flex items-center justify-center shadow-xl ring-4 ring-green-100 shrink-0 group-hover:scale-110 transition-transform duration-300">
              <IndianRupee size={20} className="text-white" />
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Current Subtotal
              </p>
              <p
                className="text-lg font-bold mt-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                ₹{subtotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* ── ITEMS TABLE CARD ── */}
        <div
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between px-5 sm:px-6 py-4"
            style={tableHdr}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-500 flex items-center justify-center shadow-md ring-4 ring-violet-100">
                <ClipboardList size={16} className="text-white" />
              </div>
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Invoice Items
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {invoice.items.length} item
                  {invoice.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-green-500 via-green-600 to-green-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ring-4 ring-green-100"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={tableHdr}>
                  {[
                    "#",
                    "Description",
                    "Qty",
                    "Rate (₹)",
                    "Amount",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr
                    key={index}
                    className="group transition-colors duration-150"
                    style={{ borderTop: "1px solid var(--border)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--primary-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <td className="px-5 py-4">
                      <span
                        className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                        style={{
                          background: "var(--bg-subtle)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        className="ei-input min-w-[180px]"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        placeholder="Item description"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        className="ei-input"
                        style={{ width: 80, textAlign: "center" }}
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, "qty", Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative" style={{ width: 112 }}>
                        <span
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ₹
                        </span>
                        <input
                          type="number"
                          className="ei-input"
                          style={{ paddingLeft: 28 }}
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "rate",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        style={{
                          color: "var(--red-text)",
                          background: "var(--red-bg)",
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Subtotal row */}
                <tr style={tableHdr}>
                  <td
                    colSpan={4}
                    className="px-5 py-4 text-right text-sm font-bold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Subtotal
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-lg font-extrabold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── NOTES CARD ── */}
        <div
          className="rounded-2xl shadow-lg p-5 sm:p-6"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-500 flex items-center justify-center shadow-md ring-4 ring-cyan-100">
              <FileText size={15} className="text-white" />
            </div>
            <div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Notes
              </h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Optional notes for this invoice
              </p>
            </div>
          </div>
          <textarea
            className="ei-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes or remarks for this invoice..."
            rows={3}
          />
        </div>

        {/* ── SAVE BUTTON ── */}
        <div className="flex items-center gap-3 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ring-4 ring-blue-100"
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
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/payments")}
            className="px-6 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:scale-105"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ── SHARE MODAL ── */}
      <ShareModal
        open={showSharePopup}
        changesList={changesList}
        onShare={shareUpdatedInvoice}
        onSkip={() => navigate("/payments")}
      />
    </div>
  );
}
