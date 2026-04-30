import { useState } from "react";
import { saveCompany } from "../../../services/company.service";
import {
  X,
  Building2,
  MapPin,
  FileText,
  Globe,
  Hash,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";

export default function AddCompanyModal({ onClose, onSuccess }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    name: "",
    address: "",
    gstin: "",
    state: "",
    stateCode: "",
    city: "",
    pincode: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (form.gstin && !gstRegex.test(form.gstin.toUpperCase())) {
      setError("Invalid GSTIN format. Example: 27AAAAA0000A1Z5");
      setLoading(false);
      return;
    }

    try {
      await saveCompany(form);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to add company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0,0,0,0.6)", animation: "fadeIn 0.15s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          animation: "fadeUp 0.2s ease",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex items-center justify-between p-5 sm:p-6"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #0f172a, #1e293b)"
              : "linear-gradient(135deg, #eff6ff, #ffffff)",
            borderBottom: `1px solid var(--border)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center shadow-lg ring-4 ring-blue-100/20">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Add Company
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                Create your company profile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
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

        {/* ── FORM ── */}
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          {error && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "var(--red-bg)",
                color: "var(--red-text)",
                border: "1px solid var(--red)",
              }}
            >
              <span>⚠</span> {error}
            </div>
          )}

          <FormInput
            label="Company Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            icon={<Building2 size={15} />}
            placeholder="ABC Pvt. Ltd."
            required
          />

          <FormInput
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            icon={<MapPin size={15} />}
            placeholder="Street, City, State"
          />

          <FormInput
            label="GSTIN"
            name="gstin"
            value={form.gstin}
            onChange={handleChange}
            icon={<FileText size={15} />}
            placeholder="27AAAAA0000A1Z5"
            hint="15-digit GST Identification Number"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              icon={<Globe size={15} />}
              placeholder="Maharashtra"
            />
            <FormInput
              label="State Code"
              name="stateCode"
              value={form.stateCode}
              onChange={handleChange}
              icon={<Hash size={15} />}
              placeholder="27"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              icon={<MapPin size={15} />}
              placeholder="Mumbai"
            />
            <FormInput
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              icon={<Hash size={15} />}
              placeholder="400001"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Company Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              icon={<Phone size={15} />}
              placeholder="+91 98765 43210"
            />
            <FormInput
              label="Company Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              icon={<Mail size={15} />}
              placeholder="company@example.com"
            />
          </div>
        </form>

        {/* ── FOOTER ── */}
        <div
          className="flex items-center justify-end gap-3 px-5 sm:px-6 py-4"
          style={{
            borderTop: `1px solid var(--border)`,
            background: "var(--bg-subtle)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
              border: "2px solid var(--border)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-strong)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2
                  size={15}
                  style={{ animation: "spin 0.7s linear infinite" }}
                />{" "}
                Saving...
              </>
            ) : (
              <>
                <Building2 size={15} /> Save Company
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ── Form Input Component ── */
function FormInput({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
  required,
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
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200"
          style={{ color: "var(--text-muted)" }}
        >
          {icon}
        </div>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-sm transition-all duration-200"
          style={{
            background: "var(--bg-input)",
            border: "2px solid var(--border)",
            color: "var(--text-primary)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--border-focus)";
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.boxShadow = "0 0 0 4px var(--primary-ring)";
            e.currentTarget.previousSibling.style.color = "var(--primary)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--bg-input)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.previousSibling.style.color = "var(--text-muted)";
          }}
        />
      </div>
      {hint && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
