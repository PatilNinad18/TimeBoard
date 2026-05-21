import db from "../db/database.js";
import logger from "../logger.js";
import { loadProductivityRules, isProductiveApp } from "./productivityRules.js";

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

export function getTodayProductivityStats(dateFilter = null, mode = "single") {
  logger.info("StatsService", `called — dateFilter: ${dateFilter}, mode: ${mode}`);

  try {
    const { cond, param } = buildCond(dateFilter, mode);
    const rules = loadProductivityRules();

    logger.info("StatsService", `productive rules: ${JSON.stringify(rules)}`);

    // Fetch active app usage (non-idle). Include all apps regardless of
    // how small their summed durations are so frontend aggregates (like
    // the App Breakdown) and the total productive/distracting values
    // remain consistent.
    const activeRows = param
      ? db.prepare(`
          SELECT app_name, COALESCE(SUM(duration), 0) as total
          FROM app_usage
          WHERE ${cond} AND is_idle = 0
          GROUP BY app_name
          ORDER BY total DESC
        `).all(param)
      : db.prepare(`
          SELECT app_name, COALESCE(SUM(duration), 0) as total
          FROM app_usage
          WHERE ${cond} AND is_idle = 0
          GROUP BY app_name
          ORDER BY total DESC
        `).all();

    // Fetch idle time separately
    const idleRows = param
      ? db.prepare(`
          SELECT COALESCE(SUM(duration), 0) as total
          FROM app_usage
          WHERE ${cond} AND is_idle = 1
        `).all(param)
      : db.prepare(`
          SELECT COALESCE(SUM(duration), 0) as total
          FROM app_usage
          WHERE ${cond} AND is_idle = 1
        `).all();

    logger.info("StatsService", `active rows count: ${activeRows.length}, idle rows count: ${idleRows.length}`);

    let productive = 0, distracting = 0, idle = 0;

    // Process active app usage
    for (const row of activeRows) {
      if (isProductiveApp(row.app_name, rules)) {
        productive += row.total;
      } else {
        distracting += row.total;
      }
    }

    // Process idle time
    idle = idleRows.length > 0 ? idleRows[0].total : 0;

    const total = productive + distracting + idle;
    const score = total === 0 ? 0 : (productive / total) * 100;

    logger.info("StatsService", `result — productive:${productive}s distracting:${distracting}s idle:${idle}s score:${score.toFixed(1)}%`);

    return { productive, distracting, idle, score };

  } catch (err) {
    logger.error("StatsService", `failed: ${err.message}`);
    return { productive: 0, distracting: 0, idle: 0, score: 0 };
  }
}