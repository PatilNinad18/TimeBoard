// src/components/Settings/DistractingAppsSettings.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { XCircle, Plus } from "lucide-react";

export default function DistractingAppsSettings({ onSave }) {
  const { distractingApps, updateDistractingApps } = useUser();
  const [list, setList]       = useState(distractingApps || []);
  const [input, setInput]     = useState("");
  const [saved, setSaved]     = useState(false);

  useEffect(() => { setList(distractingApps || []); }, [distractingApps]);

  const add = () => {
    const t = input.trim();
    if (!t || list.includes(t)) return;
    setList((p) => [...p, t]);
    setInput("");
    setSaved(false);
  };

  const remove = (app) => {
    setList((p) => p.filter((a) => a !== app));
    setSaved(false);
  };

  const save = async () => {
    await updateDistractingApps(list);
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-card">
      <h3 className="card-title">Distracting Apps</h3>
      <p className="card-subtitle">
        Apps marked here reduce your focus score and productive time.
      </p>

      {/* Current list */}
      <div className="dist-app-tags">
        {list.length === 0 && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
            No distracting apps set yet
          </p>
        )}
        {list.map((app) => (
          <div key={app} className="dist-tag">
            <span>{app}</span>
            <button className="dist-tag-remove" onClick={() => remove(app)}>
              <XCircle size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="custom-app-row" style={{ marginTop: 10 }}>
        <input
          className="search-box"
          style={{ flex: 1, padding: "8px 12px", borderRadius: 9,
            border: "1px solid var(--border)", background: "var(--surface-2)",
            color: "var(--text-primary)", fontSize: "0.82rem",
            fontFamily: "inherit", outline: "none" }}
          placeholder="Add an app name…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="ctrl-btn primary" style={{ padding: "8px 14px" }} onClick={add}>
          <Plus size={13} /> Add
        </button>
      </div>

      <button
        className="ctrl-btn primary"
        style={{ marginTop: 10, width: "100%" }}
        onClick={save}
      >
        {saved ? "✓ Saved" : "Save Changes"}
      </button>
    </div>
  );
}