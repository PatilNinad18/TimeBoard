import db from "../db/database.js";

function fmt(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function localDateStr(d) {
  return (
    d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function getReportSummary(period = "weekly") {
  const days = period === "daily" ? 1 : period === "monthly" ? 30 : 7;

  const rows = db.prepare(`
    SELECT
      date(timestamp) as day,
      COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
      COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle
    FROM app_usage
    WHERE date(timestamp) >= date('now', 'localtime', '-' || ? || ' days')
    GROUP BY date(timestamp)
    ORDER BY day ASC
  `).all(days);

  if (rows.length === 0) return {
    bestFocusDay: { day: "—", value: "0h 0m" },
    avgFocusHours: "0h 0m",
    totalFocusTime: "0h 0m",
    consistency: 0,
    trackedDays: 0,
  };

  let bestDay = rows.reduce((best, r) => r.productive > best.productive ? r : best, rows[0]);
  const bestDayDate = new Date(bestDay.day + "T00:00:00");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const totalProductive = rows.reduce((sum, r) => sum + r.productive, 0);
  const avgPerDay = totalProductive / rows.length;
  const productiveDays = rows.filter(r => r.productive > r.distracting).length;

  return {
    bestFocusDay: {
      day: `${dayNames[bestDayDate.getDay()]} (${bestDay.day})`,
      value: fmt(bestDay.productive)
    },
    avgFocusHours: fmt(Math.round(avgPerDay)),
    totalFocusTime: fmt(totalProductive),
    consistency: Math.round((productiveDays / rows.length) * 100),
    trackedDays: rows.length,
  };
}

export function getReportTable(period = "weekly") {
  const days = period === "daily" ? 1 : period === "monthly" ? 30 : 7;

  const rows = db.prepare(`
    SELECT
      date(timestamp) as day,
      COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
      COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle,
      COALESCE(SUM(duration), 0) as total
    FROM app_usage
    WHERE date(timestamp) >= date('now', 'localtime', '-' || ? || ' days')
    GROUP BY date(timestamp)
    ORDER BY day DESC
  `).all(days);

  const topApps = db.prepare(`
    SELECT date(timestamp) as day, app_name, SUM(duration) as t
    FROM app_usage
    WHERE date(timestamp) >= date('now', 'localtime', '-' || ? || ' days') AND is_idle = 0
    GROUP BY date(timestamp), app_name
    ORDER BY day, t DESC
  `).all(days);

  const topAppMap = {};
  for (const r of topApps) {
    if (!topAppMap[r.day]) topAppMap[r.day] = r.app_name;
  }

  const fullDayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  return rows.map((row, index) => {
    const d = new Date(row.day + "T00:00:00");
    const activeTotal = row.productive + row.distracting;
    return {
      id: index + 1,
      date: row.day,
      dayName: fullDayNames[d.getDay()],
      totalTime: fmt(row.total),
      productiveTime: fmt(row.productive),
      distractingTime: fmt(row.distracting),
      idleTime: fmt(row.idle),
      focusScore: activeTotal === 0 ? 0 : Math.round((row.productive / activeTotal) * 100),
      topApp: topAppMap[row.day] || "—",
    };
  });
}

export function getReportCSV(period = "weekly") {
  const table = getReportTable(period);
  const headers = ["Date","Day","Total Time","Productive","Distracting","Idle","Focus Score","Top App"];
  const rows = table.map(r => [
    r.date, r.dayName, r.totalTime, r.productiveTime,
    r.distractingTime, r.idleTime, `${r.focusScore}%`, `"${r.topApp}"`
  ].join(","));
  return [headers.join(","), ...rows].join("\n");
}