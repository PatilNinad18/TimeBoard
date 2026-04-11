import React, { useState, useEffect, useMemo } from "react";
import ActivityHeader from "../components/Activity/ActivityHeader";
import ActivityFilters from "../components/Activity/ActivityFilters";
import ActivitySearch from "../components/Activity/ActivitySearch";
import ActivityTimeline from "../components/Activity/ActivityTimeline";
import "./Activity.css";

function groupByHour(sessions) {
  const map = {};

  sessions.forEach((s) => {
    const hour = s.hour || 0;
    const label =
      s.hourLabel ||
      `${String(hour).padStart(2, "0")}:00 - ${String((hour + 1) % 24).padStart(2, "0")}:00`;

    if (!map[label]) {
      map[label] = { timeLabel: label, items: [], totalMinutes: 0, sortKey: hour, hour };
    }
    map[label].items.push(s);
    map[label].totalMinutes += s.durationMinutes || 0;
  });

  const sortedGroups = Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
  sortedGroups.forEach((group) => {
    group.items.sort((a, b) => new Date(a.realTimestamp) - new Date(b.realTimestamp));
  });

  return sortedGroups;
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
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [date, setDate]       = useState("Today");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.api) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const now = new Date();
        const localToday =
          now.getFullYear() + "-" +
          String(now.getMonth() + 1).padStart(2, "0") + "-" +
          String(now.getDate()).padStart(2, "0");

        const targetDate = date === "Today" ? localToday : date;
        const data = await window.api.getActivitySessions(targetDate);

        setSessions(
          (data || []).filter((s) => s?.appName && s.durationMinutes > 0)
        );
      } catch (err) {
        console.error("❌ Activity load error:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [date]);

  const filtered = useMemo(() => sessions.filter((s) => {
    const matchFilter =
      filter === "All" ||
      s.category === filter ||
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

      {/* ── Header ── */}
      <div className="activity-header-wrap">
        <ActivityHeader
          totalSessions={totalSessions}
          totalActiveTime={totalActiveTime}
          onDateChange={setDate}
        />
      </div>

      {/* ── Filters + Search ── */}
      <div className="activity-toolbar">
        <ActivityFilters filter={filter} setFilter={setFilter} />
        <ActivitySearch search={search} setSearch={setSearch} />
      </div>

      {/* ── Scrollable timeline ── */}
      <div className="activity-scroll-area">
        {loading ? (
          <div className="activity-state-box">
            <div className="activity-spinner" />
            <p className="state-title">Loading activity…</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="activity-state-box">
            <span className="state-icon">⏱</span>
            <p className="state-title">No activity tracked yet</p>
            <p className="state-sub">Use apps while TimeBoard is running and they'll appear here.</p>
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