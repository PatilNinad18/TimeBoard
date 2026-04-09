import db from "../db/database.js";

/**
 * Get activity sessions for a given date (defaults to today).
 * Returns individual tracked sessions with app name, window title, duration, category, and timestamp.
 */
export function getActivitySessions(dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split("T")[0];

  const rows = db.prepare(`
    SELECT 
      id,
      app_name,
      window_title,
      duration,
      is_productive,
      is_idle,
      timestamp
    FROM app_usage
    WHERE date(timestamp) = ?
    ORDER BY timestamp ASC
  `).all(targetDate);

  return rows.map(row => {
    let category;
    if (row.is_idle) {
      category = "Idle";
    } else if (row.is_productive) {
      category = "Productive";
    } else {
      category = "Distracting";
    }

    const durationMinutes = Math.round(row.duration / 60);
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    // Extract time from timestamp
    const ts = new Date(row.timestamp);
    const timeStr = `${String(ts.getHours()).padStart(2, "0")}:${String(ts.getMinutes()).padStart(2, "0")}`;

    return {
      id: row.id,
      appName: row.is_idle ? null : row.app_name,
      windowTitle: row.is_idle ? null : row.window_title,
      duration: durationStr,
      durationMinutes: durationMinutes || 1, // at least 1 min for display
      durationSeconds: Math.round(row.duration),
      category,
      timestamp: timeStr,
    };
  });
}
