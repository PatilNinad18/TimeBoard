import db from "../db/database.js";

/**
 * Get report summary stats:
 * - Best Focus Day (day with highest productive seconds)
 * - Average Focus Hours (avg productive seconds per day)
 * - Total Focus Time (sum of all productive seconds)
 * - Consistency (% of tracked days where productive > distracting)
 */
export function getReportSummary(period = "weekly") {
  let days;
  switch (period) {
    case "daily":
      days = 1;
      break;
    case "monthly":
      days = 30;
      break;
    case "weekly":
    default:
      days = 7;
      break;
  }

  const rows = db.prepare(`
    SELECT 
      date(timestamp) as day,
      COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
      COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle
    FROM app_usage
    WHERE date(timestamp) >= date('now', '-' || ? || ' days')
    GROUP BY date(timestamp)
    ORDER BY day ASC
  `).all(days);

  if (rows.length === 0) {
    return {
      bestFocusDay: { day: "—", value: "0h 0m" },
      avgFocusHours: "0h 0m",
      totalFocusTime: "0h 0m",
      consistency: 0,
      trackedDays: 0,
    };
  }

  // Best focus day
  let bestDay = rows[0];
  for (const row of rows) {
    if (row.productive > bestDay.productive) {
      bestDay = row;
    }
  }

  const bestDayHours = Math.floor(bestDay.productive / 3600);
  const bestDayMins = Math.floor((bestDay.productive % 3600) / 60);

  // Format day name
  const bestDayDate = new Date(bestDay.day + "T00:00:00");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const bestDayLabel = `${dayNames[bestDayDate.getDay()]} (${bestDay.day})`;

  // Average focus hours per day
  const totalProductive = rows.reduce((sum, r) => sum + r.productive, 0);
  const avgPerDay = totalProductive / rows.length;
  const avgHours = Math.floor(avgPerDay / 3600);
  const avgMins = Math.floor((avgPerDay % 3600) / 60);

  // Total focus time
  const totalHours = Math.floor(totalProductive / 3600);
  const totalMins = Math.floor((totalProductive % 3600) / 60);

  // Consistency: % of days where productive > distracting
  const productiveDays = rows.filter(r => r.productive > r.distracting).length;
  const consistency = rows.length > 0 ? Math.round((productiveDays / rows.length) * 100) : 0;

  return {
    bestFocusDay: { day: bestDayLabel, value: `${bestDayHours}h ${bestDayMins}m` },
    avgFocusHours: `${avgHours}h ${avgMins}m`,
    totalFocusTime: `${totalHours}h ${totalMins}m`,
    consistency,
    trackedDays: rows.length,
  };
}

/**
 * Get daily report rows for the reports table.
 * Each row = one day with: date, total time, productive time, distracting time, idle time, focus score, top app.
 */
export function getReportTable(period = "weekly") {
  let days;
  switch (period) {
    case "daily":
      days = 1;
      break;
    case "monthly":
      days = 30;
      break;
    case "weekly":
    default:
      days = 7;
      break;
  }

  const rows = db.prepare(`
    SELECT 
      date(timestamp) as day,
      COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
      COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle,
      COALESCE(SUM(duration), 0) as total
    FROM app_usage
    WHERE date(timestamp) >= date('now', '-' || ? || ' days')
    GROUP BY date(timestamp)
    ORDER BY day DESC
  `).all(days);

  // Get top app per day
  const topAppsQuery = db.prepare(`
    SELECT date(timestamp) as day, app_name, SUM(duration) as app_time
    FROM app_usage
    WHERE date(timestamp) >= date('now', '-' || ? || ' days') AND is_idle = 0
    GROUP BY date(timestamp), app_name
    ORDER BY day, app_time DESC
  `).all(days);

  // Build a map of day -> top app
  const topAppMap = {};
  for (const row of topAppsQuery) {
    if (!topAppMap[row.day]) {
      topAppMap[row.day] = row.app_name;
    }
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return rows.map((row, index) => {
    const date = new Date(row.day + "T00:00:00");
    const activeTotal = row.productive + row.distracting;
    const focusScore = activeTotal === 0 ? 0 : Math.round((row.productive / activeTotal) * 100);

    return {
      id: index + 1,
      date: row.day,
      dayName: dayNames[date.getDay()],
      totalTime: formatTime(row.total),
      productiveTime: formatTime(row.productive),
      distractingTime: formatTime(row.distracting),
      idleTime: formatTime(row.idle),
      focusScore,
      topApp: topAppMap[row.day] || "—",
    };
  });
}

/**
 * Export data as CSV string.
 */
export function getReportCSV(period = "weekly") {
  const table = getReportTable(period);
  const headers = ["Date", "Day", "Total Time", "Productive", "Distracting", "Idle", "Focus Score", "Top App"];
  const csvRows = [headers.join(",")];

  for (const row of table) {
    csvRows.push([
      row.date,
      row.dayName,
      row.totalTime,
      row.productiveTime,
      row.distractingTime,
      row.idleTime,
      `${row.focusScore}%`,
      `"${row.topApp}"`,
    ].join(","));
  }

  return csvRows.join("\n");
}
