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
    productiveTime: { label: "Total Productive Time", value: "0h 0m", trend: "neutral", delta: "0%" },
    distractingTime: { label: "Total Distracting Time", value: "0h 0m", trend: "neutral", delta: "0%" },
    idleTime: { label: "Total Idle Time", value: "0h 0m", trend: "neutral", delta: "0%" },
    focusScore: { label: "Focus Score %", value: "0%", trend: "neutral", scoreRaw: 0 },
  });

  const [timeDistribution, setTimeDistribution] = useState([]);
  const [appBreakdown, setAppBreakdown] = useState([]);
  const [topDistractions, setTopDistractions] = useState([]);
  const [dailyTrends, setDailyTrends] = useState({ labels: [], focusScore: [], productiveTime: [] });
  const [focusSessions, setFocusSessions] = useState({ longestStreak: 0, sessionCount: 0, thresholdMinutes: 25 });

  useEffect(() => {
    console.log("Analytics component mounted");
    console.log("window.api available:", !!window.api);
    
    if (!window.api) {
      console.warn("window.api not available - running outside Electron?");
      return;
    }

    async function loadAnalyticsData() {
      try {
        console.log("Starting analytics data load...");
        
        const data = await window.api.getTodayProductivityStats();
        console.log("Analytics data received:", data);
        
        // Convert seconds to hours/minutes format
        const formatSeconds = (seconds) => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          return { hours, minutes };
        };
        
        const productiveTime = formatSeconds(data.productive || 0);
        const distractingTime = formatSeconds(data.distracting || 0);
        const idleTime = formatSeconds(data.idle || 0);
        
        setStats({
          productiveTime: {
            label: "Total Productive Time",
            value: `${productiveTime.hours}h ${productiveTime.minutes}m`,
            trend: "neutral",
            delta: "+12%"
          },
          distractingTime: {
            label: "Total Distracting Time",
            value: `${distractingTime.hours}h ${distractingTime.minutes}m`,
            trend: "down",
            delta: "-8%"
          },
          idleTime: {
            label: "Total Idle Time",
            value: `${idleTime.hours}h ${idleTime.minutes}m`,
            trend: "neutral",
            delta: "0%"
          },
          focusScore: {
            label: "Focus Score %",
            value: `${Math.round(data.score || 0)}%`,
            trend: "up",
            scoreRaw: Math.round(data.score || 0)
          },
        });
        
        console.log(" Analytics state updated with real data");
      } catch (error) {
        console.error(" Failed to load analytics data:", error);
      }
    }
    
    loadAnalyticsData();
  }, [filter]);

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-title-block">
          <h1 className="analytics-title">Analytics</h1>
          <span className="analytics-subtitle">Timeboard &bull; {filter}</span>
        </div>
      </div>

      {/* Date Filter */}
      <DateFilter selected={filter} onFilterChange={setFilter} />

      {/* Summary Cards */}
      <SummaryCards stats={stats} />

      {/* Row 2: Distribution + Breakdown */}
      <div className="analytics-row two-col">
        <TimeDistribution data={timeDistribution.length > 0 ? timeDistribution : undefined} />
        <AppBreakdownTable apps={appBreakdown.length > 0 ? appBreakdown : undefined} />
      </div>

      {/* Row 3: Distractions + Trend + Sessions */}
      <div className="analytics-row three-col">
        <TopDistractions apps={topDistractions.length > 0 ? topDistractions : undefined} />
        <FocusTrendChart data={dailyTrends.labels.length > 0 ? dailyTrends : undefined} />
        <FocusSessions
          longestStreak={focusSessions.longestStreak}
          sessionCount={focusSessions.sessionCount}
          sessionThreshold={focusSessions.thresholdMinutes}
        />
      </div>
    </div>
  );
}
