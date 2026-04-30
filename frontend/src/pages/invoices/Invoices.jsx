import { useEffect, useState } from "react";
import { useTheme } from "../../../hooks/useTheme";
import { getCustomers } from "../../../services/customers.service";
import { getMyCompany } from "../../../services/company.service";
import api from "../../api/axios";
import InvoicePreview from "./InvoicePreview";
import { getSettings } from "../../../services/settings.service";

export default function Invoices() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([
    { description: "", qty: 1, rate: 0, hsnCode: "" },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [companyPhone, setCompanyPhone] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [transport, setTransport] = useState("");
  const [destination, setDestination] = useState("");
  const [savePath, setSavePath] = useState("D:/Invoices");
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [invoice, setInvoice] = useState({ showBank: true });

  useEffect(() => {
    loadCustomers();
  }, []);

  const showNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 3000);
  };
  const removeNotification = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const loadCustomers = async () => {
    const companyData = await getMyCompany();
    const settings = await getSettings();
    setCompany({ ...companyData, ...settings.company });
    setCompanyPhone(settings.company?.phone || companyData?.phone || "");
    setInvoice(settings.invoice || { showBank: true });

    // ✅ Settings se pdfPath load karo
    if (settings.invoice?.pdfPath) {
      setSavePath(settings.invoice.pdfPath);
    }

    const companyId = companyData._id;
    localStorage.setItem("companyId", companyId);
    const res = await getCustomers(companyId);
    setCustomers(res);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  const addItem = () =>
    setItems([...items, { description: "", qty: 1, rate: 0, hsnCode: "" }]);
  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.qty) * Number(item.rate),
    0,
  );
  const cgstRate = Number(invoice?.cgst ?? 2.5);
  const sgstRate = Number(invoice?.sgst ?? 2.5);
  const gstPercent = cgstRate + sgstRate;
  const gstAmount = (subtotal * gstPercent) / 100;

  const createInvoice = async () => {
    if (!companyPhone) {
      showNotification("Company mobile number is required!", "error");
      return;
    }
    if (!customerId) {
      showNotification("Please select a customer!", "error");
      return;
    }
    if (!dueDate) {
      showNotification("Please select due date!", "error");
      return;
    }
    setLoading(true);
    try {
      const comp = await getMyCompany();
      const res = await api.post("/invoices", {
        companyId: comp._id,
        customerId,
        items,
        dueDate,
      });
      setInvoiceData(res.data);
      setInvoiceNo(res.data.invoiceNo);
      showNotification("Invoice created successfully! 🎉", "success");
      setTimeout(
        () => showNotification("Invoice saved to " + savePath, "info"),
        1000,
      );
    } catch (err) {
      console.error(err.response?.data);
      showNotification("Failed to create invoice. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () =>
    showNotification("Invoice downloaded successfully! 📥", "success");
  const handleShare = () =>
    showNotification("Invoice shared successfully! 📤", "success");

  /* ── shared input style ── */
  const inputStyle = {
    background: "var(--bg-input)",
    border: "2px solid var(--border)",
    color: "var(--text-primary)",
    outline: "none",
  };
  const onFocus = (e) => {
    e.target.style.borderColor = "#2563eb";
    e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";
    e.target.style.background = "var(--bg-card)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "var(--bg-input)";
  };

  /* ── section divider ── */
  const SectionTitle = ({ children }) => (
    <h3
      className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
      style={{ color: "var(--text-secondary)" }}
    >
      <span className="w-1 h-4 bg-blue-600 rounded-full" />
      {children}
    </h3>
  );

  /* ── label ── */
  const Label = ({ children, required }) => (
    <label
      className="block text-xs font-medium mb-1.5"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      style={{
        background: "var(--bg-base)",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* ── PAGE HEADER ── */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl ring-4 ring-blue-100/20">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
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
                Invoice Management
              </h1>
              <p
                className="text-xs sm:text-sm mt-0.5 sm:mt-1 flex items-center gap-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--text-muted)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Create and manage professional invoices with ease
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ══════════════════════════════════
              LEFT SIDE — FORM
          ══════════════════════════════════ */}
          <div
            className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 rounded-xl p-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span>Create New Invoice</span>
                </h2>
                {invoiceNo && (
                  <div className="bg-white bg-opacity-20 px-3 py-1 rounded-lg">
                    <p className="text-white text-xs font-semibold">
                      #{invoiceNo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* ── Company Details ── */}
              <div className="space-y-4">
                <SectionTitle>Company Details</SectionTitle>

                {/* Company Phone (readonly) */}
                <div>
                  <Label required>Company Mobile Number</Label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={companyPhone}
                      readOnly
                      className="rounded-xl p-3 pl-11 w-full text-sm"
                      style={{
                        ...inputStyle,
                        background: "var(--bg-subtle)",
                        cursor: "not-allowed",
                        color: "var(--text-muted)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Prefix</Label>
                    <input
                      type="text"
                      placeholder="e.g. INV"
                      className="rounded-xl p-3 w-full text-sm transition-all duration-200"
                      style={inputStyle}
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                  <div>
                    <Label>Transport</Label>
                    <input
                      type="text"
                      placeholder="Optional"
                      className="rounded-xl p-3 w-full text-sm transition-all duration-200"
                      style={inputStyle}
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                <div>
                  <Label>Destination</Label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="rounded-xl p-3 w-full text-sm transition-all duration-200"
                    style={inputStyle}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>

              {/* ── Customer Selection ── */}
              <div
                className="space-y-4 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <SectionTitle>Customer Information</SectionTitle>

                <div>
                  <Label required>Select Customer</Label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </span>
                    <select
                      className="rounded-xl p-3.5 pl-11 w-full text-sm appearance-none cursor-pointer transition-all duration-200 font-medium"
                      style={inputStyle}
                      value={customerId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setCustomerId(id);
                        setSelectedCustomer(
                          customers.find((c) => c._id === id),
                        );
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      <option value="">Choose a customer</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </div>

                  {selectedCustomer && (
                    <div
                      className="mt-3 rounded-xl p-3"
                      style={{
                        background: "var(--primary-bg)",
                        border: "1px solid var(--border-focus)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 rounded-full p-2 shrink-0">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {selectedCustomer.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {selectedCustomer.email ||
                              selectedCustomer.phone ||
                              "Customer selected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Invoice Items ── */}
              <div
                className="space-y-4 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <SectionTitle>Invoice Items</SectionTitle>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: "var(--primary-bg)",
                      color: "var(--primary)",
                    }}
                  >
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-4 transition-all duration-200"
                      style={{
                        background: "var(--bg-subtle)",
                        border: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#2563eb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "var(--border)")
                      }
                    >
                      {/* Item header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-500 text-white rounded-lg w-7 h-7 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Item #{i + 1}
                          </span>
                        </div>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(i)}
                            className="p-1.5 rounded-lg transition-all duration-200"
                            style={{ color: "var(--red-text)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--red-bg)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <input
                          placeholder="Item description"
                          className="rounded-lg p-2.5 w-full text-sm transition-all duration-200"
                          style={inputStyle}
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(i, "description", e.target.value)
                          }
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              className="block text-xs font-medium mb-1"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Quantity
                            </label>
                            <input
                              type="number"
                              placeholder="Qty"
                              className="rounded-lg p-2.5 w-full text-sm transition-all duration-200"
                              style={inputStyle}
                              value={item.qty}
                              onChange={(e) =>
                                handleItemChange(i, "qty", e.target.value)
                              }
                              onFocus={onFocus}
                              onBlur={onBlur}
                            />
                          </div>
                          <div>
                            <label
                              className="block text-xs font-medium mb-1"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Rate (₹)
                            </label>
                            <input
                              type="number"
                              placeholder="Rate"
                              className="rounded-lg p-2.5 w-full text-sm transition-all duration-200"
                              style={inputStyle}
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(i, "rate", e.target.value)
                              }
                              onFocus={onFocus}
                              onBlur={onBlur}
                            />
                          </div>
                          <div>
                            <label
                              className="block text-xs font-medium mb-1"
                              style={{ color: "var(--text-muted)" }}
                            >
                              HSN Code
                            </label>
                            <input
                              type="text"
                              placeholder="Optional"
                              className="rounded-lg p-2.5 w-full text-sm transition-all duration-200"
                              style={inputStyle}
                              value={item.hsnCode}
                              onChange={(e) =>
                                handleItemChange(i, "hsnCode", e.target.value)
                              }
                              onFocus={onFocus}
                              onBlur={onBlur}
                            />
                          </div>
                        </div>

                        {item.qty && item.rate ? (
                          <div
                            className="rounded-lg p-2.5 text-right"
                            style={{
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-focus)",
                            }}
                          >
                            <span
                              className="text-xs font-medium"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Amount:{" "}
                            </span>
                            <span
                              className="font-bold text-base"
                              style={{ color: "var(--primary)" }}
                            >
                              ₹
                              {(
                                Number(item.qty) * Number(item.rate)
                              ).toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item button */}
                <button
                  onClick={addItem}
                  className="w-full border-2 border-dashed py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Item
                </button>
              </div>

              {/* ── Summary ── */}
              <div
                className="space-y-3 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{
                    background: isDark
                      ? "linear-gradient(135deg,#1a2744,#1e293b)"
                      : "linear-gradient(135deg,#eff6ff,#f5f3ff)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {[
                    [
                      "Subtotal:",
                      `₹${subtotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                    ],
                    [
                      `GST (${gstPercent}%):`,
                      `₹${gstAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span
                        className="font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between text-lg font-bold pt-3"
                    style={{ borderTop: "2px solid var(--border)" }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>
                      Total Amount:
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">
                      ₹
                      {(subtotal + gstAmount).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Save Path & Due Date ── */}
              <div
                className="space-y-3 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div>
                  <Label>Save Location</Label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={savePath}
                      onChange={(e) => setSavePath(e.target.value)}
                      className="rounded-xl p-3 pl-11 w-full text-sm transition-all duration-200"
                      style={inputStyle}
                      placeholder="e.g. D:/Invoices"
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="rounded-xl p-3 w-full text-sm transition-all duration-200"
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
              </div>

              {/* ── Create Button ── */}
              <button
                onClick={createInvoice}
                disabled={loading}
                className="w-full text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Create Invoice
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE — LIVE PREVIEW */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <InvoicePreview
              company={
                company
                  ? { ...company, phone: companyPhone || company.phone }
                  : null
              }
              customer={selectedCustomer}
              items={items}
              subtotal={subtotal}
              gstAmount={gstAmount}
              invoiceNo={invoiceNo}
              invoiceData={invoiceData}
              transport={transport}
              destination={destination}
              savePath={savePath}
              invoicePrefix={invoicePrefix}
              onDownload={handleDownload}
              onShare={handleShare}
              invoiceSettings={invoice}
            />
          </div>
        </div>
      </div>

      {/* ── NOTIFICATION MODALS ── */}
      {notifications.map((notif) => {
        const isSuccess = notif.type === "success";
        const isError = notif.type === "error";
        const iconBg = isSuccess
          ? "var(--green-bg)"
          : isError
            ? "var(--red-bg)"
            : "var(--primary-bg)";
        const iconColor = isSuccess
          ? "var(--green-text)"
          : isError
            ? "var(--red-text)"
            : "var(--primary)";
        const titleColor = iconColor;
        const btnGrad = isSuccess
          ? "from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          : isError
            ? "from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
            : "from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600";

        return (
          <div
            key={notif.id}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
              background: "rgba(0,0,0,0.6)",
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={() => removeNotification(notif.id)}
          >
            <div
              className="rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                animation: "scaleIn 0.3s ease-out",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: iconBg }}
                >
                  {isSuccess && (
                    <svg
                      className="w-10 h-10"
                      style={{ color: iconColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {isError && (
                    <svg
                      className="w-10 h-10"
                      style={{ color: iconColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {!isSuccess && !isError && (
                    <svg
                      className="w-10 h-10"
                      style={{ color: iconColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: titleColor }}
              >
                {isSuccess ? "Success!" : isError ? "Error!" : "Information"}
              </h3>
              <p
                className="text-lg mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                {notif.message}
              </p>

              <button
                onClick={() => removeNotification(notif.id)}
                className={`px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${btnGrad} transform transition-all duration-200 hover:scale-105`}
              >
                OK, Got it!
              </button>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}
