import db from "../db/database.js";
import { classifyJoins, effectiveProductiveExpr } from "./classificationService.js";

// Bug 4 fix: resolve category at read time by JOINing current classification
// tables instead of using MAX(is_productive) from stale stored rows.
// This ensures the Dashboard App Usage list always reflects the current Settings.
export function getTodayUsage() {
  const now = new Date();
  const today =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  console.log(`[DataAggregator] Getting usage for: ${today}`);

  const rows = db.prepare(`
    SELECT
      a.app_name,
      COALESCE(SUM(a.duration), 0) as total_time,
      CASE WHEN (${effectiveProductiveExpr()}) = 1 THEN 'Productive' ELSE 'Distracting' END as category
    FROM app_usage a
    ${classifyJoins()}
    WHERE date(a.timestamp) = ? AND a.app_name != 'Idle' AND a.is_idle = 0
    GROUP BY a.app_name
    ORDER BY total_time DESC
  `).all(today);

  console.log(`[DataAggregator] Found ${rows.length} records`);

  return rows.map(row => ({
    app: row.app_name,
    totalSeconds: row.total_time,
    minutes: Math.round(row.total_time / 60),
    category: row.category
  }));
}
