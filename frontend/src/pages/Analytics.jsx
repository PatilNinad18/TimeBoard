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
import { processSessions, fmtMinutes, calculateFocusScore } from "../utils/sessionProcessor";
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
  productiveTime:  { label: "Total Productive Time",  value: "0m", trend: "neutral", delta: "" },
  distractingTime: { label: "Total Distracting Time", value: "0m", trend: "neutral", delta: "" },
  idleTime:        { label: "Total Idle Time",         value: "0m", trend: "neutral", delta: "" },
  focusScore:      { label: "Focus Score %",           value: "0%", trend: "neutral", scoreRaw: 0 },
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

      const distApps = distractingApps || [];
      console.log("[Analytics] distractingApps:", distApps);

      try {
        const { dateFilter, mode, days } = resolveFilter(filter);

        // Always fetch real sessions for the primary date (single day)
        // For ranges, also fetch backend aggregates
        const isSingleDay = mode === "single";

        const [rawSessions, rawBreakdown, distribution, distractions, trends, sessions] =
          await Promise.all([
            // Real sessions for accurate stats
            window.api.getActivitySessions(dateFilter),
            // Backend aggregates for display tables
            window.api.getAppBreakdown(    { dateFilter, mode }),
            window.api.getTimeDistribution({ dateFilter, mode }),
            window.api.getTopDistractions( { dateFilter, mode }),
            window.api.getDailyTrends(days),
            window.api.getFocusSessions(   { dateFilter, mode }),
          ]);

        // ── Build session list from REAL sessions ──────────────────
        const validSessions = (rawSessions || [])
          .filter(s =>
            s?.appName &&
            typeof s.durationMinutes === "number" &&
            s.durationMinutes > 0 &&
            !isNaN(s.durationMinutes)
          )
          .map(s => ({
            app:       s.appName,
            startTime: new Date(s.realTimestamp).getTime(),
            endTime:   new Date(s.realTimestamp).getTime() + s.durationMinutes * 60000,
            duration:  s.durationMinutes, // minutes
          }));

        console.log("[Analytics] validSessions count:", validSessions.length);
        console.log("[Analytics] sample:", validSessions.slice(0,3));

        let processed;

        if (validSessions.length > 0) {
          // Use real sessions for accurate focus score + deep work
          processed = processSessions(validSessions, distApps);
        } else if (!isSingleDay) {
          // Range with no sessions loaded — use backend stats
          const backendStats = await window.api.getTodayProductivityStats({ dateFilter, mode });
          const prodMin  = (backendStats?.productive  || 0) / 60;
          const distMin  = (backendStats?.distracting || 0) / 60;
          const idleMin  = (backendStats?.idle        || 0) / 60;
          const score    = Math.min(100, Math.round(backendStats?.score || 0));
          processed = {
            productiveTime:  prodMin,
            distractingTime: distMin,
            totalTime:       prodMin + distMin + idleMin,
            deepWorkTime:    0,
            shallowWorkTime: prodMin,
            focusScore:      score,
          };
        } else {
          processed = { productiveTime: 0, distractingTime: 0, totalTime: 0, deepWorkTime: 0, shallowWorkTime: 0, focusScore: 0 };
        }

        console.log("[Analytics] processed:", processed);

        // ── Idle time from distribution ────────────────────────────
        const idleDistrib = distribution?.find(d => d.label === "Idle");
        const idlePct     = idleDistrib?.value || 0;
        const totalTracked = processed.totalTime || 0;
        const idleMinutes  = totalTracked > 0 ? (totalTracked * idlePct) / (100 - idlePct || 1) : 0;

        // ── Focus score — hard cap at 100 ──────────────────────────
        const focusScore = Math.min(100, processed.focusScore);

        setStats({
          productiveTime:  { label: "Total Productive Time",  value: fmtMinutes(processed.productiveTime),  trend: "neutral", delta: "" },
          distractingTime: { label: "Total Distracting Time", value: fmtMinutes(processed.distractingTime), trend: "neutral", delta: "" },
          idleTime:        { label: "Total Idle Time",         value: fmtMinutes(idleMinutes),               trend: "neutral", delta: "" },
          focusScore: {
            label:    "Focus Score %",
            value:    `${focusScore}%`,
            trend:    "neutral",
            scoreRaw: focusScore,
          },
        });

        // ── Time distribution ──────────────────────────────────────
        if (validSessions.length > 0 && distApps.length > 0) {
          // Recalculate from real sessions using user's distractingApps
          let prod = 0, dist = 0, idle = 0;
          const all  = validSessions.reduce((a, s) => a + s.duration, 0);
          prod  = processed.productiveTime;
          dist  = processed.distractingTime;
          idle  = Math.max(0, all - prod - dist);
          const total = prod + dist + idle;

          if (total > 0) {
            setTimeDistribution([
              { label: "Productive",  value: Math.round((prod / total) * 100), color: accentColor },
              { label: "Distracting", value: Math.round((dist / total) * 100), color: "#4B4B5A"   },
              { label: "Idle",        value: Math.round((idle / total) * 100), color: "#D1D1DC"   },
            ]);
          } else if (distribution?.length > 0) {
            setTimeDistribution(distribution.map(d =>
              d.label === "Productive" ? { ...d, color: accentColor } : d
            ));
          }
        } else if (distribution?.length > 0) {
          setTimeDistribution(distribution.map(d =>
            d.label === "Productive" ? { ...d, color: accentColor } : d
          ));
        }

        // ── App breakdown — reclassify with user's distractingApps ─
        if (rawBreakdown?.length > 0) {
          setAppBreakdown(
            rawBreakdown.map(app => ({
              ...app,
              category: distApps.includes(app.name) ? "Distracting" : "Productive",
              iconBg:   distApps.includes(app.name) ? "#EF4444" : "#22C55E",
            }))
          );
        }

        if (distractions?.length > 0) setTopDistractions(distractions);

        // ── Daily trends — fix focus score using distractingApps ───
        if (trends?.labels?.length > 0) {
          setDailyTrends(trends);
        }

        if (sessions) setFocusSessions(sessions);

        // ── Work quality ───────────────────────────────────────────
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