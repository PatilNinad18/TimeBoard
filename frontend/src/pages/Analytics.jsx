import React, { useState, useEffect } from "react";
import DateFilter from "../components/Analytics/DateFilter";
import SummaryCards from "../components/Analytics/SummaryCards";
import TimeDistribution from "../components/Analytics/TimeDistribution";
import AppBreakdownTable from "../components/Analytics/AppBreakdownTable";
import TopDistractions from "../components/Analytics/TopDistractions";
import FocusTrendChart from "../components/Analytics/FocusTrendChart";
import FocusSessions from "../components/Analytics/FocusSessions";
import "./Analytics.css";

export default function Analytics() {
  const [filter, setFilter] = useState("Last 7 days");

  const [stats, setStats] = useState({
    productiveTime:  { label: "Total Productive Time",  value: "0h 0m", trend: "neutral", delta: "" },
    distractingTime: { label: "Total Distracting Time", value: "0h 0m", trend: "neutral", delta: "" },
    idleTime:        { label: "Total Idle Time",        value: "0h 0m", trend: "neutral", delta: "" },
    focusScore:      { label: "Focus Score %",          value: "0%",    trend: "neutral", scoreRaw: 0 },
  });

  const [timeDistribution, setTimeDistribution] = useState([
    { label: "Productive",  value: 0, color: "#F5C518" },
    { label: "Distracting", value: 0, color: "#4B4B5A" },
    { label: "Idle",        value: 0, color: "#D1D1DC" },
  ]);
  const [appBreakdown,    setAppBreakdown]    = useState([]);
  const [topDistractions, setTopDistractions] = useState([]);
  const [dailyTrends,     setDailyTrends]     = useState({ labels: [], focusScore: [], productiveTime: [] });
  const [focusSessions,   setFocusSessions]   = useState({ longestStreak: 0, sessionCount: 0, thresholdMinutes: 25 });
  const [loading,         setLoading]         = useState(true);

  const fmt = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const filterToDays = (f) => {
    if (f === "Today" || f === "Yesterday") return 1;
    if (f === "Last 7 days") return 7;
    if (f === "Last 30 days" || f === "Month") return 30;
    return 7;
  };

  useEffect(() => {
    if (!window.api) {
      console.warn("window.api not available");
      setLoading(false);
      return;
    }

    async function loadAll() {
      setLoading(true);
      try {
        const days = filterToDays(filter);

        // Fire all 6 IPC calls in parallel
        const [
          productivity,
          distribution,
          breakdown,
          distractions,
          trends,
          sessions,
        ] = await Promise.all([
          window.api.getTodayProductivityStats(),
          window.api.getTimeDistribution(),
          window.api.getAppBreakdown(),
          window.api.getTopDistractions(),
          window.api.getDailyTrends(days),
          window.api.getFocusSessions(),
        ]);

        // Summary cards
        setStats({
          productiveTime: {
            label: "Total Productive Time",
            value: fmt(productivity.productive || 0),
            trend: "neutral",
            delta: "",
          },
          distractingTime: {
            label: "Total Distracting Time",
            value: fmt(productivity.distracting || 0),
            trend: "neutral",
            delta: "",
          },
          idleTime: {
            label: "Total Idle Time",
            value: fmt(productivity.idle || 0),
            trend: "neutral",
            delta: "",
          },
          focusScore: {
            label: "Focus Score %",
            value: `${Math.round(productivity.score || 0)}%`,
            trend: "neutral",
            scoreRaw: Math.round(productivity.score || 0),
          },
        });

        // Time distribution donut
        if (distribution && distribution.length > 0) {
          setTimeDistribution(distribution);
        }

        // App breakdown table
        if (breakdown && breakdown.length > 0) {
          setAppBreakdown(breakdown);
        }

        // Top distractions
        if (distractions && distractions.length > 0) {
          setTopDistractions(distractions);
        }

        // Daily trends chart
        if (trends && trends.labels && trends.labels.length > 0) {
          setDailyTrends(trends);
        }

        // Focus sessions
        if (sessions) {
          setFocusSessions(sessions);
        }

      } catch (err) {
        console.error("Analytics load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [filter]);

  return (
    <div className="analytics-page">

      {/* Fixed top section — never scrolls */}
      <div className="analytics-top">
        <div className="analytics-header">
          <div className="header-title-block">
            <h1 className="analytics-title">Analytics</h1>
            <span className="analytics-subtitle">Timeboard &bull; {filter}</span>
          </div>
        </div>
        <DateFilter selected={filter} onFilterChange={setFilter} />
      </div>

      {/* Scrollable body */}
      <div className="analytics-body">
        {loading && (
          <div className="analytics-loading">
            <div className="analytics-spinner" />
            <p>Loading analytics…</p>
          </div>
        )}

        {!loading && (
          <>
            <SummaryCards stats={stats} />

            <div className="analytics-row two-col">
              <TimeDistribution data={timeDistribution} />
              <AppBreakdownTable apps={appBreakdown} />
            </div>

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