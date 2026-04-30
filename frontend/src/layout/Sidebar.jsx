import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getMyCompany } from "../../services/company.service";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

import logoIconLight from "../assets/logo-icon-light.png";
import logoIconDark from "../assets/logo-icon-dark.png";

export default function Sidebar({ isOpen, closeSidebar, isCollapsed }) {
  const [hasCompany, setHasCompany] = useState(false);
  const [company, setCompany] = useState(null);
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    fetchCompany();
    const handler = () => fetchCompany();
    window.addEventListener("companyUpdated", handler);
    return () => window.removeEventListener("companyUpdated", handler);
  }, []);

  const fetchCompany = async () => {
    try {
      const data = await getMyCompany();
      setHasCompany(true);
      setCompany(data);
    } catch {
      setHasCompany(false);
      setCompany(null);
    }
  };

  const NAV_ITEMS = [
    {
      to: "/dashboard",
      label: "Dashboard",
      Icon: LayoutDashboard,
      requiresCompany: false,
    },
    {
      to: "/customers",
      label: "Customers",
      Icon: Users,
      requiresCompany: true,
    },
    {
      to: "/invoices",
      label: "Invoices",
      Icon: FileText,
      requiresCompany: true,
    },
    {
      to: "/payments",
      label: "Payments",
      Icon: CreditCard,
      requiresCompany: true,
    },
    {
      to: "/reports",
      label: "Reports",
      Icon: BarChart3,
      requiresCompany: true,
    },
  ];

  const NavItem = ({ to, label, Icon, disabled }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={disabled ? "#" : to}
        onClick={() => {
          if (!disabled && window.innerWidth < 768) closeSidebar();
        }}
        className={`group relative flex items-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
          ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"}
          ${disabled ? "cursor-not-allowed opacity-30" : ""}
          ${isActive ? "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white shadow-lg" : ""}
        `}
        style={!disabled && !isActive ? { color: "var(--text-secondary)" } : {}}
        onMouseEnter={(e) => {
          if (!disabled && !isActive) {
            e.currentTarget.style.background = "var(--bg-card-hover)";
            e.currentTarget.style.color = "var(--primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isActive) {
            e.currentTarget.style.background = "";
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
      >
        {isActive && !isCollapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full opacity-70" />
        )}

        <div
          className={`shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
        >
          <Icon size={19} />
        </div>

        <span
          className={`transition-all duration-200 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
        >
          {label}
        </span>

        {/* Tooltip — collapsed mode */}
        {isCollapsed && (
          <div
            className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-xl
                         opacity-0 invisible group-hover:opacity-100 group-hover:visible
                         transition-all duration-200 whitespace-nowrap z-50 shadow-xl pointer-events-none"
            style={{
              background: isDark ? "#1e293b" : "#0f172a",
              color: "#fff",
            }}
          >
            {label}
            <div
              className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent"
              style={{ borderRightColor: isDark ? "#1e293b" : "#0f172a" }}
            />
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          style={{ animation: "fadeIn 0.2s ease" }}
        />
      )}

      <aside
        className={`
          fixed left-0 z-40 flex flex-col
          h-[calc(100vh-3.5rem)] top-14
          transition-all duration-300 ease-in-out shadow-xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 p-4
          md:static md:translate-x-0 md:h-full md:top-0
          ${isCollapsed ? "md:w-20 md:px-3 md:py-4" : "md:w-64 md:p-4"}
        `}
        style={{
          background: "var(--bg-nav)",
          borderRight: "1px solid var(--border)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
          transition:
            "transform 0.3s ease, background 0.3s ease, border-color 0.3s ease, width 0.3s ease",
        }}
      >
        {/* ── LOGO ── */}
        <div
          className={`hidden md:flex items-center mb-6 ${isCollapsed ? "justify-center px-0" : "gap-3 px-2"}`}
        >
          <img
            src={isDark ? logoIconDark : logoIconLight}
            alt="PrimeCapital"
            className="w-9 h-9 transition-all duration-300 object-contain"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent leading-tight">
                PrimeCapital
              </span>
              <span
                className="text-[9px] tracking-widest uppercase font-semibold"
                style={{ color: "var(--text-muted)" }}
              >
                Financial Suite
              </span>
            </div>
          )}
        </div>

        {/* ── NAV ── */}
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ to, label, Icon, requiresCompany }) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              Icon={Icon}
              disabled={requiresCompany && !hasCompany}
            />
          ))}

          <div
            className="my-2 mx-2"
            style={{ borderTop: "1px solid var(--border)" }}
          />

          {!isCollapsed && (
            <p
              className="text-[9px] font-bold uppercase tracking-widest px-3 mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Preferences
            </p>
          )}

          <NavItem
            to="/settings"
            label="Settings"
            Icon={Settings}
            disabled={false}
          />
        </nav>

        {/* ── COMPANY CARD ── */}
        {hasCompany && company && (
          <div
            className="mt-4 pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {!isCollapsed ? (
              <div
                className="rounded-2xl p-3.5 transition-all duration-300"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-md shrink-0">
                    <Building2 size={17} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[9px] uppercase tracking-widest font-bold mb-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Company
                    </p>
                    <p
                      className="text-sm font-bold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {company.name}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center group relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform duration-200">
                  <Building2 size={18} className="text-white" />
                </div>
                <div
                  className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-xl
                               opacity-0 invisible group-hover:opacity-100 group-hover:visible
                               transition-all duration-200 whitespace-nowrap z-50 shadow-xl pointer-events-none bottom-0"
                  style={{
                    background: isDark ? "#1e293b" : "#0f172a",
                    color: "#fff",
                  }}
                >
                  {company.name}
                  <div
                    className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent"
                    style={{ borderRightColor: isDark ? "#1e293b" : "#0f172a" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </>
  );
}
