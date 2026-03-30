import { useState } from "react";
import { ChevronDown } from "lucide-react";
import React from "react";

const ACCENT_COLORS = ["#20B2AA", "#F5C518", "#4A90E2", "#E07B39", "#9B59B6", "#E74C3C", "#2ECC71"];

const THEMES = ["Dark mode", "Light mode", "System default"];

export default function Preferences({
  theme = "Dark mode",
  accentColor = "#20B2AA",
  onThemeChange,
  onAccentChange,
}) {
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [selectedAccent, setSelectedAccent] = useState(accentColor);
  const [open, setOpen] = useState(false);

  const changeTheme = (t) => {
    setSelectedTheme(t);
    setOpen(false);
    onThemeChange?.(t);
  };

  const changeAccent = (c) => {
    setSelectedAccent(c);
    onAccentChange?.(c);
  };

  return (
    <div className="settings-card preferences-card">
      <h3 className="card-title">Preferences</h3>
      <p className="card-subtitle">(Optional)</p>

      <div className="pref-section">
        <label className="pref-label">Theme</label>
        <div className="custom-select" onClick={() => setOpen(!open)}>
          <span>{selectedTheme}</span>
          <ChevronDown size={14} className={open ? "rotated" : ""} />
          {open && (
            <div className="dropdown-menu">
              {THEMES.map((t) => (
                <div key={t} className="dropdown-item" onClick={() => changeTheme(t)}>
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pref-section">
        <label className="pref-label">Accent color</label>
        <div className="accent-swatches">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${selectedAccent === c ? "active" : ""}`}
              style={{ background: c }}
              onClick={() => changeAccent(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
