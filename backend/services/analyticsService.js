import db from "../db/database.js";
import logger from "../logger.js";

function buildCond(dateFilter, mode) {
  if (!dateFilter) {
    return { cond: `date(timestamp) = date('now','localtime')`, param: null };
  }
  if (mode === "single") {
    return { cond: `date(timestamp) = ?`, param: dateFilter };
  }
  return {
    cond: `date(timestamp) >= ? AND date(timestamp) <= date('now','localtime')`,
    param: dateFilter,
  };
}

function getProductiveApps() {
  try {
    return db.prepare(`SELECT app_name FROM user_productive_apps`).all().map(r => r.app_name);
  } catch {
    return [];
  }
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
    ? db.prepare(sql.replace("__COND__", cond)).all(param)
    : db.prepare(sql.replace("__COND__", cond)).all();
}

// ── App Breakdown ─────────────────────────────────────────────────────────
export function getAppBreakdown(dateFilter = null, mode = "single") {
  try {
    const { cond, param } = buildCond(dateFilter, mode);
    const productiveApps  = getProductiveApps();

    const rows = fetchRows(cond, param, `
      SELECT app_name, COALESCE(SUM(duration),0) as total_time
      FROM app_usage
      WHERE __COND__ AND is_idle=0
      GROUP BY app_name
      ORDER BY total_time DESC
    `);

    return rows.map((row, i) => {
      const category = productiveApps.includes(row.app_name) ? "Productive" : "Distracting";
      const h = Math.floor(row.total_time / 3600);
      const m = Math.floor((row.total_time % 3600) / 60);
      return {
        id: i + 1,
        name: row.app_name,
        icon: row.app_name.charAt(0).toUpperCase(),
        iconBg: getCategoryColor(category),
        time: h > 0 ? `${h}h ${m}m` : `${m}m`,
        totalSeconds: row.total_time,
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
    const productiveApps  = getProductiveApps();

    const rows = fetchRows(cond, param, `
      SELECT app_name, COALESCE(SUM(duration),0) as total_time
      FROM app_usage
      WHERE __COND__ AND is_idle=0
      GROUP BY app_name
      ORDER BY total_time DESC
    `);

    const distracting = rows
      .filter(r => !productiveApps.includes(r.app_name))
      .slice(0, 6);

    if (distracting.length === 0) return [];
    const maxMinutes = Math.max(...distracting.map(r => r.total_time / 60));

    return distracting.map((row, i) => {
      const minutes = Math.round(row.total_time / 60);
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return {
        id: i + 1,
        name: row.app_name,
        icon: row.app_name.charAt(0).toUpperCase(),
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
    const productiveApps  = getProductiveApps();

    const rows = fetchRows(cond, param, `
      SELECT app_name, is_idle, COALESCE(SUM(duration),0) as total
      FROM app_usage
      WHERE __COND__
      GROUP BY app_name, is_idle
    `);

    let productive = 0, distracting = 0, idle = 0;

    for (const row of rows) {
      if (row.is_idle) {
        idle += row.total;
      } else if (productiveApps.length === 0) {
        distracting += row.total;
      } else if (productiveApps.includes(row.app_name)) {
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
    const productiveApps = getProductiveApps();

    const rows = db.prepare(`
      SELECT
        date(timestamp) as day,
        app_name,
        is_idle,
        COALESCE(SUM(duration),0) as total_duration
      FROM app_usage
      WHERE date(timestamp) >= date('now','localtime',?)
      GROUP BY date(timestamp), app_name, is_idle
      ORDER BY day ASC
    `).all(`-${days} days`);

    const dayMap = {};
    for (const row of rows) {
      if (!dayMap[row.day]) dayMap[row.day] = { productive: 0, distracting: 0 };
      if (row.is_idle) continue;
      if (productiveApps.length === 0) {
        dayMap[row.day].distracting += row.total_duration;
      } else if (productiveApps.includes(row.app_name)) {
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
    const productiveApps  = getProductiveApps();

    const rows = fetchRows(cond, param, `
      SELECT duration, app_name, is_idle
      FROM app_usage
      WHERE __COND__
      ORDER BY timestamp ASC
    `);

    let longestStreak = 0, currentStreak = 0, sessionCount = 0;

    for (const row of rows) {
      const isProductive = !row.is_idle && (
        productiveApps.length === 0 || productiveApps.includes(row.app_name)
      );

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