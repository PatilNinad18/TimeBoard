import React, { useState, useEffect } from "react";
import ProductivityRules from "../components/Settings/ProductivityRules";
import BlockingRules from "../components/Settings/BlockingRules";
import TrackingSettings from "../components/Settings/TrackingSettings";
import Categories from "../components/Settings/Categories";
import DataManagement from "../components/Settings/DataManagement";
import Accessibility from "../components/Settings/Accessibility";
import Preferences from "../components/Settings/Preferences";
import DarkModeToggle from "../components/Settings/DarkModeToggle";
import DistractingAppsSettings from "../components/Settings/DistractingAppsSettings";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import "./Settings.css";

export default function Settings() {
  // ── Global theme from context ────────────────────────────────────────────
  const { darkMode, setDarkMode, accentColor, setAccentColor } = useTheme();

  // ── Local state ──────────────────────────────────────────────────────────
  const [trackedApps, setTrackedApps]         = useState([]);
  const [productiveApps, setProductiveApps]   = useState([]);
  const [blockingRules, setBlockingRules]     = useState([]);
  const [idleThreshold, setIdleThreshold]     = useState("30 sec");
  const [categories, setCategories]           = useState([]);
  const [accessEnabled, setAccessEnabled]     = useState(false);
  const [dataMgmtEnabled, setDataMgmtEnabled] = useState(false);
  const [toast, setToast]                     = useState(null);
  const { userName, distractingApps, updateDistractingApps } = useUser();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Load real data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.api) return;
    async function load() {
      try {
        const saved = await window.api.getProductiveApps();
        setProductiveApps(saved || []);

        const usage = await window.api.getUsage();
        if (usage?.length > 0) {
          setTrackedApps(
            usage.map((u, i) => ({
              id: i + 1,
              name: u.app,
              type: (saved || []).includes(u.app) ? "productive" : "distracting",
            }))
          );
        }
      } catch (err) {
        console.error("Settings load error:", err);
      }
    }
    load();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAppsChange = async (updated) => {
    setTrackedApps(updated);
    if (!window.api) return;
    try {
      const names = updated.filter((a) => a.type === "productive").map((a) => a.name);
      await window.api.setProductiveApps(names);
      setProductiveApps(names);
      showToast("Productivity rules saved");
    } catch {
      showToast("Failed to save rules", "error");
    }
  };

  const handleDistractingAppsChange = async (apps) => {
    await updateDistractingApps(apps);
    showToast("Distracting apps updated");
  };

  const handleExport = async () => {
    if (!window.api) return;
    try {
      const csv  = await window.api.getReportCSV("monthly");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `timeboard-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Exported successfully");
    } catch {
      showToast("Export failed", "error");
    }
  };

  const handleDeleteToday = () => {
    if (!window.confirm("Delete today's tracking data?")) return;
    showToast("Today's data cleared");
  };

  const handleClearAll = () => {
    if (!window.confirm("Reset entire database?")) return;
    showToast("All data cleared");
  };

  return (
    <div 
      className={`settings-page ${darkMode ? "dark" : "light"}`}
      style={{
        '--accent': accentColor,
        '--accent-muted': `${accentColor}20`,
        '--accent-hover': `${accentColor}dd`,
      }}
    >

      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        {/* DarkModeToggle now writes to global context */}
        <DarkModeToggle darkMode={darkMode} onChange={setDarkMode} />
      </div>

      <div className="settings-body">
        <div className="settings-grid">

          <div className="settings-col">
            <ProductivityRules apps={trackedApps} onAppsChange={handleAppsChange} />
            <Accessibility
              version="12.0"
              enabled={accessEnabled}
              onToggle={setAccessEnabled}
              onExport={handleExport}
            />
          </div>

          <div className="settings-col">
            <BlockingRules rules={blockingRules} onRulesChange={setBlockingRules} />
            <DistractingAppsSettings onSave={() => showToast("Distracting apps updated")} />
            {/* <Categories categories={categories} onCategoriesChange={setCategories} /> */}
            <DataManagement
              version="12.0"
              enabled={dataMgmtEnabled}
              onToggle={setDataMgmtEnabled}
              onDeleteToday={handleDeleteToday}
              onClearAll={handleClearAll}
            />
          </div>

          <div className="settings-col">
            <TrackingSettings
              idleThreshold={idleThreshold}
              onIdleChange={setIdleThreshold}
              onStartTracking={() => showToast("Tracking started")}
              onStopTracking={()  => showToast("Tracking stopped")}
              onPauseTracking={()  => showToast("Tracking paused")}
              onResetData={handleDeleteToday}
            />
            {/* Preferences now writes accent + theme to global context */}
            <Preferences
              theme={darkMode ? "Dark mode" : "Light mode"}
              accentColor={accentColor}
              onThemeChange={(t) => setDarkMode(t === "Dark mode")}
              onAccentChange={setAccentColor}
            />
          </div>

        </div>
      </div>

      {toast && (
        <div className={`settings-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}