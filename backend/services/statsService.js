import db from "../db/database.js";

export function getTodayProductivityStats() {

  const result = db.prepare(`
    SELECT
      SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END) as productive,
      SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END) as distracting,
      SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END) as idle
    FROM app_usage
    WHERE date(timestamp) = date('now')
  `).get();

  const productive = result.productive || 0;
  const distracting = result.distracting || 0;
  const idle = result.idle || 0;

  const total = productive + distracting;

  const score = total === 0 ? 0 : (productive / total) * 100;

  return {
    productive,
    distracting,
    idle,
    score
  };
}