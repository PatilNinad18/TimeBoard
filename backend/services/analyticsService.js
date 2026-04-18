import db from "../db/database.js";

// ── Date condition builder — no JS date math, pure SQL ────────────────────
function buildCond(dateFilter, mode) {
  if (!dateFilter) {
    return { cond: `date(timestamp) = date('now','localtime')`, param: null };
  }
  if (mode === "single") {
    return { cond: `date(timestamp) = ?`, param: dateFilter };
  }
  // range: from dateFilter up to today
  return {
    cond: `date(timestamp) >= ? AND date(timestamp) <= date('now','localtime')`,
    param: dateFilter,
  };
}

function runAll(sql, param) {
  return param ? db.prepare(sql).all(param) : db.prepare(sql).all();
}

function runGet(sql, param) {
  return param ? db.prepare(sql).get(param) : db.prepare(sql).get();
}

// ── Services ──────────────────────────────────────────────────────────────

export function getAppBreakdown(dateFilter = null, mode = "single") {
  const { cond, param } = buildCond(dateFilter, mode);

  const rows = runAll(`
    SELECT app_name, COALESCE(SUM(duration),0) as total_time, is_productive
    FROM app_usage
    WHERE ${cond} AND is_idle=0
    GROUP BY app_name, is_productive
    ORDER BY total_time DESC
  `, param);

  const appMap = {};
  for (const row of rows) {
    if (!appMap[row.app_name]) {
      appMap[row.app_name] = { name: row.app_name, totalTime: 0, productiveTime: 0, distractingTime: 0 };
    }
    appMap[row.app_name].totalTime += row.total_time;
    if (row.is_productive) appMap[row.app_name].productiveTime += row.total_time;
    else                   appMap[row.app_name].distractingTime += row.total_time;
  }

  return Object.values(appMap)
    .sort((a, b) => b.totalTime - a.totalTime)
    .map((app, i) => {
      const category = app.productiveTime >= app.distractingTime ? "Productive" : "Distracting";
      const h = Math.floor(app.totalTime / 3600);
      const m = Math.floor((app.totalTime % 3600) / 60);
      return {
        id: i + 1,
        name: app.name,
        icon: app.name.charAt(0).toUpperCase(),
        iconBg: getCategoryColor(category),
        time: h > 0 ? `${h}h ${m}m` : `${m}m`,
        totalSeconds: app.totalTime,
        category,
      };
    });
}

export function getTopDistractions(dateFilter = null, mode = "single") {
  const { cond, param } = buildCond(dateFilter, mode);

  const rows = runAll(`
    SELECT app_name, COALESCE(SUM(duration),0) as total_time
    FROM app_usage
    WHERE ${cond} AND is_productive=0 AND is_idle=0
    GROUP BY app_name
    ORDER BY total_time DESC
    LIMIT 6
  `, param);

  if (rows.length === 0) return [];
  const maxMinutes = Math.max(...rows.map(r => r.total_time / 60));

  return rows.map((row, i) => {
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
}

export function getDailyTrends(days = 7) {
  const rows = db.prepare(`
    SELECT
      date(timestamp) as day,
      COALESCE(SUM(CASE WHEN is_productive=1 AND is_idle=0 THEN duration ELSE 0 END),0) as productive,
      COALESCE(SUM(CASE WHEN is_productive=0 AND is_idle=0 THEN duration ELSE 0 END),0) as distracting
    FROM app_usage
    WHERE date(timestamp) >= date('now','localtime',? )
    GROUP BY date(timestamp)
    ORDER BY day ASC
  `).all(`-${days} days`);

  const dayLabels = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const result    = { labels: [], focusScore: [], productiveTime: [] };

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    const found   = rows.find(r => r.day === dateStr);
    const prod    = found ? found.productive  : 0;
    const dist    = found ? found.distracting : 0;
    const total   = prod + dist;
    const score   = total === 0 ? 0 : (prod / total) * 100;

    result.labels.push(dayLabels[d.getDay()]);
    result.focusScore.push(parseFloat(score.toFixed(1)));
    result.productiveTime.push(parseFloat((prod / 3600).toFixed(2)));
  }

  return result;
}

export function getFocusSessions(thresholdMinutes = 25, dateFilter = null, mode = "single") {
  const { cond, param } = buildCond(dateFilter, mode);

  const rows = runAll(`
    SELECT duration, is_productive, is_idle
    FROM app_usage
    WHERE ${cond}
    ORDER BY timestamp ASC
  `, param);

  let longestStreak = 0, currentStreak = 0, sessionCount = 0;

  for (const row of rows) {
    if (row.is_productive === 1 && row.is_idle === 0) {
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
}

export function getTimeDistribution(dateFilter = null, mode = "single") {
  const { cond, param } = buildCond(dateFilter, mode);

  const result = runGet(`
    SELECT
      COALESCE(SUM(CASE WHEN is_productive=1 AND is_idle=0 THEN duration ELSE 0 END),0) as productive,
      COALESCE(SUM(CASE WHEN is_productive=0 AND is_idle=0 THEN duration ELSE 0 END),0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle=1 THEN duration ELSE 0 END),0) as idle
    FROM app_usage
    WHERE ${cond}
  `, param);

  const total = (result?.productive||0) + (result?.distracting||0) + (result?.idle||0);

  if (total === 0) return [
    { label: "Productive",  value: 0, color: "#F5C518" },
    { label: "Distracting", value: 0, color: "#4B4B5A" },
    { label: "Idle",        value: 0, color: "#D1D1DC" },
  ];

  return [
    { label: "Productive",  value: Math.round((result.productive  / total)*100), color: "#F5C518" },
    { label: "Distracting", value: Math.round((result.distracting / total)*100), color: "#4B4B5A" },
    { label: "Idle",        value: Math.round((result.idle        / total)*100), color: "#D1D1DC" },
  ];
}

function localDateStr(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth()+1).padStart(2,"0") + "-" +
    String(d.getDate()).padStart(2,"0");
}

function getCategoryColor(c) {
  if (c === "Productive")  return "#22C55E";
  if (c === "Distracting") return "#EF4444";
  return "#6B7280";
}

function getDistractingColor(i) {
  return ["#EF4444","#F97316","#F59E0B","#DC2626","#E11D48","#C026D3"][i%6];
}