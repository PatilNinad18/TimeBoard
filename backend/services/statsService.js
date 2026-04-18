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

// Get productive apps for dynamic classification
function getProductiveApps() {
  return db.prepare(`
    SELECT app_name FROM user_productive_apps
  `).all().map(row => row.app_name);
}

// dateFilter is always a YYYY-MM-DD string OR null
// mode: "single" = exact date match, "range" = from dateFilter to today
export function getTodayProductivityStats(dateFilter = null, mode = "auto") {
  console.log(`[StatsService] called — dateFilter: ${dateFilter}, mode: ${mode}`);

  const { cond, param } = buildCond(dateFilter, mode === "auto" ? "single" : mode);
  const productiveApps = getProductiveApps();
  console.log(`[StatsService] Current productive apps:`, productiveApps);
  
  const query = `
    SELECT
      COALESCE(SUM(CASE 
        WHEN is_idle=0 AND app_name IN (${productiveApps.map(() => '?').join(',')}) THEN duration
        ELSE 0 
      END),0) as productive,
      COALESCE(SUM(CASE 
        WHEN is_idle=0 AND app_name NOT IN (${productiveApps.map(() => '?').join(',')}) THEN duration
        ELSE 0 
      END),0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle=1 THEN duration ELSE 0 END),0) as idle
    FROM app_usage
    WHERE ${cond}
  `;
  
  const queryParams = param ? [param, ...productiveApps, ...productiveApps] : [...productiveApps, ...productiveApps];
  console.log(`[StatsService] SQL: ${query} | params:`, queryParams);
  
  const result = queryParams.length > 0 
    ? db.prepare(query).get(...queryParams) 
    : db.prepare(query).get();
  console.log(`[StatsService] raw result:`, result);

  const productive  = result?.productive  || 0;
  const distracting = result?.distracting || 0;
  const idle        = result?.idle        || 0;
  const total       = productive + distracting;
  const score       = total === 0 ? 0 : (productive / total) * 100;

  console.log(`[StatsService] Calculated - Productive: ${productive}s, Distracting: ${distracting}s, Idle: ${idle}s`);
  console.log(`[StatsService] Score calculation: ${productive} / (${productive} + ${distracting}) * 100 = ${score}%`);

  return { productive, distracting, idle, score };
}