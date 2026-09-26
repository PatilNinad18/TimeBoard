import db from "../db/database.js";
import logger from "../logger.js";
import { classifyJoins, effectiveProductiveExpr } from "./classificationService.js";

// Bug 2/3 fix: ALL queries in this file now resolve classification at read
// time by LEFT JOINing user_productive_apps and blocked_apps rather than
// trusting the is_productive value baked into each row at recording time.
// A single CASE expression (effectiveProductiveExpr) is the one authoritative
// classification logic shared with statsService and reportsService.

function buildCond(dateFilter, mode) {
  if (!dateFilter) {
    return { cond: `date(a.timestamp) = date('now','localtime')`, param: null };
  }
  if (mode === "single") {
    return { cond: `date(a.timestamp) = ?`, param: dateFilter };
  }
  return {
    cond: `date(a.timestamp) >= ? AND date(a.timestamp) <= date('now','localtime')`,
    param: dateFilter,
  };
}

function localDateStr(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function getCategoryColor(c) {
  if (c === "Productive")  return "#22C55E";
  if (c === "Distracting") return "#EF4444";
  return "#6B7280";
}

function getDistractingColor(i) {
  return ["#EF4444","#F97316","#F59E0B","#DC2626","#E11D48","#C026D3"][i % 6];
}

// ── Shared row fetcher — single param string, never spread ────────────────
function fetchRows(cond, param, sql) {
  return param
    ? db.prepare(sql).all(param)
    : db.prepare(sql).all();
}

// ── App Breakdown ─────────────────────────────────────────────────────────
// Bug 3 fix: instead of using a majority vote on stale stored is_productive,
// we now compute effective_productive from the CURRENT classification tables.
// One app_name → one current category. No majority vote needed.
export function getAppBreakdown(dateFilter = null, mode = "single") {
  try {
    const { cond, param } = buildCond(dateFilter, mode);

    const sql = `
      SELECT
        a.app_name,
        COALESCE(SUM(a.duration), 0) as total_time,
        (${effectiveProductiveExpr()}) as effective_productive
      FROM app_usage a
      ${classifyJoins()}
      WHERE ${cond} AND a.app_name != 'Idle' AND a.is_idle = 0
      GROUP BY a.app_name, effective_productive
      ORDER BY total_time DESC
    `;

    const rows = fetchRows(cond, param, sql);

    // Collapse per-app rows (there should be exactly one per app now, but
    // handle the edge case where an app has rows straddling a schema migration)
    const appMap = new Map();
    for (const row of rows) {
      if (!appMap.has(row.app_name)) {
        appMap.set(row.app_name, { total_time: 0, effective_productive: row.effective_productive });
      }
      appMap.get(row.app_name).total_time += row.total_time;
    }

    return [...appMap.entries()]
      .sort((a, b) => b[1].total_time - a[1].total_time)
      .map(([appName, data], i) => {
        const category = data.effective_productive ? "Productive" : "Distracting";
        const h = Math.floor(data.total_time / 3600);
        const m = Math.floor((data.total_time % 3600) / 60);
        return {
          id: i + 1,
          name: appName,
          icon: appName.charAt(0).toUpperCase(),
          iconBg: getCategoryColor(category),
          time: h > 0 ? `${h}h ${m}m` : `${m}m`,
          totalSeconds: data.total_time,
          category,
        };
      });
  } catch (err) {
    logger.error("Analytics", `getAppBreakdown: ${err.message}`);
    return [];
  }
}

// ── Top Distractions ──────────────────────────────────────────────────────
export function getTopDistractions(dateFilter = null, mode = "single") {
  try {
    const { cond, param } = buildCond(dateFilter, mode);

    const sql = `
      SELECT
        a.app_name,
        COALESCE(SUM(a.duration), 0) as total_time,
        (${effectiveProductiveExpr()}) as effective_productive
      FROM app_usage a
      ${classifyJoins()}
      WHERE ${cond} AND a.app_name != 'Idle' AND a.is_idle = 0
      GROUP BY a.app_name, effective_productive
      ORDER BY total_time DESC
    `;

    const rawRows = fetchRows(cond, param, sql);

    // Collapse duplicates then filter to distracting only
    const appMap = new Map();
    for (const row of rawRows) {
      if (!appMap.has(row.app_name)) {
        appMap.set(row.app_name, { total_time: 0, effective_productive: row.effective_productive });
      }
      appMap.get(row.app_name).total_time += row.total_time;
    }

    const distracting = [...appMap.entries()]
      .filter(([, data]) => !data.effective_productive)
      .sort((a, b) => b[1].total_time - a[1].total_time)
      .slice(0, 6);

    if (distracting.length === 0) return [];
    const maxMinutes = Math.max(...distracting.map(([, d]) => d.total_time / 60));

    return distracting.map(([appName, data], i) => {
      const minutes = Math.round(data.total_time / 60);
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return {
        id: i + 1,
        name: appName,
        icon: appName.charAt(0).toUpperCase(),
        iconBg: getDistractingColor(i),
        time: h > 0 ? `${h}h ${m}m` : `${m}m`,
        minutes,
        maxMinutes: Math.round(maxMinutes),
      };
    });
  } catch (err) {
    logger.error("Analytics", `getTopDistractions: ${err.message}`);
    return [];
  }
}

// ── Time Distribution ─────────────────────────────────────────────────────
export function getTimeDistribution(dateFilter = null, mode = "single") {
  try {
    const { cond, param } = buildCond(dateFilter, mode);

    const sql = `
      SELECT
        a.is_idle,
        (${effectiveProductiveExpr()}) as effective_productive,
        COALESCE(SUM(a.duration), 0) as total
      FROM app_usage a
      ${classifyJoins()}
      WHERE ${cond}
      GROUP BY a.is_idle, effective_productive
    `;

    const rows = fetchRows(cond, param, sql);

    let productive = 0, distracting = 0, idle = 0;

    for (const row of rows) {
      if (row.is_idle) {
        idle += row.total;
      } else if (row.effective_productive) {
        productive += row.total;
      } else {
        distracting += row.total;
      }
    }

    const total = productive + distracting + idle;
    if (total === 0) return [
      { label: "Productive",  value: 0, color: "#F5C518" },
      { label: "Distracting", value: 0, color: "#4B4B5A" },
      { label: "Idle",        value: 0, color: "#D1D1DC" },
    ];

    return [
      { label: "Productive",  value: Math.round((productive  / total) * 100), color: "#F5C518" },
      { label: "Distracting", value: Math.round((distracting / total) * 100), color: "#4B4B5A" },
      { label: "Idle",        value: Math.round((idle        / total) * 100), color: "#D1D1DC" },
    ];
  } catch (err) {
    logger.error("Analytics", `getTimeDistribution: ${err.message}`);
    return [
      { label: "Productive",  value: 0, color: "#F5C518" },
      { label: "Distracting", value: 0, color: "#4B4B5A" },
      { label: "Idle",        value: 0, color: "#D1D1DC" },
    ];
  }
}

// ── Daily Trends ──────────────────────────────────────────────────────────
export function getDailyTrends(days = 7) {
  try {
    const sql = `
      SELECT
        date(a.timestamp) as day,
        a.is_idle,
        (${effectiveProductiveExpr()}) as effective_productive,
        COALESCE(SUM(a.duration), 0) as total_duration
      FROM app_usage a
      ${classifyJoins()}
      WHERE date(a.timestamp) >= date('now','localtime',?)
      GROUP BY date(a.timestamp), a.is_idle, effective_productive
      ORDER BY day ASC
    `;

    const rows = db.prepare(sql).all(`-${days} days`);

    const dayMap = {};
    for (const row of rows) {
      if (!dayMap[row.day]) dayMap[row.day] = { productive: 0, distracting: 0 };
      if (row.is_idle) continue;
      if (row.effective_productive) {
        dayMap[row.day].productive += row.total_duration;
      } else {
        dayMap[row.day].distracting += row.total_duration;
      }
    }

    const dayLabels = ["Su","Mo","Tu","We","Th","Fr","Sa"];
    const result    = { labels: [], focusScore: [], productiveTime: [] };

    for (let i = days - 1; i >= 0; i--) {
      const d       = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = localDateStr(d);
      const day     = dayMap[dateStr] || { productive: 0, distracting: 0 };
      const total   = day.productive + day.distracting;
      const score   = total === 0 ? 0 : (day.productive / total) * 100;

      result.labels.push(dayLabels[d.getDay()]);
      result.focusScore.push(parseFloat(score.toFixed(1)));
      result.productiveTime.push(parseFloat((day.productive / 3600).toFixed(2)));
    }

    return result;
  } catch (err) {
    logger.error("Analytics", `getDailyTrends: ${err.message}`);
    return { labels: [], focusScore: [], productiveTime: [] };
  }
}

// ── Focus Sessions ────────────────────────────────────────────────────────
export function getFocusSessions(thresholdMinutes = 25, dateFilter = null, mode = "single") {
  try {
    const { cond, param } = buildCond(dateFilter, mode);

    const sql = `
      SELECT
        a.duration,
        a.is_idle,
        (${effectiveProductiveExpr()}) as effective_productive
      FROM app_usage a
      ${classifyJoins()}
      WHERE ${cond}
      ORDER BY a.timestamp ASC
    `;

    const rows = fetchRows(cond, param, sql);

    let longestStreak = 0, currentStreak = 0, sessionCount = 0;

    for (const row of rows) {
      const isProductive = !row.is_idle && row.effective_productive;

      if (isProductive) {
        currentStreak += row.duration;
      } else {
        if (currentStreak > longestStreak) longestStreak = currentStreak;
        if (currentStreak / 60 >= thresholdMinutes) sessionCount++;
        currentStreak = 0;
      }
    }
    if (currentStreak > longestStreak) longestStreak = currentStreak;
    if (currentStreak / 60 >= thresholdMinutes) sessionCount++;

    return { longestStreak: Math.round(longestStreak / 60), sessionCount, thresholdMinutes };
  } catch (err) {
    logger.error("Analytics", `getFocusSessions: ${err.message}`);
    return { longestStreak: 0, sessionCount: 0, thresholdMinutes };
  }
}