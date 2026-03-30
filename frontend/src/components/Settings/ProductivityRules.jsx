import { useState } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import React from "react";

const APP_ICONS = {
  "VS Code": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg",
  Chrome: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg",
  YouTube: null,
  Safari: null,
  "Google C...": null,
  Televahon: null,
  Messenger: null,
};

const DEFAULT_APPS = [
  { id: 1, name: "VS Code", type: "productive" },
  { id: 2, name: "Chrome", type: "distracting" },
  { id: 3, name: "YouTube", type: "productive" },
  { id: 4, name: "Safari", type: "productive" },
  { id: 5, name: "Google C...", type: "distracting" },
  { id: 6, name: "Televahon", type: "distracting" },
  { id: 7, name: "Messenger", type: "distracting" },
];

const AppIcon = ({ name }) => {
  const colors = {
    "VS Code": "#007ACC",
    Chrome: "#4285F4",
    YouTube: "#FF0000",
    Safari: "#006CFF",
    "Google C...": "#EA4335",
    Televahon: "#2AABEE",
    Messenger: "#0084FF",
  };
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className="app-icon-fallback"
      style={{ background: colors[name] || "#888" }}
    >
      {initials}
    </div>
  );
};

export default function ProductivityRules({ apps = DEFAULT_APPS, onAppsChange }) {
  const [search, setSearch] = useState("");
  const [appList, setAppList] = useState(apps);

  const filtered = appList.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleType = (id) => {
    const updated = appList.map((a) =>
      a.id === id
        ? { ...a, type: a.type === "productive" ? "distracting" : "productive" }
        : a
    );
    setAppList(updated);
    onAppsChange?.(updated);
  };

  return (
    <div className="settings-card productivity-rules">
      <h3 className="card-title">Productivity Rules</h3>
      <p className="card-subtitle">Define app classification</p>

      <div className="search-box">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search Detected Apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="app-list">
        {filtered.map((app) => (
          <div key={app.id} className="app-row" onClick={() => toggleType(app.id)}>
            <AppIcon name={app.name} />
            <span className="app-name">{app.name}</span>
            <span className={`app-badge ${app.type}`}>
              {app.type === "productive" ? (
                <><CheckCircle2 size={11} /> Productive</>
              ) : (
                <><XCircle size={11} /> Distracting</>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
