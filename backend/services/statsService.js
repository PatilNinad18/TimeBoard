import db from "../db/database.js";

export function getTodayStats() {
  return db.prepare(`
    SELECT app_name, SUM(duration) as total_seconds
    FROM app_usage
    WHERE date(timestamp) = date('now')
    GROUP BY app_name
    ORDER BY total_seconds DESC
  `).all();
}

export function getTopApps() {
  return db.prepare(`
    SELECT app_name, SUM(duration) as total_seconds
    FROM app_usage
    GROUP BY app_name
    ORDER BY total_seconds DESC
    LIMIT 10
  `).all();
}

export function getProductivityStats() {

  const result = db.prepare(`
    SELECT
      SUM(CASE WHEN is_productive = 1 THEN duration ELSE 0 END) as productive,
      SUM(CASE WHEN is_productive = 0 THEN duration ELSE 0 END) as distracting
    FROM app_usage
    WHERE date(timestamp) = date('now')
  `).get();

  const productive = result.productive || 0;
  const distracting = result.distracting || 0;
  const total = productive + distracting;

  const score = total === 0 ? 0 : (productive / total) * 100;

  return { productive, distracting, score };
}