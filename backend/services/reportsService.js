import db from "../db/database.js";
import logger from "../logger.js";
import { classifyJoins, effectiveProductiveExpr } from "./classificationService.js";

function fmt(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function localDateStr(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

// Bug 5 fix: resolve classification at read time by JOINing current settings
// tables. This ensures Reports show the same productive/distracting totals as
// Dashboard and Analytics after any Settings change.
function getDailyAggregates(days) {
  return db.prepare(`
    SELECT
      date(a.timestamp) as day,
      COALESCE(SUM(CASE
        WHEN a.is_idle = 0 AND (${effectiveProductiveExpr()}) = 1 THEN a.duration ELSE 0
      END), 0) as productive,
      COALESCE(SUM(CASE
        WHEN a.is_idle = 0 AND (${effectiveProductiveExpr()}) = 0 THEN a.duration ELSE 0
      END), 0) as distracting,
      COALESCE(SUM(CASE WHEN a.is_idle = 1 THEN a.duration ELSE 0 END), 0) as idle,
      COALESCE(SUM(a.duration), 0) as total
    FROM app_usage a
    ${classifyJoins()}
    WHERE date(a.timestamp) >= date('now','localtime',?)
    GROUP BY date(a.timestamp)
    ORDER BY day ASC
  `).all(`-${days} days`);
}


function getTopAppsByDay(dayList) {
  if (dayList.length === 0) return {};

  const topApps = db.prepare(`
    SELECT date(timestamp) as day, app_name, SUM(duration) as t
    FROM app_usage
    WHERE date(timestamp) IN (${dayList.map(() => "?").join(",")})
      AND is_idle = 0
    GROUP BY date(timestamp), app_name
    ORDER BY day, t DESC
  `).all(...dayList);

  const topAppMap = {};
  for (const r of topApps) {
    if (!topAppMap[r.day]) topAppMap[r.day] = r.app_name;
  }
  return topAppMap;
}

export function getReportSummary(period = "weekly") {
  try {
    const days = period === "daily" ? 1 : period === "monthly" ? 30 : 7;
    const rowsByDay = getDailyAggregates(days);

    if (rowsByDay.length === 0) {
      return {
        bestFocusDay: { day: "—", value: "0h 0m" },
        avgFocusHours: "0h 0m",
        totalFocusTime: "0h 0m",
        consistency: 0,
        trackedDays: 0,
      };
    }

    const bestDay        = rowsByDay.reduce((b, r) => r.productive > b.productive ? r : b, rowsByDay[0]);
    const bestDayDate    = new Date(bestDay.day + "T00:00:00");
    const dayNames       = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const totalProductive = rowsByDay.reduce((s, r) => s + r.productive, 0);
    const productiveDays  = rowsByDay.filter(r => r.productive > r.distracting).length;

    return {
      bestFocusDay: {
        day: `${dayNames[bestDayDate.getDay()]} (${bestDay.day})`,
        value: fmt(bestDay.productive),
      },
      avgFocusHours:  fmt(Math.round(totalProductive / rowsByDay.length)),
      totalFocusTime: fmt(totalProductive),
      consistency:    Math.round((productiveDays / rowsByDay.length) * 100),
      trackedDays:    rowsByDay.length,
    };
  } catch (err) {
    logger.error("ReportsService", "getReportSummary failed", err.message);
    return {
      bestFocusDay: { day: "—", value: "0h 0m" },
      avgFocusHours: "0h 0m",
      totalFocusTime: "0h 0m",
      consistency: 0,
      trackedDays: 0,
    };
  }
}

// ── Paginated report table ─────────────────────────────────────────────────
// Pagination happens AFTER daily aggregation now — page size limits how many
// DAYS you see per page, never how many apps get counted within a day.
export function getReportTable(period = "weekly", page = 1, pageSize = 10) {
  try {
    const days   = period === "daily" ? 1 : period === "monthly" ? 30 : 7;
    const offset = (page - 1) * pageSize;

    const allDays = getDailyAggregates(days).sort((a, b) => b.day.localeCompare(a.day));
    const pageDays = allDays.slice(offset, offset + pageSize);

    const topAppMap = getTopAppsByDay(pageDays.map(r => r.day));
    const fullDayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const data = pageDays.map((row, i) => {
      const d           = new Date(row.day + "T00:00:00");
      const activeTotal = row.productive + row.distracting;
      return {
        id:              offset + i + 1,
        date:            row.day,
        dayName:         fullDayNames[d.getDay()],
        totalTime:       fmt(row.total),
        productiveTime:  fmt(row.productive),
        distractingTime: fmt(row.distracting),
        idleTime:        fmt(row.idle),
        focusScore:      activeTotal === 0 ? 0 : Math.round((row.productive / activeTotal) * 100),
        topApp:          topAppMap[row.day] || "—",
      };
    });

    return {
      data,
      pagination: {
        page,
        pageSize,
        total:      allDays.length,
        totalPages: Math.ceil(allDays.length / pageSize),
        hasNext:    page < Math.ceil(allDays.length / pageSize),
        hasPrev:    page > 1,
      },
    };
  } catch (err) {
    logger.error("ReportsService", "getReportTable failed", err.message);
    return {
      data: [],
      pagination: { page: 1, pageSize, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }
}

export function getReportCSV(period = "weekly") {
  try {
    const days = period === "daily" ? 1 : period === "monthly" ? 30 : 7;

    const rows = getDailyAggregates(days).sort((a, b) => b.day.localeCompare(a.day));
    const topAppMap = getTopAppsByDay(rows.map(r => r.day));

    const fullDayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const headers = ["Date","Day","Total Time","Productive","Distracting","Idle","Focus Score","Top App"];
    const csvRows = [headers.join(",")];

    for (const row of rows) {
      const d           = new Date(row.day + "T00:00:00");
      const activeTotal = row.productive + row.distracting;
      const score       = activeTotal === 0 ? 0 : Math.round((row.productive / activeTotal) * 100);
      csvRows.push([
        row.day,
        fullDayNames[d.getDay()],
        fmt(row.total),
        fmt(row.productive),
        fmt(row.distracting),
        fmt(row.idle),
        `${score}%`,
        `"${topAppMap[row.day] || "—"}"`,
      ].join(","));
    }

    return csvRows.join("\n");
  } catch (err) {
    logger.error("ReportsService", "getReportCSV failed", err.message);
    return "Date,Day,Total Time,Productive,Distracting,Idle,Focus Score,Top App\n";
  }
}