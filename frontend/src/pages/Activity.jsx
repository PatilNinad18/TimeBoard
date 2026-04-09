import React, { useState, useEffect, useMemo, useCallback } from "react";
import ActivityHeader from "../components/Activity/ActivityHeader";
import ActivityFilters from "../components/Activity/ActivityFilters";
import ActivitySearch from "../components/Activity/ActivitySearch";
import ActivityTimeline from "../components/Activity/ActivityTimeline";
import "./Activity.css";

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
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("Today");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    if (!window.api) {
      console.warn("[Activity] window.api not available - running outside Electron?");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Determine the date string to pass
      let dateStr = null; // null means today on backend
      if (date === "Yesterday") {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        dateStr = d.toISOString().split("T")[0];
      }
      // "Today" = null (backend defaults to today)

      const data = await window.api.getActivitySessions(dateStr);
      if (data) {
        setSessions(data);
      }
    } catch (error) {
      console.error("[Activity] Failed to load sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadSessions();
    // Refresh every 10 seconds
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
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
  }, [filter, search, sessions]);

  const groups = useMemo(() => groupByHour(filtered), [filtered]);
  const { totalSessions, totalActiveTime } = useMemo(() => computeTotals(sessions), [sessions]);

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

      {loading ? (
        <div style={{ textAlign: "center", color: "#888", padding: "3rem 0" }}>
          Loading activity data...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: "center", color: "#888", padding: "3rem 0" }}>
          <p style={{ fontSize: "1.1rem" }}>No activity tracked yet today</p>
          <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Start using apps and TimeBoard will record your sessions
          </p>
        </div>
      ) : (
        <ActivityTimeline groups={groups} />
      )}
    </div>
  );
}
