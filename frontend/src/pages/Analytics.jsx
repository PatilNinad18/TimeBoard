import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import DateFilter from "../components/Analytics/DateFilter";
import SummaryCards from "../components/Analytics/SummaryCards";
import TimeDistribution from "../components/Analytics/TimeDistribution";
import AppBreakdownTable from "../components/Analytics/AppBreakdownTable";
import TopDistractions from "../components/Analytics/TopDistractions";
import FocusTrendChart from "../components/Analytics/FocusTrendChart";
import FocusSessions from "../components/Analytics/FocusSessions";
import WorkQuality from "../components/Analytics/WorkQuality";
import { processSessions, fmtMinutes } from "../utils/sessionProcessor";
import "./Analytics.css";

function localDateStr(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth()+1).padStart(2,"0") + "-" +
    String(d.getDate()).padStart(2,"0");
}

function resolveFilter(f) {
  const now = new Date();
  if (f === "Today")
    return { dateFilter: localDateStr(now), mode: "single", days: 1 };
  if (f === "Yesterday") {
    const y = new Date(now); y.setDate(y.getDate()-1);
    return { dateFilter: localDateStr(y), mode: "single", days: 1 };
  }
  if (f === "Last 7 days") {
    const s = new Date(now); s.setDate(s.getDate()-6);
    return { dateFilter: localDateStr(s), mode: "range", days: 7 };
  }
  if (f === "Last 30 days" || f === "Month") {
    const s = new Date(now); s.setDate(s.getDate()-29);
    return { dateFilter: localDateStr(s), mode: "range", days: 30 };
  }
  if (typeof f === "object" && f?.from)
    return { dateFilter: f.from, mode: "range", days: 30 };
  const s = new Date(now); s.setDate(s.getDate()-6);
  return { dateFilter: localDateStr(s), mode: "range", days: 7 };
}

const EMPTY_STATS = {
  productiveTime:  { label: "Total Productive Time",  value: "0h 0m", trend: "neutral", delta: "" },
  distractingTime: { label: "Total Distracting Time", value: "0h 0m", trend: "neutral", delta: "" },
  idleTime:        { label: "Total Idle Time",         value: "0h 0m", trend: "neutral", delta: "" },
  focusScore:      { label: "Focus Score %",           value: "0%",    trend: "neutral", scoreRaw: 0 },
};

