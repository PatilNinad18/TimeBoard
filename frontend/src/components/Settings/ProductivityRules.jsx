import React, { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";

const ICON_COLORS = [
  "#007ACC","#4285F4","#FF0000","#006CFF","#EA4335",
  "#2AABEE","#0084FF","#F5C518","#E07B39","#9B59B6",
];

const AppIcon = ({ name }) => {
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bg = ICON_COLORS[hash % ICON_COLORS.length];
  return (
    <div className="app-icon-fallback" style={{ background: bg }}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

export default function ProductivityRules({ apps = [], onAppsChange }) {
  const [search, setSearch] = useState("");
  const [appList, setAppList] = useState(apps);

  // Sync when parent passes updated apps (on first load from DB)
  useEffect(() => {
    setAppList(apps);
  }, [apps]);

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
          placeholder="Search detected apps…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="app-list">
        {appList.length === 0 ? (
          <div className="app-list-empty">
            No apps tracked yet — use apps while TimeBoard is running
          </div>
        ) : filtered.length === 0 ? (
          <div className="app-list-empty">No apps match "{search}"</div>
        ) : (
          filtered.map((app) => (
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
          ))
        )}
      </div>
    </div>
  );
}