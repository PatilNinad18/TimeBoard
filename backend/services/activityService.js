import db from "../db/database.js";

export function getActivitySessions(dateStr = null) {
  const now = new Date();
  const localDateStr =
    now.getFullYear() + "-" +
    String(now.getMonth()+1).padStart(2,"0") + "-" +
    String(now.getDate()).padStart(2,"0");

  const targetDate = dateStr || localDateStr;

  console.log(`[ActivityService] Querying for: ${targetDate}`);

  const rows = db.prepare(`
    SELECT id, app_name, window_title, duration, is_productive, is_idle, timestamp
    FROM app_usage
    WHERE date(timestamp) = ?
      AND is_idle = 0
      AND duration > 0
    ORDER BY timestamp ASC
  `).all(targetDate);

  console.log(`[ActivityService] Found ${rows.length} sessions`);

  if (rows.length === 0) return [];

  const createSessionSegment = (row, startTs, segmentSeconds) => {
    const durationMinutes = Math.max(1, Math.round(segmentSeconds / 60));
    const durationHours = Math.floor(durationMinutes / 60);
    const durationRemMins = durationMinutes % 60;
    const durationStr = durationHours > 0
      ? `${durationHours}h ${durationRemMins}m`
      : `${durationMinutes} min`;

    const hour = startTs.getHours();
    const nextHour = (hour + 1) % 24;
    const exactTime = `${String(hour).padStart(2, "0")}:${String(startTs.getMinutes()).padStart(2, "0")}`;
    const hourLabel = `${String(hour).padStart(2, "0")}:00 - ${String(nextHour).padStart(2, "0")}:00`;

    return {
      id:             `${row.id}-${hour}`,
      appName:        row.app_name,
      windowTitle:    row.window_title || "",
      duration:       durationStr,
      durationMinutes: durationMinutes,
      durationSeconds: segmentSeconds,
      category:       row.is_productive ? "Productive" : "Distracting",
      hour,
      hourLabel,
      exactTime,
      fullTimestamp:  row.timestamp,
      realTimestamp:  startTs.toISOString(),
    };
  };

  const splitSessionAcrossHours = (row) => {
    const startTs = new Date(row.timestamp);
    if (isNaN(startTs.getTime())) return [];

    const totalSeconds = Math.round(row.duration || 0);
    if (totalSeconds <= 0) return [];

    const endTs = new Date(startTs.getTime() + totalSeconds * 1000);
    const segments = [];
    let segmentStart = new Date(startTs);

    while (segmentStart < endTs) {
      const segmentHourEnd = new Date(segmentStart);
      segmentHourEnd.setMinutes(0, 0, 0);
      segmentHourEnd.setHours(segmentHourEnd.getHours() + 1);

      const segmentEnd = endTs < segmentHourEnd ? endTs : segmentHourEnd;
      const segmentSeconds = Math.round((segmentEnd.getTime() - segmentStart.getTime()) / 1000);

      if (segmentSeconds > 0) {
        segments.push(createSessionSegment(row, segmentStart, segmentSeconds));
      }

      segmentStart = segmentEnd;
    }

    return segments;
  };

  return rows.flatMap((row, index) => {
    const segments = splitSessionAcrossHours(row);
    if (segments.length === 0) return [];

    console.log(
      `[ActivityService] [${index+1}] ${row.app_name} | total:${Math.round(row.duration/60)}m | segments:${segments.map(s => `${s.hourLabel}:${s.durationMinutes}m`).join(", ")}`
    );

    return segments;
  });
}
