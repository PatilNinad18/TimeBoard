import { Sun, Moon } from "lucide-react";
import { useState } from "react";
import React from "react";

export default function DarkModeToggle({ darkMode = true, onChange }) {
  const [isDark, setIsDark] = useState(darkMode);

  const toggle = () => {
    setIsDark(!isDark);
    onChange?.(!isDark);
  };

  return (
    <div className="darkmode-toggle-card">
      <div className="darkmode-inner">
        {isDark ? <Moon size={18} className="mode-icon" /> : <Sun size={18} className="mode-icon" />}
        <span>Dark Mode</span>
        <button
          className={`toggle-switch large ${isDark ? "on" : "off"}`}
          onClick={toggle}
          role="switch"
          aria-checked={isDark}
        >
          <span className="toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
