import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

const Header = () => {
  const { darkMode } = useTheme();
  const { userName }  = useUser();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app-header" data-theme={darkMode ? "dark" : "light"}>
      <div>
        <h2 className="app-header-title">
          Welcome back, {userName || "there"} 👋
        </h2>
        <p className="app-header-date">{today}</p>
      </div>
      <div className="app-header-avatar-wrap">
        <div className="app-header-avatar-initial" style={{ background: "var(--accent)" }}>
          {(userName || "U")[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default Header;