export default function Analytics() {
  const { accentColor }     = useTheme();
  const { distractingApps } = useUser();
  const [filter, setFilter]  = useState("Today");

  const [stats,            setStats]            = useState(EMPTY_STATS);
  const [timeDistribution, setTimeDistribution] = useState([
    { label: "Productive",  value: 0, color: accentColor },
    { label: "Distracting", value: 0, color: "#4B4B5A"   },
    { label: "Idle",        value: 0, color: "#D1D1DC"   },
  ]);
  const [appBreakdown,    setAppBreakdown]    = useState([]);
  const [topDistractions, setTopDistractions] = useState([]);
  const [dailyTrends,     setDailyTrends]     = useState({ labels: [], focusScore: [], productiveTime: [] });
  const [focusSessions,   setFocusSessions]   = useState({ longestStreak: 0, sessionCount: 0, thresholdMinutes: 25 });
  const [workQuality,     setWorkQuality]     = useState({ deepWorkPct: 0, shallowWorkPct: 0, totalMinutes: 0, deepWorkTime: 0, shallowWorkTime: 0 });
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    if (!window.api) { setLoading(false); return; }

    async function loadAll() {
      setLoading(true);
      setStats(EMPTY_STATS);
      setAppBreakdown([]);
      setTopDistractions([]);
      setDailyTrends({ labels: [], focusScore: [], productiveTime: [] });

      try {
        const { dateFilter, mode, days } = resolveFilter(filter);

        const [rawBreakdown, distribution, distractions, trends, sessions] =
          await Promise.all([
            window.api.getAppBreakdown(    { dateFilter, mode }),
            window.api.getTimeDistribution({ dateFilter, mode }),
            window.api.getTopDistractions( { dateFilter, mode }),
            window.api.getDailyTrends(days),
            window.api.getFocusSessions(   { dateFilter, mode }),
          ]);

        // Build session objects — totalSeconds from backend, convert to MINUTES
        const sessionList = (rawBreakdown || []).map((app, i) => ({
          app:       app.name,
          startTime: i * 1000,
          endTime:   i * 1000 + app.totalSeconds * 1000,
          duration:  app.totalSeconds / 60,   // ← MINUTES
        }));

        // Single source of truth
        const processed = processSessions(sessionList, distractingApps || []);

        // Summary cards — processed times are already in minutes
        const idleDistrib = distribution?.find(d => d.label === "Idle");
        const idlePct     = idleDistrib?.value || 0;
        const idleMinutes = processed.totalTime > 0
          ? (processed.totalTime * idlePct) / 100
          : 0;

        setStats({
          productiveTime:  { label: "Total Productive Time",  value: fmtMinutes(processed.productiveTime),  trend: "neutral", delta: "" },
          distractingTime: { label: "Total Distracting Time", value: fmtMinutes(processed.distractingTime), trend: "neutral", delta: "" },
          idleTime:        { label: "Total Idle Time",         value: fmtMinutes(idleMinutes),               trend: "neutral", delta: "" },
          focusScore: {
            label:    "Focus Score %",
            value:    `${processed.focusScore}%`,
            trend:    "neutral",
            scoreRaw: processed.focusScore,
          },
        });

        // Time distribution
        if (distribution?.length > 0) {
          setTimeDistribution(
            distribution.map(d =>
              d.label === "Productive" ? { ...d, color: accentColor } : d
            )
          );
        }

        // App breakdown — re-classify with current distractingApps
        if (rawBreakdown?.length > 0) {
          setAppBreakdown(
            rawBreakdown.map(app => ({
              ...app,
              category: (distractingApps || []).includes(app.name) ? "Distracting" : "Productive",
              iconBg:   (distractingApps || []).includes(app.name) ? "#EF4444" : "#22C55E",
            }))
          );
        }

        if (distractions?.length > 0) setTopDistractions(distractions);
        if (trends?.labels?.length > 0) setDailyTrends(trends);
        if (sessions) setFocusSessions(sessions);

        // Work quality
        const totalActive = processed.deepWorkTime + processed.shallowWorkTime;
        setWorkQuality({
          deepWorkPct:     totalActive > 0 ? Math.round((processed.deepWorkTime    / totalActive) * 100) : 0,
          shallowWorkPct:  totalActive > 0 ? Math.round((processed.shallowWorkTime / totalActive) * 100) : 0,
          totalMinutes:    Math.round(processed.totalTime),
          deepWorkTime:    Math.round(processed.deepWorkTime),
          shallowWorkTime: Math.round(processed.shallowWorkTime),
        });

      } catch (err) {
        console.error("[Analytics] load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [filter, accentColor, distractingApps]);

  return (
    <div className="analytics-page" style={{ "--accent-color": accentColor }}>
      <div className="analytics-top">
        <div className="analytics-header">
          <div className="header-title-block">
            <h1 className="analytics-title">Analytics</h1>
            <span className="analytics-subtitle">
              Timeboard &bull; {typeof filter === "string" ? filter : "Custom range"}
            </span>
          </div>
        </div>
        <DateFilter selected={filter} onFilterChange={setFilter} />
      </div>

      <div className="analytics-body">
        {loading ? (
          <div className="analytics-loading">
            <div className="analytics-spinner" />
            <p>Loading analytics…</p>
          </div>
        ) : (
          <>
            <SummaryCards stats={stats} />

            <div className="analytics-row two-col">
              <TimeDistribution data={timeDistribution} />
              <AppBreakdownTable apps={appBreakdown} />
            </div>

            <WorkQuality data={workQuality} accentColor={accentColor} />

            <div className="analytics-row three-col">
              <TopDistractions apps={topDistractions} />
              <FocusTrendChart data={dailyTrends} />
              <FocusSessions
                longestStreak={focusSessions.longestStreak}
                sessionCount={focusSessions.sessionCount}
                sessionThreshold={focusSessions.thresholdMinutes}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}