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

function computeTotals(sessions) {
  const nonIdle = sessions.filter((s) => s.category !== "Idle");
  const totalMin = nonIdle.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  return {
    totalSessions: nonIdle.length,
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
        setSessions((data || []).filter((s) => s?.appName && s.durationMinutes > 0));
      } catch (err) {
        console.error("Activity load error:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [date]);

  const filtered = useMemo(() => sessions.filter((s) => {
    const matchFilter =
      filter === "All" || s.category === filter ||
      (filter === "Idle" && s.category === "Idle");
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
        <ActivityFilters filter={filter} setFilter={setFilter} />
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
          <ActivityTimeline groups={groups} />
        )}
      </div>
    </div>
  );
}