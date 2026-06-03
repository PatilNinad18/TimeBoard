import db from "../db/database.js";

export function getActivitySessions(dateStr = null) {
  const now = new Date();
  const localDateStr =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

  const targetDate = dateStr || localDateStr;

  console.log(`🔍 Activity query for: ${targetDate}`);
  console.log(`🕐 Current local time: ${now.toLocaleString()}`);

  // Since we now store local timestamps, date(timestamp) works correctly — no 'localtime' modifier needed
  const rows = db.prepare(`
    SELECT id, app_name, window_title, duration, is_productive, is_idle, timestamp
    FROM app_usage
    WHERE date(timestamp) = ?
      AND duration > 0
    ORDER BY timestamp ASC
  `).all(targetDate);

  console.log(`📋 Found ${rows.length} sessions for ${targetDate}`);

  if (rows.length === 0) {
    console.log(`⚠️ No data for ${targetDate} — TimeBoard may not have been running.`);
    return [];
  }

  return rows.map((row, index) => {
    const ts = new Date(row.timestamp);

    if (isNaN(ts.getTime())) {
      console.warn(`⚠️ Invalid timestamp row ${row.id}: "${row.timestamp}"`);
      return null;
    }

    const hour = ts.getHours();
    const mins = ts.getMinutes();
    const nextHour = (hour + 1) % 24;

    const exactTime = `${String(hour).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    const hourLabel = `${String(hour).padStart(2, "0")}:00 - ${String(nextHour).padStart(2, "0")}:00`;

    const totalSeconds = Math.round(row.duration || 0);
    const durationMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
    const durationHours = Math.floor(totalSeconds / 3600);
    const remainingSeconds = totalSeconds % 60;
    const durationRemMins = Math.floor((totalSeconds % 3600) / 60);

    let durationStr;
    if (totalSeconds < 60) {
      durationStr = `${totalSeconds}s`;
    } else if (durationHours > 0) {
      durationStr = `${durationHours}h ${durationRemMins}m ${remainingSeconds}s`;
    } else {
      durationStr = `${durationRemMins}m ${remainingSeconds}s`;
    }

    const category = row.is_idle ? "Idle" : row.is_productive ? "Productive" : "Distracting";

    console.log(`📝 [${index + 1}] ${row.app_name} | ${exactTime} (${hourLabel}) | ${durationStr}`);

    return {
      id: row.id,
      appName: row.app_name,
      windowTitle: row.window_title || "",
      duration: durationStr,
      durationMinutes,
      durationSeconds: totalSeconds,
      category,
      hour,
      hourLabel,
      exactTime,
      fullTimestamp: row.timestamp,
      realTimestamp: ts.toISOString(),
    };
  }).filter(Boolean);
}