import db from "../db/database.js";
import { loadProductivityRules, isProductiveApp } from "./productivityRules.js";

export function getTodayUsage() {
  const now = new Date();
  const today =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  console.log(`[DataAggregator] Getting usage for: ${today}`);

  const rules = loadProductivityRules();
  console.log(`[DataAggregator] Productivity rules: ${JSON.stringify(rules)}`);

  const rows = db.prepare(`
    SELECT app_name,
           COALESCE(SUM(duration), 0) as total_time
    FROM app_usage
    WHERE date(timestamp) = ? AND is_idle = 0
    GROUP BY app_name
    HAVING COALESCE(SUM(duration), 0) >= 60
    ORDER BY total_time DESC
  `).all(today);

  console.log(`[DataAggregator] Found ${rows.length} records`);

  return rows.map(row => ({
    app: row.app_name,
    totalSeconds: row.total_time,
    minutes: Math.round(row.total_time / 60),
    category: isProductiveApp(row.app_name, rules) ? 'Productive' : 'Distracting'
  }));
}