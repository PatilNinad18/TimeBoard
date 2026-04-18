import db from "../db/database.js";

// Date condition builder - consistent with analyticsService
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

function runGet(sql, param) {
  return param ? db.prepare(sql).get(...param) : db.prepare(sql).get();
}

// dateFilter is always a YYYY-MM-DD string OR null
// mode: "single" = exact date match, "range" = from dateFilter to today
export function getTodayProductivityStats(dateFilter = null, mode = "auto") {
  console.log(`[StatsService] called — dateFilter: ${dateFilter}, mode: ${mode}`);

  const { cond, param } = buildCond(dateFilter, mode === "auto" ? "single" : mode);
  const query = `
    SELECT
      COALESCE(SUM(CASE WHEN is_productive=1 AND is_idle=0 THEN duration ELSE 0 END),0) as productive,
      COALESCE(SUM(CASE WHEN is_productive=0 AND is_idle=0 THEN duration ELSE 0 END),0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle=1 THEN duration ELSE 0 END),0) as idle
    FROM app_usage
    WHERE ${cond}
  `;
  
  console.log(`[StatsService] SQL: ${query} | param: ${param}`);
  
  const result = param ? db.prepare(query).get(param) : db.prepare(query).get();
  console.log(`[StatsService] raw result:`, result);

  const productive  = result?.productive  || 0;
  const distracting = result?.distracting || 0;
  const idle        = result?.idle        || 0;
  const total       = productive + distracting;
  const score       = total === 0 ? 0 : (productive / total) * 100;

  return { productive, distracting, idle, score };
}