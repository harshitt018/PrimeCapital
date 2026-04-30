import { useEffect, useState } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../../services/customers.service";
import { getMyCompany } from "../../../services/company.service";
import { useTheme } from "../../../hooks/useTheme";
import {
  Users,
  Plus,
  Search,
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  X,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Building2,
  ArrowUpRight,
  Edit3,
  Circle,
  Loader2,
} from "lucide-react";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

/* ── StatCard ── */
function StatCard({ icon, label, value, color }) {
  const cfg =
    {
      blue: {
        grad: "from-blue-500 via-blue-600 to-blue-500",
        ring: "ring-blue-100",
      },
      green: {
        grad: "from-green-500 via-green-600 to-green-500",
        ring: "ring-green-100",
      },
      amber: {
        grad: "from-amber-500 via-amber-600 to-amber-500",
        ring: "ring-amber-100",
      },
    }[color] || {};
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
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${cfg.grad} flex items-center justify-center shadow-xl ring-4 ${cfg.ring} group-hover:scale-110 transition-transform duration-300`}
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

/* ── Input ── */
function Input({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  required = false,
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
        <div
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
          style={{ color: "var(--text-muted)" }}
        >
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm transition-all duration-200"
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
      </div>
    </div>
  );
}

/* ── AddCustomerModal ── */
function AddCustomerModal({
  onClose,
  onSuccess,
  companyId,
  customer,
  existingCustomers = [],
  companyGst = "",
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "",
    contactNo: "",
    email: "",
    gstNo: "",
    address: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [confirmPopup, setConfirmPopup] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        contactNo: customer.contactNo || "",
        email: customer.email || "",
        gstNo: customer.gstNo || "",
        address: customer.billingAddress || "",
        isActive: customer.isActive ?? true,
      });
    } else {
      setForm({
        name: "",
        contactNo: "",
        email: "",
        gstNo: "",
        address: "",
        isActive: true,
      });
    }
  }, [customer]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showPopup = (type, title, message) =>
    setPopup({ show: true, type, title, message });
  const closePopup = () => {
    const wasSuccess = popup.type === "success";
    setPopup({ show: false, type: "", title: "", message: "" });
    if (wasSuccess) {
      onSuccess();
      onClose();
    }
  };

  const performSave = async () => {
    setLoading(true);
    try {
      if (customer) {
        await updateCustomer(customer._id, {
          companyId,
          name: form.name,
          contactNo: form.contactNo,
          email: form.email,
          gstNo: form.gstNo,
          billingAddress: form.address,
          isActive: form.isActive,
        });
        showPopup(
          "success",
          "Customer Updated",
          "Customer updated successfully",
        );
      } else {
        await createCustomer({
          companyId,
          name: form.name,
          contactNo: form.contactNo,
          email: form.email,
          gstNo: form.gstNo,
          billingAddress: form.address,
          isActive: form.isActive,
        });
        showPopup("success", "Customer Added", "Customer created successfully");
      }
    } catch (err) {
      let errorTitle = "Validation Error",
        errorMessage = [];
      if (err.response?.data) {
        const data = err.response.data;
        if (Array.isArray(data.errors))
          errorMessage = data.errors.map((e) => e.msg);
        else if (data.message) {
          if (
            data.message.includes("already exists") ||
            data.message.includes("duplicate")
          )
            errorTitle = "Duplicate Entry";
          errorMessage = [data.message];
        } else if (data.error) errorMessage = [data.error];
        else errorMessage = ["Something went wrong"];
      } else errorMessage = [err.message || "Something went wrong"];
      showPopup("error", errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (form.gstNo && !gstRegex.test(form.gstNo.toUpperCase())) {
      showPopup(
        "error",
        "Invalid GST",
        "Invalid GSTIN format. Example: 27AAAAP1234A1ZM",
      );
      return;
    }

    if (form.gstNo) {
      const enteredGst = form.gstNo.toUpperCase().trim();

      const duplicateCustomer = existingCustomers.find(
        (c) =>
          c.gstNo &&
          c.gstNo.toUpperCase().trim() === enteredGst &&
          c._id !== customer?._id,
      );

      const matchesCompanyGst =
        companyGst && companyGst.toUpperCase().trim() === enteredGst;

      if (duplicateCustomer && matchesCompanyGst) {
        setConfirmPopup({
          show: true,
          title: "Duplicate Customer GST",
          message: `A customer named "${duplicateCustomer.name}" already has the same GST number (${enteredGst}). This could be the same company's different branch. Do you still want to save?`,
          onConfirm: () => {
            setConfirmPopup({
              show: false,
              title: "",
              message: "",
              onConfirm: null,
            });
            setConfirmPopup({
              show: true,
              title: "Matches Your Company GST",
              message: `This customer's GST number (${enteredGst}) is the same as your company's GST number. Are you sure you want to add this as a customer?`,
              onConfirm: () => {
                setConfirmPopup({
                  show: false,
                  title: "",
                  message: "",
                  onConfirm: null,
                });
                performSave();
              },
            });
          },
        });
        return;
      }

      if (duplicateCustomer) {
        setConfirmPopup({
          show: true,
          title: "Duplicate Customer GST",
          message: `A customer named "${duplicateCustomer.name}" already has the same GST number (${enteredGst}). This could be the same company's different branch. Do you still want to save?`,
          onConfirm: () => {
            setConfirmPopup({
              show: false,
              title: "",
              message: "",
              onConfirm: null,
            });
            performSave();
          },
        });
        return;
      }

      if (matchesCompanyGst) {
        setConfirmPopup({
          show: true,
          title: "Matches Your Company GST",
          message: `This customer's GST number (${enteredGst}) is the same as your company's GST number. Are you sure you want to add this as a customer?`,
          onConfirm: () => {
            setConfirmPopup({
              show: false,
              title: "",
              message: "",
              onConfirm: null,
            });
            performSave();
          },
        });
        return;
      }
    }

    performSave();
  };

  return (
    <>
      <div
        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        <div
          className="rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[95vh] flex flex-col"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 sm:p-6 flex-shrink-0"
            style={{
              borderBottom: "1px solid var(--border)",
              background: isDark
                ? "linear-gradient(135deg,#0f172a,#1e293b)"
                : "linear-gradient(135deg,#eff6ff,#fff)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-lg ring-4 ring-blue-100/20">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h2
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {customer ? "Edit Customer" : "Add New Customer"}
                </h2>
                <p
                  className="text-xs sm:text-sm mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {customer
                    ? "Update customer details"
                    : "Create a customer profile"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-subtle)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            <Input
              name="name"
              label="Customer Name"
              value={form.name}
              onChange={handleChange}
              icon={<User size={16} />}
              placeholder="Enter full name"
              required
            />
            <Input
              name="contactNo"
              label="Contact Number"
              value={form.contactNo}
              onChange={handleChange}
              icon={<Phone size={16} />}
              placeholder="Mobile number"
              required
            />
            <Input
              name="email"
              label="Email Address"
              value={form.email}
              onChange={handleChange}
              icon={<Mail size={16} />}
              placeholder="customer@example.com"
              type="email"
              required
            />
            <Input
              name="gstNo"
              label="GST Number"
              value={form.gstNo}
              onChange={handleChange}
              icon={<FileText size={16} />}
              placeholder="27AAAAP1234A1ZM"
            />
            <Input
              name="address"
              label="Address"
              value={form.address}
              onChange={handleChange}
              icon={<MapPin size={16} />}
              placeholder="Street, City, State"
              required
            />

            {/* Status */}
            <div className="space-y-1.5">
              <label
                className="block text-xs sm:text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Customer Status
              </label>
              <select
                name="isActive"
                value={String(form.isActive)}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === "true" })
                }
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200 appearance-none"
                style={{
                  background: "var(--bg-input)",
                  border: "2px solid var(--border)",
                  color: "var(--text-primary)",
                  outline: "none",
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
              >
                <option value="true">✓ Active</option>
                <option value="false">⊘ Inactive</option>
              </select>
              <p
                className="text-xs flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Circle
                  size={10}
                  className={
                    form.isActive
                      ? "text-green-500 fill-current"
                      : "text-gray-500 fill-current"
                  }
                />
                {form.isActive
                  ? "Customer is currently active"
                  : "Customer is currently inactive"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 flex-shrink-0"
            style={{
              borderTop: "1px solid var(--border)",
              background: "var(--bg-subtle)",
            }}
          >
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-card)",
                border: "2px solid var(--border)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2
                    size={14}
                    style={{ animation: "spin 0.7s linear infinite" }}
                  />{" "}
                  Saving...
                </>
              ) : customer ? (
                "Update Customer"
              ) : (
                "Save Customer"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Popup */}
      {confirmPopup.show && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "scaleIn 0.25s ease",
            }}
          >
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-amber-500">
                <AlertCircle size={36} className="text-white" />
              </div>
              <h2
                className="text-lg sm:text-xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {confirmPopup.title}
              </h2>
              <p
                className="text-xs sm:text-sm leading-relaxed px-2 sm:px-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {confirmPopup.message}
              </p>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex gap-3">
              <button
                onClick={() =>
                  setConfirmPopup({
                    show: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                  })
                }
                className="flex-1 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-subtle)",
                  border: "2px solid var(--border)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPopup.onConfirm}
                className="flex-1 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Yes, Save Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup */}
      {popup.show && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4"
          style={{
            background: "rgba(0,0,0,0.6)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "scaleIn 0.25s ease",
            }}
          >
            <div className="p-6 sm:p-8 text-center">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
              >
                {popup.type === "success" ? (
                  <CheckCircle size={36} className="text-white" />
                ) : (
                  <AlertCircle size={36} className="text-white" />
                )}
              </div>
              <h2
                className="text-lg sm:text-xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {popup.title}
              </h2>
              <div
                className="text-xs sm:text-sm leading-relaxed px-2 sm:px-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {Array.isArray(popup.message) ? (
                  <ul className="text-left space-y-2">
                    {popup.message.map((msg, i) => (
                      <li key={i}>• {msg}</li>
                    ))}
                  </ul>
                ) : (
                  <span>{popup.message}</span>
                )}
              </div>
            </div>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <button
                onClick={closePopup}
                className={`w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 ${popup.type === "success" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════════════════
   MAIN CUSTOMERS COMPONENT
══════════════════════════════════════════════════ */
export default function Customers() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteCustomerData, setDeleteCustomerData] = useState(null);

  useEffect(() => {
    window.addEventListener("openAddCustomer", () => setShowModal(true));
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const c = await getMyCompany();
      setCompany(c);
      localStorage.setItem("companyId", c._id);
      const list = await getCustomers(c._id);
      setCustomers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactNo?.includes(searchTerm),
  );

  const totalDue = customers.reduce((s, c) => s + (c.totalDue || 0), 0);
  const activeCustomers = customers.filter((c) => c.isActive === true).length;

  const cardHdr = {
    background: isDark
      ? "linear-gradient(90deg,#0f172a,#1e293b,#0f172a)"
      : "linear-gradient(90deg,#f8fafc,#eff6ff,#f8fafc)",
    borderBottom: "2px solid var(--border)",
  };

  const statusBadge = (c) => {
    if (!c.isActive)
      return {
        style: {
          background: "var(--bg-subtle)",
          color: "var(--text-secondary)",
          borderColor: "var(--border)",
        },
        Icon: Circle,
        label: "Inactive",
        extra: "fill-current",
      };
    if (c.totalDue > 0)
      return {
        style: {
          background: "rgba(251,191,36,0.15)",
          color: "#f59e0b",
          borderColor: "#f59e0b",
        },
        Icon: Circle,
        label: "Pending",
        extra: "fill-current",
      };
    return {
      style: {
        background: "var(--green-bg)",
        color: "var(--green-text)",
        borderColor: "var(--green)",
      },
      Icon: CheckCircle,
      label: "Active",
      extra: "",
    };
  };

  return (
    <div
      className="min-h-screen p-3 sm:p-6 lg:p-8"
      style={{
        background: "var(--bg-base)",
        fontFamily: "'Inter','Segoe UI',sans-serif",
      }}
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl ring-4 ring-blue-100/20">
                <Users size={24} className="text-white" />
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
                Customer Management
              </h1>
              <p
                className="text-xs sm:text-sm mt-0.5 sm:mt-1 flex items-center gap-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                <Building2 size={12} style={{ color: "var(--text-muted)" }} />{" "}
                Manage your customer relationships
              </p>
            </div>
          </div>
          <button
            disabled={!company}
            onClick={() => setShowModal(true)}
            className={`group flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all duration-300 w-full sm:w-auto ${company ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white hover:shadow-xl hover:scale-105 active:scale-95" : "cursor-not-allowed opacity-50"}`}
            style={
              !company
                ? { background: "var(--bg-subtle)", color: "var(--text-muted)" }
                : {}
            }
          >
            <Plus size={18} /> Add New Customer
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            icon={<Users size={20} />}
            label="Total Customers"
            value={customers.length}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Active Customers"
            value={activeCustomers}
            color="green"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Total Outstanding"
            value={`₹${totalDue.toLocaleString("en-IN")}`}
            color="amber"
          />
        </div>

        {/* ── SEARCH ── */}
        <div
          className="rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              name="search-customers"
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all duration-200"
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
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div
          className="hidden lg:block rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={cardHdr}>
                  {[
                    "Customer",
                    "Contact Info",
                    "GST Number",
                    "Total Due",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${h === "Total Due" ? "text-right" : h === "Status" || h === "Actions" ? "text-center" : "text-left"}`}
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ borderTop: "none" }}>
                {loading && (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className="w-12 h-12 border-4 rounded-full animate-spin"
                          style={{
                            borderColor: "var(--border)",
                            borderTopColor: "#2563eb",
                          }}
                        />
                        <p
                          className="font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Loading customers...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner"
                          style={{ background: "var(--bg-subtle)" }}
                        >
                          <Users
                            size={40}
                            style={{ color: "var(--text-muted)" }}
                          />
                        </div>
                        <div>
                          <p
                            className="text-lg font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            No customers found
                          </p>
                          <p
                            className="text-sm mt-2"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {searchTerm
                              ? "Try adjusting your search criteria"
                              : "Get started by adding your first customer"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredCustomers.map((c) => {
                  const badge = statusBadge(c);
                  return (
                    <tr
                      key={c._id}
                      className="group transition-all duration-200"
                      style={{ borderTop: `1px solid var(--border)` }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--primary-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <User size={20} className="text-white" />
                          </div>
                          <p
                            className="font-semibold transition-colors"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {c.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 text-sm">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: "var(--bg-subtle)" }}
                            >
                              <Phone
                                size={14}
                                style={{ color: "var(--text-muted)" }}
                              />
                            </div>
                            <span
                              className="font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {c.contactNo || "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: "var(--bg-subtle)" }}
                            >
                              <Mail
                                size={14}
                                style={{ color: "var(--text-muted)" }}
                              />
                            </div>
                            <span style={{ color: "var(--text-secondary)" }}>
                              {c.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: isDark ? "#2a1f00" : "#fffbeb",
                            }}
                          >
                            <FileText size={16} className="text-amber-500" />
                          </div>
                          <span
                            className="text-sm font-mono font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {c.gstNo || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span
                          className={`text-lg font-bold ${c.totalDue > 0 ? "text-red-500" : ""}`}
                          style={
                            !c.totalDue ? { color: "var(--text-primary)" } : {}
                          }
                        >
                          ₹{(c.totalDue || 0).toLocaleString("en-IN")}
                        </span>
                        {c.totalDue > 0 && (
                          <p className="text-xs text-red-500 font-medium mt-0.5">
                            Outstanding
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                            style={badge.style}
                          >
                            <badge.Icon size={8} className={badge.extra} />{" "}
                            {badge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCustomer(c);
                              setShowModal(true);
                            }}
                            className="px-4 py-2 text-xs font-bold rounded-lg transition-colors duration-200"
                            style={{
                              color: "var(--primary)",
                              background: "var(--primary-bg)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteCustomerData(c)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-200"
                            style={{
                              color: "var(--red-text)",
                              background: "var(--red-bg)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="lg:hidden space-y-3 sm:space-y-4">
          {loading && (
            <div
              className="rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin"
                  style={{
                    borderColor: "var(--border)",
                    borderTopColor: "#2563eb",
                  }}
                />
                <p
                  className="font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Loading customers...
                </p>
              </div>
            </div>
          )}
          {!loading && filteredCustomers.length === 0 && (
            <div
              className="rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner mx-auto mb-4"
                style={{ background: "var(--bg-subtle)" }}
              >
                <Users size={32} style={{ color: "var(--text-muted)" }} />
              </div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                No customers found
              </p>
              <p
                className="text-sm mt-2"
                style={{ color: "var(--text-muted)" }}
              >
                {searchTerm
                  ? "Try different keywords"
                  : "Add your first customer to get started"}
              </p>
            </div>
          )}
          {filteredCustomers.map((c) => {
            const badge = statusBadge(c);
            return (
              <div
                key={c._id}
                className="rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 transition-all duration-300"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-sm sm:text-base truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {c.name}
                      </p>
                      <p
                        className="text-xs font-mono mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        ID: #{c._id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                      style={badge.style}
                    >
                      <badge.Icon size={10} className={badge.extra} />{" "}
                      {badge.label}
                    </span>
                    <button
                      onClick={() => {
                        setEditingCustomer(c);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors"
                      style={{
                        color: "var(--primary)",
                        background: "var(--primary-bg)",
                      }}
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteCustomerData(c)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors duration-200"
                      style={{
                        color: "var(--red-text)",
                        background: "var(--red-bg)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div
                  className="space-y-2.5 sm:space-y-3 py-3 sm:py-4"
                  style={{
                    borderTop: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {[
                    [Phone, c.contactNo || "-"],
                    [Mail, c.email],
                    ...(c.gstNo ? [[FileText, c.gstNo]] : []),
                  ].map(([Icon, text], i) => (
                    <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "var(--bg-subtle)" }}
                      >
                        <Icon
                          size={14}
                          style={{ color: "var(--text-muted)" }}
                        />
                      </div>
                      <span
                        className="text-xs sm:text-sm truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 sm:pt-4">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Total Outstanding
                    </p>
                    <p
                      className={`text-xl sm:text-2xl font-bold mt-1 ${c.totalDue > 0 ? "text-red-500" : ""}`}
                      style={
                        !c.totalDue ? { color: "var(--text-primary)" } : {}
                      }
                    >
                      ₹{(c.totalDue || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      {deleteCustomerData && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle size={22} className="text-red-600" />
            </div>
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Delete Customer
            </h2>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--text-secondary)" }}
            >
              Are you sure you want to delete{" "}
              <b style={{ color: "var(--text-primary)" }}>
                {deleteCustomerData.name}
              </b>
              ? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeleteCustomerData(null)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                style={{
                  color: "var(--text-secondary)",
                  background: "var(--bg-subtle)",
                  border: "2px solid var(--border)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteCustomer(deleteCustomerData._id);
                  setDeleteCustomerData(null);
                  loadData();
                }}
                className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <AddCustomerModal
          companyId={company?._id}
          companyGst={company?.gstin}
          existingCustomers={customers}
          customer={editingCustomer}
          onClose={() => {
            setShowModal(false);
            setEditingCustomer(null);
          }}
          onSuccess={loadData}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
