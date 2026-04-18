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

export function getTodayProductivityStats(dateFilter = null, mode = "single") {
  logger.info("StatsService", `called — dateFilter: ${dateFilter}, mode: ${mode}`);

  try {
    const { cond, param } = buildCond(dateFilter, mode);
    const productiveApps  = getProductiveApps();

    logger.info("StatsService", `productive apps: ${JSON.stringify(productiveApps)}`);

    // Fetch ALL rows for the period — classify in JS, not SQL
    // This completely avoids the IN () empty list bug AND the param binding bug
    const rows = param
      ? db.prepare(`
          SELECT app_name, is_idle, COALESCE(SUM(duration), 0) as total
          FROM app_usage
          WHERE ${cond}
          GROUP BY app_name, is_idle
        `).all(param)          // ← single string param, NOT spread
      : db.prepare(`
          SELECT app_name, is_idle, COALESCE(SUM(duration), 0) as total
          FROM app_usage
          WHERE ${cond}
          GROUP BY app_name, is_idle
        `).all();              // ← no params needed

    logger.info("StatsService", `raw rows count: ${rows.length}`);

    let productive = 0, distracting = 0, idle = 0;

    for (const row of rows) {
      if (row.is_idle) {
        idle += row.total;
        continue;
      }
      if (productiveApps.length === 0) {
        // No config yet — treat all as distracting
        distracting += row.total;
      } else if (productiveApps.includes(row.app_name)) {
        productive += row.total;
      } else {
        distracting += row.total;
      }
    }

    const total = productive + distracting;
    const score = total === 0 ? 0 : (productive / total) * 100;

    logger.info("StatsService", `result — productive:${productive}s distracting:${distracting}s idle:${idle}s score:${score.toFixed(1)}%`);

    return { productive, distracting, idle, score };

  } catch (err) {
    logger.error("StatsService", `failed: ${err.message}`);
    return { productive: 0, distracting: 0, idle: 0, score: 0 };
  }
}