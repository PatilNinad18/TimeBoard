import React from "react";
import { useTheme } from "../context/ThemeContext";

const Header = () => {
  const { darkMode } = useTheme();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app-header" data-theme={darkMode ? "dark" : "light"}>
      <div>
        <h2 className="app-header-title">Welcome back, Ninad 👋</h2>
        <p className="app-header-date">{today}</p>
      </div>
      <img
        src="https://avatars.githubusercontent.com/u/9919?v=4"
        alt="User Avatar"
        className="app-header-avatar"
      />
    </div>
  );
};

export default Header;