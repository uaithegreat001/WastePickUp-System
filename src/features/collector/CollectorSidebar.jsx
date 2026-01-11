import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../auth/AuthContext";
import logo from "../../assets/Logo-Transparent.png";

export default function CollectorSidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: "hugeicons:dashboard-square-02",
      path: "/collector/dashboard",
    },
    {
      name: "History",
      icon: "hugeicons:clock-01",
      path: "/collector/history",
    },
    {
      name: "Settings",
      icon: "hugeicons:settings-01",
      path: "/collector/settings",
    },
  ];

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex h-14 items-center justify-center border-b border-gray-200 p-3">
        <img
          src={logo}
          alt="WastePickUp Logo"
          className="h-full w-auto object-contain max-h-8"
        />
      </div>

      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <Icon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <Icon icon="hugeicons:logout-01" className="w-5 h-5" />
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
