import db from "../db/database.js";
import logger from "../logger.js";
import { classifyJoins, effectiveProductiveExpr } from "./classificationService.js";

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

// Bug 2/5 fix: resolve classification at read time by JOINing the current
// user_productive_apps / blocked_apps tables instead of trusting the
// is_productive value baked into each row at recording time.
// This means a Settings change (VS Code → Productive) is reflected
// immediately in all calculated totals without rewriting historical rows.
export function getTodayProductivityStats(dateFilter = null, mode = "single") {
  logger.info("StatsService", `called — dateFilter: ${dateFilter}, mode: ${mode}`);

  try {
    const { cond, param } = buildCond(dateFilter, mode);

    const sql = `
      SELECT
        a.is_idle,
        ${effectiveProductiveExpr()} AS effective_productive,
        COALESCE(SUM(a.duration), 0) AS total
      FROM app_usage a
      ${classifyJoins()}
      WHERE ${cond}
      GROUP BY a.is_idle, effective_productive
    `;

    const rows = param
      ? db.prepare(sql).all(param)
      : db.prepare(sql).all();

    logger.info("StatsService", `raw rows count: ${rows.length}`);

    let productive = 0, distracting = 0, idle = 0;

    for (const row of rows) {
      if (row.is_idle) {
        // Idle is neither productive nor distracting — never folded into either bucket.
        idle += row.total;
      } else if (row.effective_productive) {
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