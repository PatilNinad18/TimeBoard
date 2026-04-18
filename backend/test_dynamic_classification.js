import db from "./db/database.js";
import { getTodayProductivityStats } from "./services/statsService.js";
import { getProductiveApps } from "./services/productivityService.js";

console.log("=== Testing Dynamic App Classification ===");

// 1. Check current productive apps
const productiveApps = getProductiveApps();
console.log("Current productive apps:", productiveApps);

// 2. Get today's stats with dynamic classification
const stats = getTodayProductivityStats();
console.log("Today's stats (dynamic):", stats);

// 3. Check some raw app usage data
const rawUsage = db.prepare(`
  SELECT app_name, SUM(duration) as total_time, is_idle
  FROM app_usage 
  WHERE date(timestamp) = date('now','localtime')
  GROUP BY app_name, is_idle
  ORDER BY total_time DESC
  LIMIT 10
`).all();

console.log("Raw app usage (today):");
rawUsage.forEach(row => {
  const isProductive = productiveApps.includes(row.app_name);
  const classification = row.is_idle ? "Idle" : (isProductive ? "Productive" : "Distracting");
  console.log(`  ${row.app_name}: ${Math.round(row.total_time/60)}min - ${classification}`);
});

console.log("=== Test Complete ===");
