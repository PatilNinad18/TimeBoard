import db from "./db/database.js";
import { getTodayProductivityStats } from "./services/statsService.js";

console.log("=== Testing Date Filtering ===");

// Check what dates exist in the database
const dates = db.prepare(`
  SELECT DISTINCT date(timestamp) as date, COUNT(*) as count
  FROM app_usage
  ORDER BY date DESC
  LIMIT 10
`).all();

console.log("Available dates in database:");
dates.forEach(row => {
  console.log(`  ${row.date}: ${row.count} records`);
});

// Test today's data
console.log("\n=== Testing Today ===");
const today = new Date();
const todayStr = today.getFullYear() + "-" + 
                 String(today.getMonth() + 1).padStart(2, "0") + "-" + 
                 String(today.getDate()).padStart(2, "0");
console.log("Today string:", todayStr);

const todayStats = getTodayProductivityStats(todayStr);
console.log("Today stats:", todayStats);

// Test yesterday's data
console.log("\n=== Testing Yesterday ===");
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.getFullYear() + "-" + 
                    String(yesterday.getMonth() + 1).padStart(2, "0") + "-" + 
                    String(yesterday.getDate()).padStart(2, "0");
console.log("Yesterday string:", yesterdayStr);

const yesterdayStats = getTodayProductivityStats(yesterdayStr);
console.log("Yesterday stats:", yesterdayStats);

// Test raw query for yesterday
console.log("\n=== Raw Query Test for Yesterday ===");
const rawYesterday = db.prepare(`
  SELECT
    COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
    COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
    COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle
  FROM app_usage
  WHERE date(timestamp) = ?
`).get(yesterdayStr);

console.log("Raw yesterday query result:", rawYesterday);

console.log("\n=== Test Complete ===");
