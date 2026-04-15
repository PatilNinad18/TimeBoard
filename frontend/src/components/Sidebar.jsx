import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import dashboardIcon from "../assets/dashboard.png";
import analyticsIcon from "../assets/google-analytics.png";
import settingsIcon   from "../assets/setting.png";
import reportsIcon    from "../assets/documents.png";
import timeIcon       from "../assets/time-management.png";

const NAV_ITEMS = [
  { to: "/",          label: "Dashboard", icon: dashboardIcon },
  { to: "/activity",  label: "Activity",  icon: reportsIcon   },
  { to: "/analytics", label: "Analytics", icon: analyticsIcon },
  { to: "/reports",   label: "Reports",   icon: reportsIcon   },
  { to: "/settings",  label: "Settings",  icon: settingsIcon  },
];

export default function Sidebar() {
  const { darkMode } = useTheme();

  return (
    <div className="sidebar" data-theme={darkMode ? "dark" : "light"}>
      {/* Logo */}
      <div className="sidebar-logo">
        <img src={timeIcon} alt="TimeBoard" className="sidebar-logo-icon" />
        <span className="sidebar-logo-text">TimeBoard</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <img
                  src={icon}
                  alt={label}
                  className="sidebar-link-icon"
                  style={{ filter: isActive ? "none" : "grayscale(100%) opacity(0.5)" }}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}