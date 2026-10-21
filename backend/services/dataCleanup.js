import db from "../db/database.js";
import { resetTrackerSession } from "./appTracker.js";

export function cleanupOldData() {
  db.prepare(`
    DELETE FROM app_usage
    WHERE timestamp < date('now', '-90 days');
  `).run();

  console.log("Old data cleaned");
}

export function deleteTodayData() {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    console.log(`[DataCleanup] Deleting today's data (${today})...`);

    const usageResult = db.prepare(`
      DELETE FROM app_usage
      WHERE date(timestamp) = ? OR date(timestamp) = date('now', 'localtime')
    `).run(today);

    try {
      db.prepare(`
        DELETE FROM daily_stats
        WHERE date = ? OR date = date('now', 'localtime')
      `).run(today);
    } catch (err) {
      console.warn("[DataCleanup] daily_stats delete warning:", err.message);
    }

    resetTrackerSession();

    console.log(`[DataCleanup] Deleted today's data: ${usageResult.changes} records`);
    return { success: true, count: usageResult.changes };
  } catch (err) {
    console.error("[DataCleanup] Error deleting today's data:", err);
    return { success: false, error: err.message };
  }
}

export function clearAllData() {
  try {
    console.log("[DataCleanup] Clearing all tracking data...");

    const usageResult = db.prepare("DELETE FROM app_usage").run();

    try {
      db.prepare("DELETE FROM daily_stats").run();
    } catch (err) {
      console.warn("[DataCleanup] daily_stats clear warning:", err.message);
    }

    try {
      db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('app_usage', 'daily_stats')").run();
    } catch (err) {
      // safe to ignore
    }

    try {
      db.exec("VACUUM");
    } catch (err) {
      console.warn("[DataCleanup] VACUUM warning:", err.message);
    }

    resetTrackerSession();

    console.log(`[DataCleanup] Cleared all data: ${usageResult.changes} records`);
    return { success: true, count: usageResult.changes };
  } catch (err) {
    console.error("[DataCleanup] Error clearing all data:", err);
    return { success: false, error: err.message };
  }
}
