import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../../../hooks/useTheme";
import api from "../../api/axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  LineChart as LineIcon,
  Info,
  Download,
  FileText,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Filter,
  Loader2,
  ArrowUpRight,
  Star,
  Zap,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ═══════════════════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   INSIGHT CARD
═══════════════════════════════════════════════════════════════════ */
function InsightCard({ title, value, info, icon, grad, ring }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div
      className="group rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md ring-4 ${ring} shrink-0`}
          >
            <div className="text-white">{icon}</div>
          </div>
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            {title}
          </p>
        </div>
        {info && (
          <div
            className="relative shrink-0"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <Info
              size={14}
              className="cursor-pointer hover:text-blue-500 transition-colors"
              style={{ color: "var(--text-muted)" }}
            />
            {showInfo && (
              <div
                className="absolute top-6 right-0 text-white text-xs rounded-xl p-3 w-52 z-20 shadow-2xl leading-relaxed"
                style={{ background: "var(--text-primary)" }}
              >
                {info}
              </div>
            )}
          </div>
        )}
      </div>
      <div
        className="text-lg font-bold leading-snug"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN REPORTS COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Reports() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedType, setSelectedType] = useState("revenue");
  const [timeRange, setTimeRange] = useState("3m");
  const [graphType, setGraphType] = useState("bar");
  const [xAxisType, setXAxisType] = useState("month");
  const [hiddenKeys, setHiddenKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  const [summary, setSummary] = useState({
    revenue: 0,
    pending: 0,
    overdue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [insights, setInsights] = useState({
    topMonth: "",
    growth: 0,
    topCustomer: "",
  });

  useEffect(() => {
    fetchReportData();
  }, [selectedCustomer, selectedType, timeRange, xAxisType]);

  const handleLegendClick = (dataKey) =>
    setHiddenKeys((prev) =>
      prev.includes(dataKey)
        ? prev.filter((k) => k !== dataKey)
        : [...prev, dataKey],
    );

  const handleExportPDF = async () => {
    const element = document.getElementById("report-section");
    if (!element) {
      addToast("Report section not found.", "error");
      return;
    }
    try {
      addToast("Generating PDF...", "info");
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("report.pdf");
      addToast("PDF exported successfully.", "success");
    } catch (e) {
      addToast("Failed to export PDF.", "error");
    }
  };

  const handleExportCSV = () => {
    if (!chartData.length) {
      addToast("No data to export.", "error");
      return;
    }
    const headers = Object.keys(chartData[0]);
    const rows = chartData.map((row) => headers.map((h) => row[h]).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv",
    });
    const a = Object.assign(document.createElement("a"), {
      href: window.URL.createObjectURL(blob),
      download: "report.csv",
    });
    a.click();
    addToast("CSV exported successfully.", "success");
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/payments"),
      ]);
      const invoices = invRes.data;
      const payments = payRes.data;

      const unique = [];
      invoices.forEach((inv) => {
        if (inv.customerId && !unique.find((c) => c._id === inv.customerId._id))
          unique.push(inv.customerId);
      });
      setCustomers(unique);

      const now = new Date();
      let monthsLimit = 3;
      if (timeRange === "6m") monthsLimit = 6;
      if (timeRange === "1y") monthsLimit = 12;

      const inRange = (d) => {
        const diff =
          (now.getFullYear() - d.getFullYear()) * 12 +
          (now.getMonth() - d.getMonth());
        return diff < monthsLimit;
      };

      const filteredPayments = payments.filter((p) =>
        inRange(new Date(p.createdAt)),
      );
      const filteredInvoices = invoices.filter((inv) =>
        inRange(new Date(inv.createdAt)),
      );

      const finalPayments =
        selectedCustomer === "all"
          ? filteredPayments
          : filteredPayments.filter(
              (p) => p.customerId?._id === selectedCustomer,
            );
      const finalInvoices =
        selectedCustomer === "all"
          ? filteredInvoices
          : filteredInvoices.filter(
              (inv) => inv.customerId?._id === selectedCustomer,
            );

      const revenue = finalPayments.reduce(
        (s, p) => s + Number(p.amount || 0),
        0,
      );
      const pending = finalInvoices
        .filter((i) => i.status === "pending")
        .reduce((s, i) => s + Number(i.due || 0), 0);
      const overdue = finalInvoices
        .filter((i) => i.status === "overdue")
        .reduce((s, i) => s + Number(i.due || 0), 0);
      setSummary({ revenue, pending, overdue });

      const dataMap = {};
      const addToMap = (key, field, value) => {
        if (!dataMap[key])
          dataMap[key] = { label: key, revenue: 0, pending: 0, overdue: 0 };
        dataMap[key][field] += value;
      };

      finalPayments.forEach((p) => {
        let key;
        if (xAxisType === "month")
          key = new Date(p.createdAt).toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
        else if (xAxisType === "date")
          key = new Date(p.createdAt)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-");
        else key = p.customerId?.name || "Unknown";
        addToMap(key, "revenue", Number(p.amount || 0));
      });

      finalInvoices.forEach((inv) => {
        let key;
        if (xAxisType === "month")
          key = new Date(inv.createdAt).toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
        else if (xAxisType === "date")
          key = new Date(inv.createdAt)
            .toLocaleDateString("en-GB")
            .replace(/\//g, "-");
        else key = inv.customerId?.name || "Unknown";
        if (inv.status === "pending")
          addToMap(key, "pending", Number(inv.due || 0));
        if (inv.status === "overdue")
          addToMap(key, "overdue", Number(inv.due || 0));
      });

      let finalData = Object.values(dataMap);
      if (xAxisType === "date")
        finalData.sort(
          (a, b) =>
            new Date(a.label.split("-").reverse().join("-")) -
            new Date(b.label.split("-").reverse().join("-")),
        );
      if (selectedType !== "all")
        finalData = finalData.map((d) => ({
          label: d.label,
          [selectedType]: d[selectedType],
        }));
      setChartData(finalData);

      if (finalData.length > 0) {
        let top = finalData.reduce((max, curr) =>
          (curr.revenue || 0) > (max.revenue || 0) ? curr : max,
        );
        let growth = "N/A",
          last = 0,
          prev = 0;
        if (xAxisType === "month" && finalData.length >= 2) {
          last = finalData[finalData.length - 1].revenue || 0;
          prev = finalData[finalData.length - 2].revenue || 0;
          if (last === 0) growth = "Drop to zero";
          else if (prev === 0) growth = "New growth";
          else growth = (((last - prev) / prev) * 100).toFixed(1);
        }
        let customerMap = {};
        finalPayments.forEach((p) => {
          const name = p.customerId?.name || "Unknown";
          if (!customerMap[name]) customerMap[name] = 0;
          customerMap[name] += Number(p.amount || 0);
        });
        let topCustomer = Object.keys(customerMap).length
          ? Object.keys(customerMap).reduce((a, b) =>
              customerMap[a] > customerMap[b] ? a : b,
            )
          : "—";
        const topCustomerRevenue = customerMap[topCustomer] || 0;
        const percentage = revenue
          ? ((topCustomerRevenue / revenue) * 100).toFixed(1)
          : 0;
        setInsights({
          topMonth: top.label,
          topMonthRevenue: top.revenue || 0,
          growth,
          last,
          prev,
          topCustomer,
          topCustomerRevenue,
          percentage,
        });
      }
    } catch (e) {
      console.error(e);
      addToast("Failed to load report data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fmtINR = (v) => {
    if (v === 0) return "₹0";
    const abs = Math.abs(v);
    if (abs >= 1_00_00_000)
      return `₹${(v / 1_00_00_000).toFixed(1).replace(/\.0$/, "")}Cr`;
    if (abs >= 10_00_000) return `₹${(v / 1_00_000).toFixed(0)}L`;
    if (abs >= 1_00_000)
      return `₹${(v / 1_00_000).toFixed(1).replace(/\.0$/, "")}L`;
    if (abs >= 10_000) return `₹${(v / 1_000).toFixed(0)}k`;
    if (abs >= 1_000) return `₹${(v / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    return `₹${v}`;
  };

  /* chart axis / grid colors */
  const axisColor = isDark ? "#555555" : "#94a3b8";
  const gridColor = isDark ? "#3f3f3f" : "#e2e8f0";

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-xl shadow-xl p-3 text-sm"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: p.fill || p.stroke }}
            />
            <span
              className="capitalize"
              style={{ color: "var(--text-secondary)" }}
            >
              {p.dataKey}:
            </span>
            <span
              className="font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              ₹{Number(p.value || 0).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const growthColor =
    insights.growth === "N/A"
      ? "var(--primary)"
      : typeof insights.growth === "string"
        ? "var(--amber-text)"
        : Number(insights.growth) >= 0
          ? "var(--green-text)"
          : "var(--red-text)";

  /* shared select style */
  const selectStyle = {
    background: "var(--bg-input)",
    border: "2px solid var(--border)",
    color: "var(--text-primary)",
    outline: "none",
  };
  const selectFocus = (e) => {
    e.target.style.borderColor = "#2563eb";
    e.target.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.15)";
    e.target.style.background = "var(--bg-card)";
  };
  const selectBlur = (e) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "var(--bg-input)";
  };

  /* header gradient */
  const headerGrad = isDark
    ? "linear-gradient(90deg,#0f172a,#1e293b,#0f172a)"
    : "linear-gradient(90deg,#f8fafc,#eff6ff,#f8fafc)";

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
        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl ring-4 ring-blue-100/20">
                <BarChart3 size={24} className="text-white" />
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
                Reports
              </h1>
              <p
                className="text-xs sm:text-sm mt-0.5 sm:mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Analytics, insights and export tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:scale-105 active:scale-95"
              style={{
                color: "var(--text-secondary)",
                background: "var(--bg-card)",
                border: "2px solid var(--border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-subtle)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-card)")
              }
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-blue-100/20"
            >
              <FileText size={15} /> Export PDF
            </button>
          </div>
        </div>

        {/* ── KPI STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Total Revenue"
            value={`₹${summary.revenue.toLocaleString("en-IN")}`}
            color="green"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="Pending Amount"
            value={`₹${summary.pending.toLocaleString("en-IN")}`}
            color="amber"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            label="Overdue Amount"
            value={`₹${summary.overdue.toLocaleString("en-IN")}`}
            color="red"
          />
        </div>

        {/* ── FILTERS CARD ── */}
        <div
          className="rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex flex-wrap gap-3 items-center">
            {/* Customer filter */}
            <div className="relative">
              <Users
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200"
                style={selectStyle}
                onFocus={selectFocus}
                onBlur={selectBlur}
              >
                <option value="all">All Customers</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            <div className="relative">
              <Filter
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200"
                style={selectStyle}
                onFocus={selectFocus}
                onBlur={selectBlur}
              >
                <option value="all">All Types</option>
                <option value="revenue">Revenue</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* X-Axis filter */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <select
                value={xAxisType}
                onChange={(e) => setXAxisType(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200"
                style={selectStyle}
                onFocus={selectFocus}
                onBlur={selectBlur}
              >
                <option value="month">By Month</option>
                <option value="customer">By Customer</option>
                <option value="date">By Date</option>
              </select>
            </div>

            <div
              className="h-8 w-px hidden sm:block"
              style={{ background: "var(--border)" }}
            />

            {/* Time range pills */}
            <div className="flex gap-2">
              {["3m", "6m", "1y"].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                  style={
                    timeRange === r
                      ? {
                          background: "linear-gradient(135deg,#2563eb,#3b82f6)",
                          color: "#fff",
                          boxShadow: "var(--shadow-md)",
                        }
                      : {
                          background: "var(--bg-subtle)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            <div
              className="h-8 w-px hidden sm:block"
              style={{ background: "var(--border)" }}
            />

            {/* Graph type toggle */}
            <div className="flex gap-2">
              {[
                { key: "bar", Icon: BarChart3, label: "Bar" },
                { key: "line", Icon: LineIcon, label: "Line" },
              ].map(({ key, Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setGraphType(key)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
                  style={
                    graphType === key
                      ? {
                          background: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
                          color: "#fff",
                          boxShadow: "var(--shadow-md)",
                        }
                      : {
                          background: "var(--bg-subtle)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {loading && (
              <div
                className="flex items-center gap-2 text-xs ml-auto"
                style={{ color: "var(--text-muted)" }}
              >
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>

        {/* ── CHART CARD ── */}
        <div
          id="report-section"
          className="rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* chart header */}
          <div
            className="px-5 sm:px-6 py-4"
            style={{
              background: headerGrad,
              borderBottom: "2px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-500 flex items-center justify-center shadow-md ring-4 ring-violet-100/20">
                {graphType === "bar" ? (
                  <BarChart3 size={16} className="text-white" />
                ) : (
                  <LineIcon size={16} className="text-white" />
                )}
              </div>
              <div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Revenue Overview
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {chartData.length} data point
                  {chartData.length !== 1 ? "s" : ""} —{" "}
                  {timeRange.toUpperCase()} view
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="h-72 flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                  <div
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                      border: "4px solid var(--border)",
                      borderTop: "4px solid #2563eb",
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center"
                    style={{ inset: "8px" }}
                  >
                    <BarChart3 size={16} className="text-white" />
                  </div>
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Loading chart data...
                </p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center gap-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                  style={{ background: "var(--bg-subtle)" }}
                >
                  <BarChart3 size={28} style={{ color: "var(--text-muted)" }} />
                </div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No data for the selected filters
                </p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {graphType === "bar" ? (
                    <BarChart data={chartData} barCategoryGap="30%">
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: axisColor }}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: axisColor }}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                        tickFormatter={fmtINR}
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        onClick={(e) => handleLegendClick(e.dataKey)}
                        wrapperStyle={{
                          fontSize: "13px",
                          paddingTop: "16px",
                          color: axisColor,
                        }}
                      />
                      {(selectedType === "all" || selectedType === "revenue") &&
                        !hiddenKeys.includes("revenue") && (
                          <Bar
                            dataKey="revenue"
                            fill="#2563eb"
                            radius={[6, 6, 0, 0]}
                          />
                        )}
                      {(selectedType === "all" || selectedType === "pending") &&
                        !hiddenKeys.includes("pending") && (
                          <Bar
                            dataKey="pending"
                            fill="#f59e0b"
                            radius={[6, 6, 0, 0]}
                          />
                        )}
                      {(selectedType === "all" || selectedType === "overdue") &&
                        !hiddenKeys.includes("overdue") && (
                          <Bar
                            dataKey="overdue"
                            fill="#ef4444"
                            radius={[6, 6, 0, 0]}
                          />
                        )}
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: axisColor }}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: axisColor }}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                        tickFormatter={fmtINR}
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        onClick={(e) => handleLegendClick(e.dataKey)}
                        wrapperStyle={{
                          fontSize: "13px",
                          paddingTop: "16px",
                          color: axisColor,
                        }}
                      />
                      {(selectedType === "all" || selectedType === "revenue") &&
                        !hiddenKeys.includes("revenue") && (
                          <Line
                            dataKey="revenue"
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: "#2563eb" }}
                            activeDot={{ r: 6 }}
                          />
                        )}
                      {(selectedType === "all" || selectedType === "pending") &&
                        !hiddenKeys.includes("pending") && (
                          <Line
                            dataKey="pending"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: "#f59e0b" }}
                            activeDot={{ r: 6 }}
                          />
                        )}
                      {(selectedType === "all" || selectedType === "overdue") &&
                        !hiddenKeys.includes("overdue") && (
                          <Line
                            dataKey="overdue"
                            stroke="#ef4444"
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: "#ef4444" }}
                            activeDot={{ r: 6 }}
                          />
                        )}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── INSIGHTS ROW ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top Month */}
          <InsightCard
            title={
              xAxisType === "customer"
                ? "Top Segment"
                : xAxisType === "date"
                  ? "Top Date"
                  : "Top Month"
            }
            icon={<Star size={14} />}
            grad="from-amber-500 via-amber-600 to-amber-500"
            ring="ring-amber-100"
            value={
              <div>
                <div
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {insights.topMonth || "—"}
                </div>
                <div
                  className="text-sm font-semibold mt-0.5"
                  style={{ color: "var(--green-text)" }}
                >
                  ₹{(insights.topMonthRevenue || 0).toLocaleString("en-IN")}
                </div>
              </div>
            }
          />

          {/* Growth */}
          <InsightCard
            title="Revenue Growth"
            icon={<TrendingUp size={14} />}
            grad="from-green-500 via-green-600 to-green-500"
            ring="ring-green-100"
            info="Growth shows how much revenue changed compared to the previous month. Calculated as: ((Current - Previous) / Previous) × 100"
            value={
              <div>
                <div
                  className="text-base font-bold"
                  style={{ color: growthColor }}
                >
                  {typeof insights.growth === "number" ||
                  !isNaN(insights.growth)
                    ? `${insights.growth}%`
                    : insights.growth}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  ₹{insights.prev || 0} → ₹{insights.last || 0}
                </div>
              </div>
            }
          />

          {/* Top Customer */}
          <InsightCard
            title="Top Customer"
            icon={<Users size={14} />}
            grad="from-blue-500 via-blue-600 to-blue-500"
            ring="ring-blue-100"
            value={
              <div>
                <div
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {insights.topCustomer || "—"}
                </div>
                <div
                  className="text-sm font-semibold mt-0.5"
                  style={{ color: "var(--primary)" }}
                >
                  ₹{(insights.topCustomerRevenue || 0).toLocaleString("en-IN")}{" "}
                  ({insights.percentage || 0}%)
                </div>
              </div>
            }
          />

          {/* Smart Insights */}
          <div
            className="rounded-xl sm:rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all duration-300"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-500 flex items-center justify-center shadow-md ring-4 ring-violet-100/20 shrink-0">
                <Zap size={13} className="text-white" />
              </div>
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Smart Insights
              </p>
            </div>
            <div className="space-y-2">
              {[
                {
                  dot: "bg-blue-500",
                  text: (
                    <>
                      Highest:{" "}
                      <span
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {insights.topMonth || "—"}
                      </span>
                    </>
                  ),
                },
                {
                  dot: "bg-green-500",
                  text: (
                    <>
                      <span
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {insights.topCustomer || "—"}
                      </span>{" "}
                      contributed{" "}
                      <span
                        className="font-bold"
                        style={{ color: "var(--primary)" }}
                      >
                        {insights.percentage || 0}%
                      </span>
                    </>
                  ),
                },
                {
                  dot: "bg-amber-500",
                  text: (
                    <>
                      Trend:{" "}
                      <span
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {insights.growth === "N/A"
                          ? "Not enough data"
                          : Math.abs(Number(insights.growth)) < 1
                            ? "Stable"
                            : Number(insights.growth) > 0
                              ? "Increasing"
                              : "Decreasing"}
                      </span>
                    </>
                  ),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${item.dot} mt-1 shrink-0`}
                  />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TOP CUSTOMER SHARE ── */}
        <div
          className="rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-500 flex items-center justify-center shadow-md ring-4 ring-cyan-100/20">
              <ArrowUpRight size={16} className="text-white" />
            </div>
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Top Customer Share
            </p>
          </div>
          <p
            className="text-lg font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {insights.topCustomer || "—"}
          </p>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "var(--bg-subtle)" }}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${insights.percentage || 0}%` }}
            />
          </div>
          <p
            className="text-sm mt-2 font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {insights.percentage || 0}% of total revenue
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
