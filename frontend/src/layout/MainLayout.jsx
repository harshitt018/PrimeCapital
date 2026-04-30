import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  const [isOpen, setIsOpen] = useState(false); // mobile sidebar
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop sidebar

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 768) {
      // DESKTOP
      setIsCollapsed((prev) => !prev);
    } else {
      // MOBILE
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <Sidebar
        isOpen={isOpen}
        closeSidebar={() => setIsOpen(false)}
        isCollapsed={isCollapsed}
      />

      <div className="flex flex-col flex-1">
        <Topbar
          toggleSidebar={handleToggleSidebar}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)} // ← YE ADD KARO
          isCollapsed={isCollapsed} // ← YE ADD KARO
        />

        <main
          className="flex-1 overflow-y-auto p-0"
          style={{ background: "var(--bg-base)" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
