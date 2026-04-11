import db from "../db/database.js";

/**
 * Get activity sessions for a given date (defaults to today).
 * Returns individual tracked sessions with app name, window title, duration, category, and timestamp.
 */
export function getActivitySessions(dateStr = null) {
  const targetDate = dateStr || new Date().toISOString().split("T")[0];
  
  console.log(`🔍 Looking for activity data for: ${targetDate}`);
  console.log(`🕐 Current time: ${new Date().toLocaleString()}`);

  // Get all sessions for the date, grouped by hour
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
    WHERE date(timestamp) = ? AND is_idle = 0
    ORDER BY timestamp ASC
  `).all(targetDate);

  console.log(`📋 Found ${rows.length} real activity sessions for ${targetDate}`);

  if (rows.length === 0) {
    console.log(`⚠️ No activity data found for ${targetDate}. TimeBoard may not have been running today.`);
    return [];
  }

  // Log each session for debugging
  rows.forEach((row, index) => {
    console.log(`📝 Session ${index + 1}: ${row.app_name} at ${row.timestamp} for ${row.duration}s`);
  });

  return rows.map(row => {
    let category;
    if (row.is_productive) {
      category = "Productive";
    } else {
      category = "Distracting";
    }

    const durationMinutes = Math.round(row.duration / 60);
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    // Extract actual hour and time from timestamp
    const ts = new Date(row.timestamp);
    const hour = ts.getHours();
    const exactTime = `${String(hour).padStart(2, "0")}:${String(ts.getMinutes()).padStart(2, "0")}`;
    
    // Create hour label (6 AM - 7 AM format)
    const hourLabel = `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;

    console.log(`⏰ Processing: ${row.app_name} at ${exactTime} (${hourLabel})`);

    return {
      id: row.id,
      appName: row.app_name,
      windowTitle: row.window_title,
      duration: durationStr,
      durationMinutes: durationMinutes || 1,
      durationSeconds: Math.round(row.duration),
      category,
      exactTime: exactTime,
      hourLabel: hourLabel,
      hour: hour,
      fullTimestamp: row.timestamp,
      realTimestamp: ts.toISOString()
    };
  });
}
