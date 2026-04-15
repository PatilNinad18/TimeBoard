import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode]     = useState(false);
  const [accentColor, setAccentColor] = useState("#F5C518");

  // Apply to :root whenever they change
  useEffect(() => {
    const root = document.documentElement;

    // Accent color — every page reads from --accent on :root
    root.style.setProperty("--accent", accentColor);

    // Derive a muted version automatically
    root.style.setProperty("--accent-muted", hexToRgba(accentColor, 0.13));
    root.style.setProperty("--accent-dark",  darken(accentColor, 0.15));

    // Dark / light surface tokens on :root
    if (darkMode) {
      root.style.setProperty("--bg",             "#1a1a1f");
      root.style.setProperty("--surface",        "#24242b");
      root.style.setProperty("--surface-2",      "#2e2e38");
      root.style.setProperty("--surface-3",      "#35353f");
      root.style.setProperty("--border",         "#35353f");
      root.style.setProperty("--text-primary",   "#f0f0f5");
      root.style.setProperty("--text-secondary", "#8888a0");
      root.style.setProperty("--text-tertiary",  "#55556a");
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.style.setProperty("--bg",             "#f0f0f5");
      root.style.setProperty("--surface",        "#ffffff");
      root.style.setProperty("--surface-2",      "#f5f5fa");
      root.style.setProperty("--surface-3",      "#ededf4");
      root.style.setProperty("--border",         "#e2e2ec");
      root.style.setProperty("--text-primary",   "#18181f");
      root.style.setProperty("--text-secondary", "#70708a");
      root.style.setProperty("--text-tertiary",  "#a0a0b8");
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [darkMode, accentColor]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darken(hex, amount) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - Math.round(255 * amount));
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - Math.round(255 * amount));
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - Math.round(255 * amount));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}