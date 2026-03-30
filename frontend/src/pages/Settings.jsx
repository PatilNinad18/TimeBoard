import React from "react";
import { useState } from "react";
import ProductivityRules from "../components/Settings/ProductivityRules";
import BlockingRules from "../components/Settings/BlockingRules";
import TrackingSettings from "../components/Settings/TrackingSettings";
import Categories from "../components/Settings/Categories";
import DataManagement from "../components/Settings/DataManagement";
import Accessibility from "../components/Settings/Accessibility";
import Preferences from "../components/Settings/Preferences";
import DarkModeToggle from "../components/Settings/DarkModeToggle";
import "./Settings.css";

export default function Settings() {
  // ── Global state (lift up to Context/Redux in real app) ──────────────────
  const [darkMode, setDarkMode] = useState(true);
  const [apps, setApps] = useState([]);
  const [blockingRules, setBlockingRules] = useState([]);
  const [idleThreshold, setIdleThreshold] = useState("30 sec");
  const [categories, setCategories] = useState([]);
  const [accessEnabled, setAccessEnabled] = useState(false);
  const [dataMgmtEnabled, setDataMgmtEnabled] = useState(false);
  const [theme, setTheme] = useState("Dark mode");
  const [accentColor, setAccentColor] = useState("#20B2AA");

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    alert("Exporting all data as CSV…");
  };

  const handleDeleteToday = () => {
    if (window.confirm("Delete today's tracking data?")) {
      alert("Today's data cleared.");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("This will reset the entire database. Are you sure?")) {
      alert("All data cleared.");
    }
  };

  return (
    <div className={`settings-page ${darkMode ? "dark" : "light"}`}>
      {/* Page header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <DarkModeToggle darkMode={darkMode} onChange={setDarkMode} />
      </div>

      {/* Grid layout */}
      <div className="settings-grid">

        {/* Column 1 */}
        <div className="settings-col">
          <ProductivityRules apps={apps} onAppsChange={setApps} />
          <Accessibility
            version="12.0"
            enabled={accessEnabled}
            onToggle={setAccessEnabled}
            onExport={handleExport}
          />
        </div>

        {/* Column 2 */}
        <div className="settings-col">
          <BlockingRules rules={blockingRules} onRulesChange={setBlockingRules} />
          <Categories categories={categories} onCategoriesChange={setCategories} />
          <DataManagement
            version="12.0"
            enabled={dataMgmtEnabled}
            onToggle={setDataMgmtEnabled}
            onDeleteToday={handleDeleteToday}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Column 3 */}
        <div className="settings-col">
          <TrackingSettings
            idleThreshold={idleThreshold}
            onIdleChange={setIdleThreshold}
            onStartTracking={() => alert("Tracking started!")}
            onStopTracking={() => alert("Tracking stopped!")}
            onPauseTracking={() => alert("Tracking paused!")}
            onResetData={handleDeleteToday}
          />
          <Preferences
            theme={theme}
            accentColor={accentColor}
            onThemeChange={setTheme}
            onAccentChange={setAccentColor}
          />
        </div>

      </div>
    </div>
  );
}
