import React, { useState, useMemo } from "react";
import ActivityHeader from "../components/Activity/ActivityHeader";
import ActivityFilters from "../components/Activity/ActivityFilters";
import ActivitySearch from "../components/Activity/ActivitySearch";
import ActivityTimeline from "../components/Activity/ActivityTimeline";
import "./Activity.css";

// ── Mock data ────────────────────────────────────────────────────────────────
// In production, fetch this from your backend/store and pass as props.
const RAW_SESSIONS = [
  // 09:00 – 10:00
  { id: 1,  appName: "VS Code",  windowTitle: "index.js — timeboard-app",          duration: "42 min", durationMinutes: 42, category: "Productive",  timestamp: "09:04" },
  { id: 2,  appName: "Chrome",   windowTitle: "Stack Overflow – async/await",       duration: "18 min", durationMinutes: 18, category: "Distracting", timestamp: "09:47" },
  // 10:00 – 11:00
  { id: 3,  appName: "Spotify",  windowTitle: "Lo-fi Beats – Focus Playlist",       duration: "27 min", durationMinutes: 27, category: "Neutral",     timestamp: "10:02" },
  { id: 4,  appName: "VS Code",  windowTitle: "Analytics.css — timeboard-app",      duration: "1h 12m", durationMinutes: 72, category: "Productive",  timestamp: "10:31" },
  // 11:00 – 12:00
  { id: 5,  appName: "Notion",   windowTitle: "Sprint Planning – Q3",               duration: "35 min", durationMinutes: 35, category: "Productive",  timestamp: "11:00" },
  { id: 6,  appName: "Twitter",  windowTitle: "Twitter / Home",                     duration: "22 min", durationMinutes: 22, category: "Distracting", timestamp: "11:38" },
  { id: 7,  appName: null,       windowTitle: null,                                 duration: "15 min", durationMinutes: 15, category: "Idle",        timestamp: "11:59" },
  // 12:00 – 13:00
  { id: 8,  appName: "Slack",    windowTitle: "#engineering – team standup",        duration: "18 min", durationMinutes: 18, category: "Productive",  timestamp: "12:05" },
  { id: 9,  appName: "YouTube",  windowTitle: "How React Compiler works – Theo",   duration: "31 min", durationMinutes: 31, category: "Distracting", timestamp: "12:25" },
  { id: 10, appName: null,       windowTitle: null,                                 duration: "10 min", durationMinutes: 10, category: "Idle",        timestamp: "12:57" },
  // 14:00 – 15:00
  { id: 11, appName: "Figma",    windowTitle: "Timeboard — Settings Mockup v3",     duration: "55 min", durationMinutes: 55, category: "Productive",  timestamp: "14:00" },
  { id: 12, appName: "Chrome",   windowTitle: "Reddit – r/webdev",                  duration: "14 min", durationMinutes: 14, category: "Distracting", timestamp: "14:58" },
  // 15:00 – 16:00
  { id: 13, appName: "VS Code",  windowTitle: "Activity.jsx — timeboard-app",       duration: "48 min", durationMinutes: 48, category: "Productive",  timestamp: "15:03" },
  { id: 14, appName: "Finder",   windowTitle: "Downloads",                           duration: "5 min",  durationMinutes: 5,  category: "Neutral",     timestamp: "15:52" },
];

// Group sessions into hour blocks
function groupByHour(sessions) {
  const map = {};
  sessions.forEach((s) => {
    const hour = s.timestamp ? parseInt(s.timestamp.split(":")[0], 10) : 0;
    const nextHour = hour + 1;
    const label = `${String(hour).padStart(2, "0")}:00 – ${String(nextHour).padStart(2, "0")}:00`;
    if (!map[label]) map[label] = { timeLabel: label, items: [], totalMinutes: 0, sortKey: hour };
    map[label].items.push(s);
    map[label].totalMinutes += s.durationMinutes || 0;
  });
  return Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
}

function computeTotals(sessions) {
  const nonIdle = sessions.filter((s) => s.category !== "Idle");
  const totalMin = nonIdle.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return {
    totalSessions: nonIdle.length,
    totalActiveTime: `${h}h ${m}m`,
  };
}

export default function Activity() {
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [date,   setDate]     = useState("Today");

  const filtered = useMemo(() => {
    return RAW_SESSIONS.filter((s) => {
      const matchFilter =
        filter === "All" ||
        s.category === filter ||
        (filter === "Idle" && s.category === "Idle");
      const matchSearch =
        !search ||
        s.appName?.toLowerCase().includes(search.toLowerCase()) ||
        s.windowTitle?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [filter, search]);

  const groups = useMemo(() => groupByHour(filtered), [filtered]);
  const { totalSessions, totalActiveTime } = useMemo(() => computeTotals(RAW_SESSIONS), []);

  return (
    <div className="activity-page">
      <ActivityHeader
        totalSessions={totalSessions}
        totalActiveTime={totalActiveTime}
        onDateChange={setDate}
      />

      <div className="activity-toolbar">
        <ActivityFilters active={filter} onFilterChange={setFilter} />
        <ActivitySearch value={search} onChange={setSearch} />
      </div>

      <ActivityTimeline groups={groups} />
    </div>
  );
}
