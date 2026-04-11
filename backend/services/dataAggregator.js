import db from "../db/database.js";

export function getTodayUsage() {
  const now = new Date();
  const today =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  console.log(`[DataAggregator] Getting usage for: ${today}`);

  const rows = db.prepare(`
    SELECT app_name,
           COALESCE(SUM(duration), 0) as total_time,
           CASE WHEN is_productive = 1 THEN 'Productive' ELSE 'Distracting' END as category
    FROM app_usage
    WHERE date(timestamp) = ? AND is_idle = 0
    GROUP BY app_name, is_productive
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