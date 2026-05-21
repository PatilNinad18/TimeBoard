import React, { useState, useEffect, useMemo } from "react";
import ActivityHeader from "../components/Activity/ActivityHeader";
import ActivityFilters from "../components/Activity/ActivityFilters";
import ActivitySearch from "../components/Activity/ActivitySearch";
import ActivityTimeline from "../components/Activity/ActivityTimeline";
import { useUser } from "../context/UserContext";
import "./Activity.css";

function resolveDate(label) {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const str = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  if (label === "Today")     return str(now);
  if (label === "Yesterday") {
    const y = new Date(now); y.setDate(y.getDate()-1); return str(y);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;
  return str(now);
}

function groupByHour(sessions) {
  const map = {};

  for (const s of sessions) {
    const hour  = s.hour ?? 0;
    const label = s.hourLabel ??
      `${String(hour).padStart(2,"0")}:00 - ${String((hour+1)%24).padStart(2,"0")}:00`;

    if (!map[label]) {
      map[label] = {
        timeLabel:    label,
        items:        [],
        totalMinutes: 0,   // sum of ACTUAL durationMinutes in this hour only
        sortKey:      hour,
        hour,
      };
    }
    map[label].items.push(s);
    // Only add the portion of this session that falls within this hour
    // Since backend already splits sessions by hour, durationMinutes is correct
    map[label].totalMinutes += s.durationMinutes || 0;
  }

  const sorted = Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
  sorted.forEach(g =>
    g.items.sort((a, b) => new Date(a.realTimestamp) - new Date(b.realTimestamp))
  );
  return sorted;
}

function computeTotals(sessions) {
  const nonIdle  = sessions.filter(s => s.category !== "Idle");
  const totalMin = nonIdle.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  if (isNaN(totalMin)) return { totalSessions: nonIdle.length, totalActiveTime: "0h 0m" };
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  return {
    totalSessions:   nonIdle.length,
    totalActiveTime: `${h}h ${m}m`,
  };
}

function fmtDuration(minutes) {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "0 min";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
}

export default function Activity() {
  const { distractingApps } = useUser();
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
        const raw   = await window.api.getActivitySessions(targetDate);
        const valid = (raw || []).filter(s =>
          s?.appName &&
          typeof s.durationMinutes === "number" &&
          s.durationMinutes > 0
        );

        // DO NOT merge sessions here — merging across hours breaks
        // the timeline. Keep each raw session in its correct hour bucket.
        // Re-classify category from user's distractingApps list.
        const display = valid.map(s => ({
          ...s,
          category: s.category === "Idle"
            ? "Idle"
            : (distractingApps || []).includes(s.appName)
            ? "Distracting"
            : "Productive",
          // Ensure duration string matches durationMinutes (not accumulated total)
          duration: fmtDuration(s.durationMinutes),
        }));

        setSessions(display);
      } catch (err) {
        console.error("[Activity] load error:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [date, distractingApps]);

  const filtered = useMemo(() => sessions.filter(s => {
    const matchFilter = filter === "All" || s.category === filter;
    const matchSearch =
      !search ||
      s.appName?.toLowerCase().includes(search.toLowerCase()) ||
      s.windowTitle?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [sessions, filter, search]);

  const groups = useMemo(() => groupByHour(filtered), [filtered]);
  const { totalSessions, totalActiveTime } = useMemo(
    () => computeTotals(sessions),
    [sessions]
  );

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