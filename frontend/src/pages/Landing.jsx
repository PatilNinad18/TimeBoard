import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import "./Landing.css";

const STEPS = ["welcome", "name", "apps", "done"];

const COMMON_DISTRACTING = [
  "YouTube", "Instagram", "Facebook", "Twitter", "Netflix",
  "Spotify", "WhatsApp", "Telegram", "Reddit", "TikTok",
  "Discord", "Messenger", "Snapchat", "Google Chrome", "Edge",
];

export default function Landing() {
  const { saveUser } = useUser();
  const { accentColor } = useTheme();

  const [step, setStep]               = useState(0); // index into STEPS
  const [name, setName]               = useState("");
  const [nameError, setNameError]     = useState("");
  const [trackedApps, setTrackedApps] = useState([]);
  const [selected, setSelected]       = useState([]);
  const [customApp, setCustomApp]     = useState("");
  const [saving, setSaving]           = useState(false);

  // Load real tracked apps from backend
  useEffect(() => {
    if (!window.api) return;
    window.api.getUsage().then((usage) => {
      if (usage?.length > 0) {
        setTrackedApps(usage.map((u) => u.app));
      }
    }).catch(() => {});
  }, []);

  const appPool = [
    ...new Set([...COMMON_DISTRACTING, ...trackedApps]),
  ];

  const toggleApp = (app) => {
    setSelected((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    );
  };

  const addCustom = () => {
    const trimmed = customApp.trim();
    if (!trimmed) return;
    if (!selected.includes(trimmed)) setSelected((p) => [...p, trimmed]);
    setCustomApp("");
  };

  const handleNameNext = () => {
    if (!name.trim()) {
      setNameError("Please enter your name to continue");
      return;
    }
    setNameError("");
    setStep(2); // go to apps step
  };

  const handleFinish = async () => {
    setSaving(true);
    await saveUser(name.trim(), selected);
    setSaving(false);
    setStep(3); // done
  };

  const current = STEPS[step];

  return (
    <div className="landing-page">
      {/* Background blobs */}
      <div className="landing-blob blob-1" style={{ background: accentColor }} />
      <div className="landing-blob blob-2" style={{ background: accentColor }} />

      {/* Progress dots */}
      <div className="landing-progress">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`progress-dot ${step >= i + 1 ? "done" : ""} ${step === i + 1 ? "active" : ""}`}
            style={step === i + 1 ? { background: accentColor } : {}}
          />
        ))}
      </div>

      {/* ── STEP 0: Welcome ── */}
      {current === "welcome" && (
        <div className="landing-card animate-in">
          <div className="landing-icon">⏱</div>
          <h1 className="landing-heading">Welcome to TimeBoard</h1>
          <p className="landing-sub">
            Your personal productivity tracker. Understand how you spend your
            time, reduce distractions, and build better habits — automatically.
          </p>
          <ul className="landing-features">
            <li><span className="feat-icon">📊</span> Real-time app usage tracking</li>
            <li><span className="feat-icon">🎯</span> Focus score & productivity insights</li>
            <li><span className="feat-icon">📋</span> Daily activity timeline</li>
            <li><span className="feat-icon">📤</span> Exportable reports</li>
          </ul>
          <button
            className="landing-btn"
            style={{ background: accentColor }}
            onClick={() => setStep(1)}
          >
            Get Started →
          </button>
        </div>
      )}

      {/* ── STEP 1: Name ── */}
      {current === "name" && (
        <div className="landing-card animate-in">
          <div className="landing-icon">👋</div>
          <h1 className="landing-heading">What should we call you?</h1>
          <p className="landing-sub">
            We'll use this to personalise your dashboard.
          </p>
          <div className="landing-input-wrap">
            <input
              className={`landing-input ${nameError ? "error" : ""}`}
              type="text"
              placeholder="Your name…"
              value={name}
              autoFocus
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
            />
            {nameError && <p className="input-error">{nameError}</p>}
          </div>
          <div className="landing-actions">
            <button className="landing-btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button
              className="landing-btn"
              style={{ background: accentColor }}
              onClick={handleNameNext}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Distracting Apps ── */}
      {current === "apps" && (
        <div className="landing-card landing-card-wide animate-in">
          <div className="landing-icon">🚫</div>
          <h1 className="landing-heading">Which apps distract you?</h1>
          <p className="landing-sub">
            Select apps you consider distracting. TimeBoard will track your
            time on these and calculate your focus score accordingly.
            <br />
            <span className="sub-note">You can always change this in Settings.</span>
          </p>

          {/* App grid */}
          <div className="apps-grid">
            {appPool.map((app) => (
              <button
                key={app}
                className={`app-chip ${selected.includes(app) ? "selected" : ""}`}
                style={selected.includes(app) ? {
                  borderColor: accentColor,
                  background: hexToRgba(accentColor, 0.12),
                  color: accentColor,
                } : {}}
                onClick={() => toggleApp(app)}
              >
                <span className="chip-initial"
                  style={selected.includes(app) ? { background: accentColor } : {}}
                >
                  {app[0].toUpperCase()}
                </span>
                <span className="chip-name">{app}</span>
                {selected.includes(app) && <span className="chip-check">✓</span>}
              </button>
            ))}
          </div>

          {/* Custom app input */}
          <div className="custom-app-row">
            <input
              className="landing-input small"
              type="text"
              placeholder="Add another app…"
              value={customApp}
              onChange={(e) => setCustomApp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
            />
            <button
              className="landing-btn small"
              style={{ background: accentColor }}
              onClick={addCustom}
            >
              + Add
            </button>
          </div>

          {selected.length > 0 && (
            <p className="selection-count">
              {selected.length} app{selected.length !== 1 ? "s" : ""} marked as distracting
            </p>
          )}

          <div className="landing-actions">
            <button className="landing-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button
              className="landing-btn"
              style={{ background: accentColor }}
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? "Saving…" : "Start Tracking →"}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Done ── */}
      {current === "done" && (
        <div className="landing-card animate-in">
          <div className="landing-icon done-icon">🎉</div>
          <h1 className="landing-heading">You're all set, {name}!</h1>
          <p className="landing-sub">
            TimeBoard is now tracking your activity in the background.
            Head to your dashboard to see real-time insights.
          </p>
          <div className="done-summary">
            <div className="done-stat">
              <span className="done-stat-value" style={{ color: accentColor }}>
                {selected.length}
              </span>
              <span className="done-stat-label">Distracting apps</span>
            </div>
            <div className="done-divider" />
            <div className="done-stat">
              <span className="done-stat-value" style={{ color: accentColor }}>
                Live
              </span>
              <span className="done-stat-label">Tracking status</span>
            </div>
          </div>
          <button
            className="landing-btn"
            style={{ background: accentColor }}
            onClick={() => window.location.reload()}
          >
            Open Dashboard →
          </button>
        </div>
      )}
    </div>
  );
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}