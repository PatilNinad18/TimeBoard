import React, { useState, useEffect, useMemo, useCallback } from "react";
import ActivityHeader from "../components/Activity/ActivityHeader";
import ActivityFilters from "../components/Activity/ActivityFilters";
import ActivitySearch from "../components/Activity/ActivitySearch";
import ActivityTimeline from "../components/Activity/ActivityTimeline";
import "./Activity.css";

// Group sessions into hourly blocks using real data
function groupByHour(sessions) {
  const map = {};
  
  sessions.forEach((s) => {
    // Use the actual hour from the session data
    const hour = s.hour || 0;
    const label = s.hourLabel || `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;
    
    if (!map[label]) {
      map[label] = { 
        timeLabel: label, 
        items: [], 
        totalMinutes: 0, 
        sortKey: hour,
        hour: hour
      };
    }
    map[label].items.push(s);
    map[label].totalMinutes += s.durationMinutes || 0;
  });
  
  // Sort groups by hour (6 AM, 7 AM, 8 AM, etc.)
  const sortedGroups = Object.values(map).sort((a, b) => a.sortKey - b.sortKey);
  
  // Sort items within each group by exact time
  sortedGroups.forEach(group => {
    group.items.sort((a, b) => {
      const timeA = new Date(a.realTimestamp);
      const timeB = new Date(b.realTimestamp);
      return timeA - timeB;
    });
  });
  
  return sortedGroups;
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

  useEffect(() => {
    console.log("🔍 Activity component mounted");
    console.log("🔍 window.api available:", !!window.api);
    
    if (!window.api) {
      console.warn("⚠️ window.api not available - running outside Electron?");
      setLoading(false);
      return;
    }

    async function loadActivityData() {
      try {
        console.log("🔄 Starting activity data load...");
        
        const targetDate = date === "Today" 
          ? new Date().toISOString().split('T')[0]
          : date;
        
        const sessions = await window.api.getActivitySessions(targetDate);
        console.log("⏰ Activity data received:", sessions);
        
        // Filter out empty/invalid sessions and ensure proper data
        const validSessions = sessions.filter(session => 
          session && 
          session.appName && 
          session.durationMinutes > 0
        );
        
        console.log("📋 Valid sessions after filtering:", validSessions);
        setSessions(validSessions);
        console.log("✅ Activity state updated with real data");
      } catch (error) {
        console.error("❌ Error loading activity data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadActivityData();
  }, [date]);

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
  }, [sessions, filter, search]);

  const groups = useMemo(() => groupByHour(filtered), [filtered]);
  const { totalSessions, totalActiveTime } = useMemo(() => computeTotals(sessions), [sessions]);

  return (
    <div className="activity-page h-screen flex flex-col">
      <div className="flex-shrink-0">
        <ActivityHeader
          totalSessions={totalSessions}
          totalActiveTime={totalActiveTime}
          onDateChange={setDate}
        />
      </div>
      
      <div className="flex-shrink-0 flex gap-4 p-4">
        <ActivityFilters filter={filter} setFilter={setFilter} />
        <ActivitySearch search={search} setSearch={setSearch} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading activity data...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No activity tracked yet today</p>
            <p className="text-gray-500 mt-2">Start using apps and TimeBoard will record your sessions</p>
          </div>
        ) : (
          <ActivityTimeline groups={groups} />
        )}
      </div>
    </div>
  );
}
