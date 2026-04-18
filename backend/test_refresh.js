import db from "./db/database.js";
import { setProductiveApps, getProductiveApps } from "./services/productivityService.js";
import { getTodayProductivityStats } from "./services/statsService.js";

console.log("=== Testing Dynamic Refresh ===");

// 1. Check current productive apps
console.log("\n1. Current productive apps:");
const currentApps = getProductiveApps();
console.log(currentApps);

// 2. Get current stats
console.log("\n2. Current stats:");
const currentStats = getTodayProductivityStats();
console.log(`Productive: ${currentStats.productive}s, Distracting: ${currentStats.distracting}s, Score: ${currentStats.score}%`);

// 3. Simulate changing Chrome to productive (if it's not already)
const testApps = ["VSCode", "Firefox", "Chrome"]; // Adjust based on your actual apps
console.log("\n3. Setting productive apps to:", testApps);
setProductiveApps(testApps);

// 4. Check productive apps after change
console.log("\n4. Productive apps after change:");
const newApps = getProductiveApps();
console.log(newApps);

// 5. Get stats after change
console.log("\n5. Stats after change:");
const newStats = getTodayProductivityStats();
console.log(`Productive: ${newStats.productive}s, Distracting: ${newStats.distracting}s, Score: ${newStats.score}%`);

// 6. Show the difference
console.log("\n6. Comparison:");
console.log(`Score changed from ${currentStats.score}% to ${newStats.score}%`);
console.log(`Productive changed from ${currentStats.productive}s to ${newStats.productive}s`);
console.log(`Distracting changed from ${currentStats.distracting}s to ${newStats.distracting}s`);

console.log("\n=== Test Complete ===");
