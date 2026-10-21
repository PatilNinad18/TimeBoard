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
  const [blockingRules, setBlockingRules]     = useState([]);
  const [idleThreshold, setIdleThreshold]     = useState("30 sec");
  const [categories, setCategories]           = useState([]);
  const [accessEnabled, setAccessEnabled]     = useState(false);
  const [dataMgmtEnabled, setDataMgmtEnabled] = useState(false);
  const [toast, setToast]                     = useState(null);
  const { userName, distractingApps, updateDistractingApps, refreshTrigger, triggerRefresh } = useUser();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ── Load real data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.api) return;
    async function load() {
      try {
        const [savedBlocked, usage] = await Promise.all([
          window.api.getBlockedApps ? window.api.getBlockedApps() : Promise.resolve([]),
          window.api.getUsage(),
        ]);

        if (usage?.length > 0) {
          const blockedSet = new Set((savedBlocked || []).map(a => a.toLowerCase()));

          setTrackedApps(
            usage.map((u, i) => {
              const lower = (u.app || "").toLowerCase();
              const type = blockedSet.has(lower) ? "distracting" : (u.category || "").toLowerCase() === "distracting" ? "distracting" : "productive";

              return {
                id: i + 1,
                name: u.app,
                type,
              };
            })
          );
        } else {
          setTrackedApps([]);
        }
      } catch (err) {
        console.error("Settings load error:", err);
      }
    }
    load();
  }, [refreshTrigger]);

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

  const handleDeleteToday = async () => {
    if (!window.confirm("Are you sure you want to delete today's tracking data? This cannot be undone.")) return;
    try {
      if (window.api?.deleteTodayData) {
        const res = await window.api.deleteTodayData();
        if (res && res.success === false) {
          showToast("Failed to delete today's data", "error");
          return;
        }
      }
      setTrackedApps([]);
      triggerRefresh?.();
      showToast("Today's data deleted successfully");
    } catch (err) {
      console.error("Error deleting today's data:", err);
      showToast("Failed to delete today's data", "error");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to reset the database? All tracking data will be permanently cleared.")) return;
    try {
      if (window.api?.clearAllData) {
        const res = await window.api.clearAllData();
        if (res && res.success === false) {
          showToast("Failed to clear database", "error");
          return;
        }
      }
      setTrackedApps([]);
      triggerRefresh?.();
      showToast("All data cleared successfully");
    } catch (err) {
      console.error("Error clearing database:", err);
      showToast("Failed to clear database", "error");
    }
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
            <ProductivityRules apps={trackedApps} />
            <Accessibility
              version="12.0"
              enabled={accessEnabled}
              onToggle={setAccessEnabled}
              onExport={handleExport}
            />
          </div>

          <div className="settings-col">
            {/* <BlockingRules rules={blockingRules} onRulesChange={setBlockingRules} /> */}
            <DistractingAppsSettings onSave={() => showToast("Distracting apps updated")} />
            {/* <Categories categories={categories} onCategoriesChange={setCategories} /> */}
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

            <DataManagement
              version="12.0"
              enabled={dataMgmtEnabled}
              onToggle={setDataMgmtEnabled}
              onDeleteToday={handleDeleteToday}
              onClearAll={handleClearAll}
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