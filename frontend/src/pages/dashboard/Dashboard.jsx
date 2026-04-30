import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCompany } from "../../../services/company.service";
import AddCompanyModal from "./AddCompanyModal";
import { useTheme } from "../../../hooks/useTheme";
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
  Building2,
  Plus,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart as LineIcon,
  CreditCard,
  Loader2,
  ArrowUpRight,
  Zap,
} from "lucide-react";

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
            className="text-xl sm:text-2xl font-bold mt-0.5"
            style={{ color: "var(--text-primary)" }}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
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
          <span className="font-bold" style={{ color: "var(--text-primary)" }}>
            ₹{Number(p.value || 0).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [graphType, setGraphType] = useState("bar");
  const [timeRange, setTimeRange] = useState("6m");
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, []);
  useEffect(() => {
    if (company) fetchDashboardData();
  }, [timeRange]);

  const fetchCompany = async () => {
    try {
      const data = await getMyCompany();
      setCompany(data);
      localStorage.setItem("hasCompany", "true");
      window.dispatchEvent(new Event("companyUpdated"));
      fetchDashboardData();
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const h = { Authorization: `Bearer ${token}` };
      const [invRes, payRes, actRes] = await Promise.all([
        fetch("http://localhost:5000/api/invoices", { headers: h }),
        fetch("http://localhost:5000/api/payments", { headers: h }),
        fetch("http://localhost:5000/api/activity", { headers: h }),
      ]);
      const invData = await invRes.json();
      const payData = await payRes.json();
      const actData = await actRes.json();
      const invList = Array.isArray(invData) ? invData : invData.invoices || [];
      const payList = Array.isArray(payData) ? payData : payData.payments || [];
      const actList = Array.isArray(actData) ? actData : [];
      setInvoices(invList);
      setPayments(payList);
      setActivities(actList.slice(0, 5));

      const now = new Date();
      const monthsLimit = timeRange === "3m" ? 3 : timeRange === "1y" ? 12 : 6;
      const dataMap = {};
      for (let i = monthsLimit - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleString("default", {
          month: "short",
          year: "2-digit",
        });
        dataMap[key] = { label: key, revenue: 0, pending: 0, overdue: 0 };
      }
      payList.forEach((p) => {
        const d = new Date(p.createdAt);
        const diff =
          (now.getFullYear() - d.getFullYear()) * 12 +
          (now.getMonth() - d.getMonth());
        if (diff < monthsLimit) {
          const key = d.toLocaleString("default", {
            month: "short",
            year: "2-digit",
          });
          if (dataMap[key]) dataMap[key].revenue += Number(p.amount || 0);
        }
      });
      invList.forEach((inv) => {
        const d = new Date(inv.createdAt);
        const diff =
          (now.getFullYear() - d.getFullYear()) * 12 +
          (now.getMonth() - d.getMonth());
        if (diff < monthsLimit) {
          const key = d.toLocaleString("default", {
            month: "short",
            year: "2-digit",
          });
          if (dataMap[key]) {
            if (inv.status === "pending")
              dataMap[key].pending += Number(inv.due || 0);
            if (inv.status === "overdue")
              dataMap[key].overdue += Number(inv.due || 0);
          }
        }
      });
      setChartData(Object.values(dataMap));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const axisStroke = isDark ? "#1e293b" : "#e2e8f0";
  const spinnerTrack = isDark ? "#1e293b" : "#e2e8f0";

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-full min-h-[60vh]"
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
                border: `4px solid ${spinnerTrack}`,
                borderTop: "4px solid #2563eb",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <div
              className="absolute rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-lg"
              style={{ inset: "8px" }}
            >
              <Building2 size={18} className="text-white" />
            </div>
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Loading dashboard...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!company) {
    return (
      <>
        <div
          className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-6"
          style={{
            background: "var(--bg-base)",
            fontFamily: "'Inter','Segoe UI',sans-serif",
          }}
        >
          <div className="max-w-md w-full">
            <div
              className="rounded-2xl shadow-xl p-8 text-center"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl ring-4 ring-blue-100">
                <Building2 size={36} className="text-white" />
              </div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                No Company Found
              </h2>
              <p
                className="mb-6 leading-relaxed text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                You don't have a company profile yet. Create one to start
                managing your invoices, customers, and payments.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg ring-4 ring-blue-100"
              >
                <Plus size={18} /> Add Your Company
              </button>
              <div
                className="mt-8 pt-6 grid grid-cols-2 gap-3 text-xs"
                style={{
                  borderTop: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {[
                  [FileText, "Create Invoices"],
                  [Users, "Manage Customers"],
                  [CreditCard, "Track Payments"],
                  [TrendingUp, "View Reports"],
                ].map(([Icon, label]) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={14} className="text-blue-500" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {showModal && (
          <AddCompanyModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchCompany}
          />
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalInvoices = invoices.length;
  const uniqueCustomers = [
    ...new Set(invoices.map((i) => i.customerId?._id).filter(Boolean)),
  ].length;
  const pendingAmt = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + Number(i.due || 0), 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const pendingCount = invoices.filter((i) => i.status === "pending").length;

  const now = new Date();
  const thisMonthInv = invoices.filter((i) => {
    const d = new Date(i.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const thisMonthRev = payments
    .filter((p) => {
      const d = new Date(p.createdAt);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const lastMonthRev = payments
    .filter((p) => {
      const d = new Date(p.createdAt);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
      );
    })
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const growth =
    lastMonthRev > 0
      ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
      : null;

  const ACT_CFG = {
    payment_received: {
      color: "bg-gradient-to-br from-green-500 to-green-600",
      badge: "bg-green-100 text-green-700",
      label: "Paid",
    },
    invoice_created: {
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      badge: "bg-blue-100 text-blue-700",
      label: "Created",
    },
    invoice_updated: {
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      badge: "bg-amber-100 text-amber-700",
      label: "Updated",
    },
    invoice_deleted: {
      color: "bg-gradient-to-br from-red-500 to-red-600",
      badge: "bg-red-100 text-red-700",
      label: "Deleted",
    },
    reminder_sent: {
      color: "bg-gradient-to-br from-violet-500 to-violet-600",
      badge: "bg-violet-100 text-violet-700",
      label: "Reminder",
    },
  };

  const fmtINR = (v) => {
    if (!v) return "₹0";
    if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(1)}Cr`;
    if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(1)}L`;
    if (v >= 1_000) return `₹${(v / 1_000).toFixed(1)}k`;
    return `₹${v}`;
  };

  const QUICK_ACTIONS = [
    {
      label: "Create New Invoice",
      desc: "Generate GST-compliant invoices",
      Icon: FileText,
      color: "from-blue-500 to-blue-600",
      ring: "ring-blue-100",
      action: () => navigate("/invoices"),
    },
    {
      label: "Add Customer",
      desc: "Add new customer to database",
      Icon: Users,
      color: "from-violet-500 to-violet-600",
      ring: "ring-violet-100",
      action: () => {
        navigate("/customers");
        setTimeout(
          () => window.dispatchEvent(new CustomEvent("openAddCustomer")),
          100,
        );
      },
    },
    {
      label: "View All Invoices",
      desc: "Browse and manage invoices",
      Icon: BarChart3,
      color: "from-emerald-500 to-emerald-600",
      ring: "ring-emerald-100",
      action: () => navigate("/payments?tab=invoices"),
    },
    {
      label: "Customer Management",
      desc: "Manage customer details and history",
      Icon: Building2,
      color: "from-amber-500 to-amber-600",
      ring: "ring-amber-100",
      action: () => navigate("/customers"),
    },
  ];

  // card header style
  const cardHeader = {
    background: isDark
      ? "linear-gradient(90deg, #0f172a, #1e293b, #0f172a)"
      : "linear-gradient(90deg, #f8fafc, #eff6ff, #f8fafc)",
    borderBottom: `2px solid var(--border)`,
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 flex items-center justify-center shadow-xl ring-4 ring-blue-100">
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
                Dashboard
              </h1>
              <p
                className="text-xs sm:text-sm mt-0.5 sm:mt-1 flex items-center gap-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                <Building2 size={12} style={{ color: "var(--text-muted)" }} />
                Welcome back,{" "}
                <span
                  className="font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {company.name}
                </span>
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-sm text-sm font-medium"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <Calendar size={15} className="text-blue-500" />
            {new Date().toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Total Revenue"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
            color="green"
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Total Invoices"
            value={totalInvoices}
            color="blue"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Customers with Invoices"
            value={uniqueCustomers}
            color="violet"
          />
          <StatCard
            icon={<AlertTriangle size={20} />}
            label="Pending Amount"
            value={`₹${pendingAmt.toLocaleString("en-IN")}`}
            color="amber"
          />
        </div>

        {/* ── GRAPH + QUICK ACTIONS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Graph */}
          <div
            className="lg:col-span-2 rounded-2xl shadow-lg overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={cardHeader}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-violet-600 to-violet-500 flex items-center justify-center shadow-md ring-4 ring-violet-100">
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
                    {timeRange === "3m"
                      ? "Last 3 months"
                      : timeRange === "1y"
                        ? "Last 12 months"
                        : "Last 6 months"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 mr-1">
                  {["3m", "6m", "1y"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${timeRange === r ? "bg-blue-600 text-white shadow-sm" : ""}`}
                      style={
                        timeRange !== r
                          ? {
                              background: "var(--bg-subtle)",
                              color: "var(--text-muted)",
                            }
                          : {}
                      }
                    >
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
                {[
                  ["bar", BarChart3],
                  ["line", LineIcon],
                ].map(([type, Icon]) => (
                  <button
                    key={type}
                    onClick={() => setGraphType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${graphType === type ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md" : ""}`}
                    style={
                      graphType !== type
                        ? {
                            background: "var(--bg-subtle)",
                            color: "var(--text-secondary)",
                          }
                        : {}
                    }
                  >
                    <Icon size={12} />{" "}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              {dataLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-12 h-12">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `3px solid ${spinnerTrack}`,
                          borderTop: "3px solid #2563eb",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <div
                        className="absolute rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                        style={{ inset: "6px" }}
                      >
                        <BarChart3 size={13} className="text-white" />
                      </div>
                    </div>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Loading chart...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {graphType === "bar" ? (
                      <BarChart data={chartData} barCategoryGap="30%">
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: axisColor }}
                          axisLine={{ stroke: axisStroke }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: axisColor }}
                          axisLine={{ stroke: axisStroke }}
                          tickLine={false}
                          tickFormatter={fmtINR}
                          width={55}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "var(--bg-subtle)" }}
                        />
                        <Legend
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "12px",
                            color: axisColor,
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#2563eb"
                          radius={[5, 5, 0, 0]}
                        />
                        <Bar
                          dataKey="pending"
                          fill="#f59e0b"
                          radius={[5, 5, 0, 0]}
                        />
                        <Bar
                          dataKey="overdue"
                          fill="#ef4444"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData}>
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: axisColor }}
                          axisLine={{ stroke: axisStroke }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: axisColor }}
                          axisLine={{ stroke: axisStroke }}
                          tickLine={false}
                          tickFormatter={fmtINR}
                          width={55}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "12px",
                            color: axisColor,
                          }}
                        />
                        <Line
                          dataKey="revenue"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "#2563eb" }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          dataKey="pending"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "#f59e0b" }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          dataKey="overdue"
                          stroke="#ef4444"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "#ef4444" }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-2xl shadow-lg overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={cardHeader}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-md ring-4 ring-blue-100">
                <Zap size={16} className="text-white" />
              </div>
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Quick Actions
              </h3>
            </div>
            <div className="p-4 space-y-2.5">
              {QUICK_ACTIONS.map(
                ({ label, desc, Icon, color, ring, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 group text-left hover:border-blue-300"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--primary-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md ring-4 ${ring} shrink-0 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon size={15} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-bold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {desc}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="group-hover:text-blue-500 shrink-0 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>
                ),
              )}
              <button
                onClick={() => navigate("/invoices")}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-blue-100"
              >
                <Plus size={15} /> Create Invoice Now
              </button>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left: 3 insight cards */}
          <div className="space-y-4">
            {[
              {
                title: "Payment Status",
                Icon: CheckCircle,
                iconGrad: "from-green-500 to-green-600",
                iconRing: "ring-green-100",
                rows: [
                  {
                    label: "Paid Invoices",
                    value: `${paidCount} invoices`,
                    cls: "text-green-600 font-bold",
                  },
                  {
                    label: "Pending Payments",
                    value: `${pendingCount} invoices`,
                    cls: "text-amber-600 font-bold",
                  },
                  {
                    label: "Overdue",
                    value: `${overdueCount} invoices`,
                    cls: "text-red-600 font-bold",
                  },
                ],
              },
              {
                title: "This Month",
                Icon: Calendar,
                iconGrad: "from-blue-500 to-blue-600",
                iconRing: "ring-blue-100",
                rows: [
                  {
                    label: "Invoices Created",
                    value: thisMonthInv.length,
                    cls: "font-bold",
                  },
                  {
                    label: "New Customers",
                    value: uniqueCustomers,
                    cls: "font-bold",
                  },
                  {
                    label: "Revenue Growth",
                    value: growth
                      ? `${growth > 0 ? "+" : ""}${growth}%`
                      : "N/A",
                    cls:
                      growth && Number(growth) >= 0
                        ? "text-green-600 font-bold"
                        : "text-red-500 font-bold",
                  },
                ],
              },
              {
                title: "Attention Required",
                Icon: AlertTriangle,
                iconGrad: "from-amber-500 to-amber-600",
                iconRing: "ring-amber-100",
                rows: [
                  {
                    label: "Overdue Invoices",
                    value: overdueCount,
                    cls:
                      overdueCount > 0 ? "text-red-600 font-bold" : "font-bold",
                  },
                  {
                    label: "Due This Week",
                    value: invoices.filter((i) => {
                      if (!i.dueDate) return false;
                      const diff =
                        (new Date(i.dueDate) - new Date()) /
                        (1000 * 60 * 60 * 24);
                      return diff >= 0 && diff <= 7 && i.status !== "paid";
                    }).length,
                    cls: "text-amber-600 font-bold",
                  },
                  {
                    label: "Pending Payments",
                    value: pendingCount,
                    cls:
                      pendingCount > 0
                        ? "text-amber-600 font-bold"
                        : "font-bold",
                  },
                ],
              },
            ].map(({ title, Icon, iconGrad, iconRing, rows }) => (
              <div
                key={title}
                className="rounded-2xl shadow-lg p-5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${iconGrad} flex items-center justify-center shadow-md ring-4 ${iconRing}`}
                  >
                    <Icon size={14} className="text-white" />
                  </div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {title}
                  </p>
                </div>
                <div className="space-y-3">
                  {rows.map(({ label, value, cls }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center text-sm"
                    >
                      <span style={{ color: "var(--text-secondary)" }}>
                        {label}
                      </span>
                      <span
                        className={cls}
                        style={
                          !cls.includes("text-")
                            ? { color: "var(--text-primary)" }
                            : {}
                        }
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Recent Activity */}
          <div
            className="lg:col-span-2 rounded-2xl shadow-lg overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={cardHeader}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-500 flex items-center justify-center shadow-md ring-4 ring-cyan-100">
                  <Activity size={16} className="text-white" />
                </div>
                <h3
                  className="text-sm font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Recent Activity
                </h3>
              </div>
              <button
                onClick={() => navigate("/payments?tab=history")}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-400 transition-colors"
              >
                View All <ArrowUpRight size={13} />
              </button>
            </div>

            <div style={{ borderTop: "none" }}>
              {dataLoading ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 size={24} className="text-blue-500 animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity
                    size={32}
                    className="mx-auto mb-3"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No recent activity
                  </p>
                </div>
              ) : (
                activities.map((act, i) => {
                  const cfg = ACT_CFG[act.type] || {
                    color: "bg-gradient-to-br from-slate-400 to-slate-500",
                    badge: "bg-slate-100 text-slate-600",
                    label: act.type,
                  };
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-5 py-4 transition-colors duration-150"
                      style={{ borderBottom: `1px solid var(--border)` }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--primary-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${cfg.color} flex items-center justify-center shadow-md shrink-0`}
                      >
                        <FileText size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {act.customerId?.name || "—"}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {act.invoiceNo || act.invoiceId?.invoiceNo
                            ? `Invoice ${act.invoiceNo || act.invoiceId?.invoiceNo}`
                            : cfg.label}
                          {" · "}
                          {new Date(act.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}
                        >
                          {cfg.label}
                        </span>
                        {act.type === "payment_received" && (
                          <span className="text-xs font-bold text-green-500">
                            ₹{Number(act.amount || 0).toLocaleString("en-IN")}
                          </span>
                        )}
                        {act.type === "invoice_deleted" && (
                          <span className="text-xs font-bold text-red-500">
                            ₹
                            {Number(act.due || act.amount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <AddCompanyModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchCompany}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
