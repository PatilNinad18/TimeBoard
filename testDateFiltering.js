// Test script to verify date filtering logic
import db from "./backend/db/database.js";

console.log("Testing date filtering logic...");

// Test Today's data
const today = new Date();
const todayStr = today.getFullYear() + "-" + 
               String(today.getMonth() + 1).padStart(2, "0") + "-" + 
               String(today.getDate()).padStart(2, "0");

console.log("\n=== TODAY'S DATA ===");
console.log("Date:", todayStr);

const todayResult = db.prepare(`
  SELECT
    COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
    COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
    COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle
  FROM app_usage
  WHERE date(timestamp) = ?
`).get(todayStr);

console.log("Productive:", todayResult.productive, "seconds");
console.log("Distracting:", todayResult.distracting, "seconds");
console.log("Idle:", todayResult.idle, "seconds");

// Test Yesterday's data
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.getFullYear() + "-" + 
                   String(yesterday.getMonth() + 1).padStart(2, "0") + "-" + 
                   String(yesterday.getDate()).padStart(2, "0");

console.log("\n=== YESTERDAY'S DATA ===");
console.log("Date:", yesterdayStr);

const yesterdayResult = db.prepare(`
  SELECT
    COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
    COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
    COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle
  FROM app_usage
  WHERE date(timestamp) = ?
`).get(yesterdayStr);

console.log("Productive:", yesterdayResult.productive, "seconds");
console.log("Distracting:", yesterdayResult.distracting, "seconds");
console.log("Idle:", yesterdayResult.idle, "seconds");

// Test Last 7 days data
console.log("\n=== LAST 7 DAYS DATA ===");

const last7Result = db.prepare(`
  SELECT
    COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
    COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
    COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle
  FROM app_usage
  WHERE date(timestamp) >= date('now', 'localtime', '-7 days')
`).get();

console.log("Productive:", last7Result.productive, "seconds");
console.log("Distracting:", last7Result.distracting, "seconds");
console.log("Idle:", last7Result.idle, "seconds");

// Test Last 30 days data
console.log("\n=== LAST 30 DAYS DATA ===");

const last30Result = db.prepare(`
  SELECT
    COALESCE(SUM(CASE WHEN is_productive = 1 AND is_idle = 0 THEN duration ELSE 0 END), 0) as productive,
    COALESCE(SUM(CASE WHEN is_productive = 0 AND is_idle = 0 THEN duration ELSE 0 END), 0) as distracting,
    COALESCE(SUM(CASE WHEN is_idle = 1 THEN duration ELSE 0 END), 0) as idle
  FROM app_usage
  WHERE date(timestamp) >= date('now', 'localtime', '-30 days')
`).get();

console.log("Productive:", last30Result.productive, "seconds");
console.log("Distracting:", last30Result.distracting, "seconds");
console.log("Idle:", last30Result.idle, "seconds");

console.log("\n=== COMPARISON ===");
console.log("Today vs Yesterday should be different:");
console.log("Today productive:", todayResult.productive);
console.log("Yesterday productive:", yesterdayResult.productive);
console.log("Difference:", Math.abs(todayResult.productive - yesterdayResult.productive));

console.log("\nLast 7 days should be >= Today:");
console.log("Last 7 days productive:", last7Result.productive);
console.log("Today productive:", todayResult.productive);
console.log("7 days >= today:", last7Result.productive >= todayResult.productive);

console.log("\nLast 30 days should be >= Last 7 days:");
console.log("Last 30 days productive:", last30Result.productive);
console.log("Last 7 days productive:", last7Result.productive);
console.log("30 days >= 7 days:", last30Result.productive >= last7Result.productive);

console.log("\nTest completed!");
