import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import DateFilter from "../components/Analytics/DateFilter";
import SummaryCards from "../components/Analytics/SummaryCards";
import TimeDistribution from "../components/Analytics/TimeDistribution";
import AppBreakdownTable from "../components/Analytics/AppBreakdownTable";
import TopDistractions from "../components/Analytics/TopDistractions";
import FocusTrendChart from "../components/Analytics/FocusTrendChart";
import FocusSessions from "../components/Analytics/FocusSessions";
import { useUser } from "../context/UserContext";
import "./Analytics.css";

function localDateStr(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function resolveFilter(f) {
  const now = new Date();

  if (f === "Today")
    return { dateFilter: localDateStr(now), mode: "single", days: 1 };

  if (f === "Yesterday") {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return { dateFilter: localDateStr(y), mode: "single", days: 1 };
  }

  if (f === "Last 7 days") {
    const s = new Date(now);
    s.setDate(s.getDate() - 6);
    return { dateFilter: localDateStr(s), mode: "range", days: 7 };
  }

  if (f === "Last 30 days" || f === "Month") {
    const s = new Date(now);
    s.setDate(s.getDate() - 29);
    return { dateFilter: localDateStr(s), mode: "range", days: 30 };
  }

  if (typeof f === "object" && f?.from)
    return { dateFilter: f.from, mode: "range", days: 30 };

  // Fallback
  const s = new Date(now);
  s.setDate(s.getDate() - 6);
  return { dateFilter: localDateStr(s), mode: "range", days: 7 };
}

const fmt = (s) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

const EMPTY_STATS = {
  productiveTime:  { label: "Total Productive Time",  value: "0h 0m", trend: "neutral", delta: "" },
  distractingTime: { label: "Total Distracting Time", value: "0h 0m", trend: "neutral", delta: "" },
  idleTime:        { label: "Total Idle Time",        value: "0h 0m", trend: "neutral", delta: "" },
  focusScore:      { label: "Focus Score %",          value: "0%",    trend: "neutral", scoreRaw: 0 },
};

export default function Analytics() {
  const { accentColor } = useTheme();
  const { refreshTrigger } = useUser();
  const [filter, setFilter] = useState("Today");

  const [stats,            setStats]            = useState(EMPTY_STATS);
  const [timeDistribution, setTimeDistribution] = useState([
    { label: "Productive",  value: 0, color: accentColor },
    { label: "Distracting", value: 0, color: "#4B4B5A"   },
    { label: "Idle",        value: 0, color: "#D1D1DC"   },
  ]);
  const [appBreakdown,     setAppBreakdown]    = useState([]);
  const [topDistractions,  setTopDistractions] = useState([]);
  const [dailyTrends,      setDailyTrends]     = useState({ labels: [], focusScore: [], productiveTime: [] });
  const [focusSessions,    setFocusSessions]   = useState({ longestStreak: 0, sessionCount: 0, thresholdMinutes: 25 });
  const [loading,          setLoading]         = useState(true);

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
        console.log(`[Analytics] filter="${filter}" dateFilter="${dateFilter}" mode="${mode}" days=${days}`);

        // FIX: pass each argument correctly — no mixed object/primitive
        const [productivity, distribution, breakdown, distractions, trends, sessions] =
          await Promise.all([
            window.api.getTodayProductivityStats({ dateFilter, mode }),
            window.api.getTimeDistribution({ dateFilter, mode }),
            window.api.getAppBreakdown({ dateFilter, mode }),
            window.api.getTopDistractions({ dateFilter, mode }),
            window.api.getDailyTrends(days),           // plain number
            window.api.getFocusSessions({ dateFilter, mode }),
          ]);

        console.log("[Analytics] productivity:", productivity);
        console.log("[Analytics] distribution:", distribution);
        console.log("[Analytics] trends:", trends);
        console.log("[Analytics] sessions:", sessions);

        if (productivity) {
          setStats({
            productiveTime:  { label: "Total Productive Time",  value: fmt(productivity.productive  || 0), trend: "neutral", delta: "" },
            distractingTime: { label: "Total Distracting Time", value: fmt(productivity.distracting || 0), trend: "neutral", delta: "" },
            idleTime:        { label: "Total Idle Time",        value: fmt(productivity.idle        || 0), trend: "neutral", delta: "" },
            focusScore: {
              label: "Focus Score %",
              value: `${Math.round(productivity.score || 0)}%`,
              trend: "neutral",
              scoreRaw: Math.round(productivity.score || 0),
            },
          });
        }

        if (distribution?.length > 0) {
          setTimeDistribution(
            distribution.map(d =>
              d.label === "Productive" ? { ...d, color: accentColor } : d
            )
          );
        }

        if (breakdown?.length > 0)     setAppBreakdown(breakdown);
        if (distractions?.length > 0)  setTopDistractions(distractions);
        if (trends?.labels?.length > 0) setDailyTrends(trends);
        if (sessions)                  setFocusSessions(sessions);

      } catch (err) {
        console.error("[Analytics] load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
    const refreshId = setInterval(loadAll, 60000);
    return () => clearInterval(refreshId);
  }, [filter, accentColor, refreshTrigger]);

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
            <div className="analytics-row three-col">
              <TopDistractions apps={topDistractions} />
              {/* <FocusTrendChart data={dailyTrends} /> */}
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