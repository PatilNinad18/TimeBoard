import React, { useState, useEffect, useMemo } from "react";
import ActivityHeader from "../components/Activity/ActivityHeader";
import ActivityFilters from "../components/Activity/ActivityFilters";
import ActivitySearch from "../components/Activity/ActivitySearch";
import ActivityTimeline from "../components/Activity/ActivityTimeline";
import "./Activity.css";

// Convert filter label → YYYY-MM-DD local date string
function resolveDate(label) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const localStr = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (label === "Today")     return localStr(now);
  if (label === "Yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return localStr(y);
  }
  // Already a YYYY-MM-DD string (custom date)
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;

  // Fallback — today
  return localStr(now);
}

function groupByHour(sessions) {
  const map = {};
  sessions.forEach((s) => {
    const hour  = s.hour || 0;
    const label = s.hourLabel ||
      `${String(hour).padStart(2, "0")}:00 - ${String((hour + 1) % 24).padStart(2, "0")}:00`;

    if (!map[label]) {
      map[label] = { timeLabel: label, items: [], totalMinutes: 0, sortKey: hour, hour };
    }
    map[label].items.push(s);
    map[label].totalMinutes += s.durationMinutes || 0;
  });

  const sorted = Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
  sorted.forEach((g) =>
    g.items.sort((a, b) => new Date(a.realTimestamp) - new Date(b.realTimestamp))
  );
  return sorted;
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

function mergeSessions(sessions) {
  const merged = [];
  for (const session of sessions) {
    const last = merged[merged.length - 1];

    // If an Idle row follows a real app session, attach it to the last app row.
    if (session.appName === "Idle" && last && last.appName !== "Idle") {
      last.durationSeconds += session.durationSeconds || 0;
      last.idleSeconds += session.durationSeconds || 0;
      last.durationMinutes = Math.max(1, Math.ceil(last.durationSeconds / 60));
      last.duration = formatDuration(last.durationSeconds);
      last.hasIdle = true;
      continue;
    }

    const sameApp = last && last.appName === session.appName;
    const mergeable = sameApp && (
      last.category === "Idle" ||
      session.category === "Idle" ||
      last.windowTitle === session.windowTitle
    );

    if (mergeable) {
      last.durationSeconds += session.durationSeconds || 0;
      last.idleSeconds += session.category === "Idle" ? (session.durationSeconds || 0) : 0;
      last.productiveSeconds += session.category === "Productive" ? (session.durationSeconds || 0) : 0;
      last.distractingSeconds += session.category === "Distracting" ? (session.durationSeconds || 0) : 0;
      last.hasIdle = last.hasIdle || session.category === "Idle";
      last.hasProductive = last.hasProductive || session.category === "Productive";
      last.hasDistracting = last.hasDistracting || session.category === "Distracting";
      last.durationMinutes = Math.max(1, Math.ceil(last.durationSeconds / 60));
      last.duration = formatDuration(last.durationSeconds);
      last.exactTime = last.exactTime || session.exactTime;
      last.fullTimestamp = last.fullTimestamp || session.fullTimestamp;
      last.windowTitle = last.windowTitle || session.windowTitle;
    } else {
      merged.push({
        ...session,
        idleSeconds: session.category === "Idle" ? (session.durationSeconds || 0) : 0,
        productiveSeconds: session.category === "Productive" ? (session.durationSeconds || 0) : 0,
        distractingSeconds: session.category === "Distracting" ? (session.durationSeconds || 0) : 0,
        hasIdle: session.category === "Idle",
        hasProductive: session.category === "Productive",
        hasDistracting: session.category === "Distracting",
      });
    }
  }
  return merged;
}

function computeTotals(sessions) {
  const activeSessions = sessions.filter((s) => s.hasProductive || s.hasDistracting);
  const totalSeconds = activeSessions.reduce((acc, s) => acc + ((s.productiveSeconds || 0) + (s.distractingSeconds || 0)), 0);
  const totalMin = Math.max(0, Math.ceil(totalSeconds / 60));
  return {
    totalSessions: activeSessions.length,
    totalActiveTime: `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`,
  };
}

export default function Activity() {
  const [filter,   setFilter]   = useState("All");
  const [search,   setSearch]   = useState("");
  const [date,     setDate]     = useState("Today");
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!window.api) { setLoading(false); return; }

    async function load() {
      setLoading(true);
      try {
        const targetDate = resolveDate(date);
        console.log(`[Activity] Loading for: ${date} → ${targetDate}`);
        const data = await window.api.getActivitySessions(targetDate);
        const filtered = (data || []).filter((s) => s?.appName && s.durationMinutes > 0);
        setSessions(mergeSessions(filtered));
      } catch (err) {
        console.error("Activity load error:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    const refreshId = setInterval(load, 15000);
    window.addEventListener("focus", load);
    return () => {
      clearInterval(refreshId);
      window.removeEventListener("focus", load);
    };
  }, [date]);

  const filtered = useMemo(() => sessions.filter((s) => {
    const matchFilter =
      filter === "All" ? s.appName !== "Idle" :
      filter === "Productive" ? s.hasProductive :
      filter === "Distracting" ? s.hasDistracting :
      filter === "Idle" ? s.hasIdle || s.appName === "Idle" :
      true;
    const matchSearch =
      !search ||
      s.appName?.toLowerCase().includes(search.toLowerCase()) ||
      s.windowTitle?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [sessions, filter, search]);

  const groups = useMemo(() => groupByHour(filtered), [filtered]);
  const { totalSessions, totalActiveTime } = useMemo(() => computeTotals(sessions), [sessions]);

  return (
    <div className="activity-page">
      <div className="activity-header-wrap">
        <ActivityHeader
          totalSessions={totalSessions}
          totalActiveTime={totalActiveTime}
          onDateChange={setDate}
        />
      </div>
      <div className="activity-toolbar">
        <ActivityFilters active={filter} onFilterChange={setFilter} />
        <ActivitySearch  search={search}  setSearch={setSearch} />
      </div>
      <div className="activity-scroll-area">
        {loading ? (
          <div className="activity-state-box">
            <div className="activity-spinner" />
            <p className="state-title">Loading activity…</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="activity-state-box">
            <span className="state-icon">⏱</span>
            <p className="state-title">No activity for {date}</p>
            <p className="state-sub">
              {date === "Today"
                ? "Use apps while TimeBoard is running and they'll appear here."
                : "No data was recorded for this date."}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="activity-state-box">
            <span className="state-icon">🔍</span>
            <p className="state-title">No results</p>
            <p className="state-sub">Try a different filter or search term.</p>
          </div>
        ) : (
          <ActivityTimeline groups={groups} showIdleDetails={filter === "Idle"} />
        )}
      </div>
    </div>
  );
}