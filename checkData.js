import db from "./backend/db/database.js";

console.log("Checking database data...");

// Check if there's any data at all
const totalRows = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
console.log("Total rows in app_usage:", totalRows.count);

// Check dates available
const dates = db.prepare("SELECT DISTINCT date(timestamp) as date FROM app_usage ORDER BY date DESC LIMIT 10").all();
console.log("Available dates:", dates);

// Check today's data specifically
const today = new Date();
const todayStr = today.getFullYear() + "-" + 
               String(today.getMonth() + 1).padStart(2, "0") + "-" + 
               String(today.getDate()).padStart(2, "0");

console.log("Today's date string:", todayStr);

const todayData = db.prepare("SELECT COUNT(*) as count FROM app_usage WHERE date(timestamp) = ?").get(todayStr);
console.log("Today's data count:", todayData.count);

// Sample some recent data
const recent = db.prepare("SELECT timestamp, app_name, duration, is_productive FROM app_usage ORDER BY timestamp DESC LIMIT 5").all();
console.log("Recent data:", recent);
