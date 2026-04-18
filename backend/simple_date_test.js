import db from "./db/database.js";

console.log("=== Simple Date Test ===");

// Check what dates exist in the database
try {
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

  // Get today and yesterday
  const today = new Date();
  const todayStr = today.getFullYear() + "-" + 
                   String(today.getMonth() + 1).padStart(2, "0") + "-" + 
                   String(today.getDate()).padStart(2, "0");
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.getFullYear() + "-" + 
                      String(yesterday.getMonth() + 1).padStart(2, "0") + "-" + 
                      String(yesterday.getDate()).padStart(2, "0");

  console.log(`\nToday: ${todayStr}`);
  console.log(`Yesterday: ${yesterdayStr}`);

  // Test yesterday query directly
  const yesterdayData = db.prepare(`
    SELECT app_name, duration, timestamp
    FROM app_usage
    WHERE date(timestamp) = ?
    LIMIT 5
  `).all(yesterdayStr);

  console.log(`\nYesterday data (${yesterdayData.length} records):`);
  yesterdayData.forEach(row => {
    console.log(`  ${row.app_name}: ${row.duration}s at ${row.timestamp}`);
  });

} catch (error) {
  console.error("Error:", error);
}

console.log("\n=== Test Complete ===");
