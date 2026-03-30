import { useState } from "react";
import React from "react";

const DEFAULT_RULES = [
  { id: "youtube", label: "YouTube", allowed: true },
  { id: "instagram", label: "Instagram", allowed: true },
];

const PlatformIcon = ({ id }) => {
  const map = {
    youtube: { bg: "#FF0000", text: "YT" },
    instagram: { bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", text: "IG" },
  };
  const s = map[id] || { bg: "#888", text: id[0].toUpperCase() };
  return (
    <div
      className="platform-icon"
      style={{ background: s.bg }}
    >
      {s.text}
    </div>
  );
};

const Toggle = ({ checked, onChange }) => (
  <button
    className={`toggle-switch ${checked ? "on" : "off"}`}
    onClick={() => onChange(!checked)}
    aria-checked={checked}
    role="switch"
  >
    <span className="toggle-thumb" />
  </button>
);

export default function BlockingRules({ rules = DEFAULT_RULES, onRulesChange, showPopup = false, onShowPopupChange }) {
  const [ruleList, setRuleList] = useState(rules);
  const [popup, setPopup] = useState(showPopup);

  const toggleRule = (id) => {
    const updated = ruleList.map((r) => r.id === id ? { ...r, allowed: !r.allowed } : r);
    setRuleList(updated);
    onRulesChange?.(updated);
  };

  const handlePopup = (v) => {
    setPopup(v);
    onShowPopupChange?.(v);
  };

  return (
    <div className="settings-card blocking-rules">
      <h3 className="card-title">Blocking</h3>
      <p className="card-subtitle">Actively restrict access<br />(Different from Distracting)</p>

      <div className="block-list">
        {ruleList.map((rule) => (
          <div key={rule.id} className="block-row">
            <PlatformIcon id={rule.id} />
            <span className="block-label">{rule.label}</span>
            <Toggle checked={rule.allowed} onChange={() => toggleRule(rule.id)} />
            <span className="block-status">{rule.allowed ? "Allowed" : "Blocked"}</span>
          </div>
        ))}
      </div>

      <label className="popup-checkbox">
        <input
          type="checkbox"
          checked={popup}
          onChange={(e) => handlePopup(e.target.checked)}
        />
        <span>Show popup when blocked app is opened (optional)</span>
      </label>
    </div>
  );
}
