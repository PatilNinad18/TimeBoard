import db from "../db/database.js";
import logger from "../logger.js";
import { loadProductivityRules, isProductiveApp } from "./productivityRules.js";

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

function buildReportDayMap(days) {
  const rules = loadProductivityRules();
  const range = days > 1 ? `-${days - 1} days` : "0 days";
  const rows = db.prepare(`
    SELECT date(timestamp) as day, app_name, is_idle, duration
    FROM app_usage
    WHERE date(timestamp) >= date('now','localtime',?)
    ORDER BY day DESC
  `).all(range);

  const dayMap = {};
  for (const row of rows) {
    const day = row.day;
    if (!dayMap[day]) {
      dayMap[day] = {
        productive: 0,
        distracting: 0,
        idle: 0,
        total: 0,
        appDurations: {},
      };
    }

    const entry = dayMap[day];
    const duration = Number(row.duration) || 0;
    entry.total += duration;

    if (row.is_idle === 1) {
      entry.idle += duration;
    } else if (isProductiveApp(row.app_name, rules)) {
      entry.productive += duration;
    } else {
      entry.distracting += duration;
    }

    const appKey = row.app_name || "Unknown";
    entry.appDurations[appKey] = (entry.appDurations[appKey] || 0) + duration;
  }

  const daysList = Object.keys(dayMap).sort((a, b) => a < b ? 1 : -1);
  return { dayMap, daysList };
}

export function getReportSummary(period = "weekly") {
  try {
    const days = period === "daily" ? 1 : period === "monthly" ? 30 : 7;
    const { dayMap, daysList } = buildReportDayMap(days);

    if (daysList.length === 0) {
      return {
        bestFocusDay: { day: "—", value: "0h 0m" },
        avgFocusHours: "0h 0m",
        totalFocusTime: "0h 0m",
        consistency: 0,
        trackedDays: 0,
      };
    }

    const rows = daysList.map(day => ({ day, ...dayMap[day] }));
    const bestDay = rows.reduce((b, r) => r.productive > b.productive ? r : b, rows[0]);
    const bestDayDate = new Date(bestDay.day + "T00:00:00");
    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const totalProductive = rows.reduce((s, r) => s + r.productive, 0);
    const productiveDays = rows.filter(r => r.productive > r.distracting).length;

    return {
      bestFocusDay: {
        day: `${dayNames[bestDayDate.getDay()]} (${bestDay.day})`,
        value: fmt(bestDay.productive),
      },
      avgFocusHours: fmt(Math.round(totalProductive / rows.length)),
      totalFocusTime: fmt(totalProductive),
      consistency: Math.round((productiveDays / rows.length) * 100),
      trackedDays: rows.length,
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
export function getReportTable(period = "weekly", page = 1, pageSize = 10) {
  try {
    const days = period === "daily" ? 1 : period === "monthly" ? 30 : 7;
    const offset = (page - 1) * pageSize;
    const { dayMap, daysList } = buildReportDayMap(days);

    const totalRows = daysList.length;
    const pageDays = daysList.slice(offset, offset + pageSize);

    const fullDayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const data = pageDays.map((day, i) => {
      const row = dayMap[day];
      const d = new Date(day + "T00:00:00");
      const activeTotal = row.productive + row.distracting;
      const topApp = Object.entries(row.appDurations)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      return {
        id:             offset + i + 1,
        date:           day,
        dayName:        fullDayNames[d.getDay()],
        totalTime:      fmt(row.total),
        productiveTime: fmt(row.productive),
        distractingTime: fmt(row.distracting),
        idleTime:       fmt(row.idle),
        focusScore:     activeTotal === 0 ? 0 : Math.round((row.productive / activeTotal) * 100),
        topApp,
      };
    });

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: totalRows,
        totalPages: Math.ceil(totalRows / pageSize),
        hasNext: page < Math.ceil(totalRows / pageSize),
        hasPrev: page > 1,
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
    const { dayMap, daysList } = buildReportDayMap(days);

    const fullDayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const headers = ["Date","Day","Total Time","Productive","Distracting","Idle","Focus Score","Top App"];
    const csvRows = [headers.join(",")];

    for (const day of daysList) {
      const row = dayMap[day];
      const d = new Date(day + "T00:00:00");
      const activeTotal = row.productive + row.distracting;
      const score = activeTotal === 0 ? 0 : Math.round((row.productive / activeTotal) * 100);
      const topApp = Object.entries(row.appDurations)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      csvRows.push([
        day,
        fullDayNames[d.getDay()],
        fmt(row.total),
        fmt(row.productive),
        fmt(row.distracting),
        fmt(row.idle),
        `${score}%`,
        `"${topApp}"`,
      ].join(","));
    }

    return csvRows.join("\n");
  } catch (err) {
    logger.error("ReportsService", "getReportCSV failed", err.message);
    return "Date,Day,Total Time,Productive,Distracting,Idle,Focus Score,Top App\n";
  }
}