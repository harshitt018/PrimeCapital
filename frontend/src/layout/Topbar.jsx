import { useState, useEffect, useRef } from "react";
import {
  Menu,
  LogOut,
  User,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import logoIconLight from "../assets/logo-icon-light.png";
import logoIconDark from "../assets/logo-icon-dark.png";
import { useTheme } from "../../hooks/useTheme";
import { useNavigate } from "react-router-dom";

export default function Topbar({ toggleSidebar, toggleCollapse, isCollapsed }) {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [rotating, setRotating] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    if (showDropdown)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "U";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleToggle = () => {
    if (rotating) return;
    setRotating(true);
    setTimeout(() => {
      toggleTheme();
      setRotating(false);
    }, 300);
  };

  return (
    <header
      className="h-14 w-full flex items-center justify-between px-4 lg:px-6
                      theme-topbar backdrop-blur-lg
                       sticky top-0 z-40 shadow-sm"
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
    >
      {/* ── LEFT ── */}
      <div className="flex items-center gap-2">
        {/* Mobile */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] transition-all duration-200 group md:hidden"
        >
          <Menu
            size={20}
            className="text-slate-600 group-hover:text-slate-900"
          />
        </button>

        {/* Desktop collapse */}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-2 rounded-xl hover:bg-[var(--bg-subtle)] transition-all duration-200 group items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRight
              size={20}
              className="text-slate-600 group-hover:text-slate-900"
            />
          ) : (
            <ChevronLeft
              size={20}
              className="text-slate-600 group-hover:text-slate-900"
            />
          )}
        </button>

        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2">
          <img
            src={isDarkMode ? logoIconDark : logoIconLight}
            alt="PrimeCapital"
            className="h-8 w-8 object-contain"
          />
          <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            PrimeCapital
          </span>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle — simple icon rotate */}
        <button
          onClick={handleToggle}
          className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] transition-all duration-200 group"
          aria-label="Toggle Theme"
        >
          <div
            style={{
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transform: rotating
                ? "rotate(180deg) scale(0.5)"
                : "rotate(0deg) scale(1)",
              opacity: rotating ? 0 : 1,
            }}
          >
            {isDarkMode ? (
              <Sun
                size={20}
                className="text-amber-500 group-hover:text-amber-600"
              />
            ) : (
              <Moon
                size={20}
                className="text-slate-500 group-hover:text-blue-600"
              />
            )}
          </div>
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-slate-200 mx-1" />

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((p) => !p)}
            className="relative group"
          >
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600
                        text-white flex items-center justify-center font-bold text-sm
                        shadow-lg hover:shadow-xl ring-4 ring-transparent hover:ring-blue-100
                        transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {firstLetter}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
          </button>

          {showDropdown && user && (
            <div
              className="absolute right-0 mt-3 w-72 theme-card theme-border
                        rounded-2xl shadow-2xl overflow-hidden z-50"
              style={{ animation: "dropIn 0.2s ease" }}
            >
              {/* User info */}
              <div
                className="p-4"
                style={{
                  background: "var(--bg-subtle)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600
                              text-white flex items-center justify-center font-bold text-lg shadow-lg ring-4 ring-blue-100"
                  >
                    {firstLetter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mail size={11} className="text-slate-400 shrink-0" />
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-[10px] text-green-600 font-semibold">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--primary-bg)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <User
                      size={15}
                      className="text-slate-500 group-hover:text-blue-600"
                    />
                  </div>
                  <span className="font-semibold">View Profile</span>
                </button>

                <div
                  className="my-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600
                           hover:bg-red-50 transition-all duration-150 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                    <LogOut size={15} className="text-red-500" />
                  </div>
                  <span className="font-semibold">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
}
