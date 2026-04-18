import db from "./db/database.js";

console.log("=== Database Data Check ===");

try {
  // Check total records
  const totalRecords = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
  console.log(`Total records in app_usage: ${totalRecords.count}`);

  if (totalRecords.count === 0) {
    console.log("No data found in database!");
    return;
  }

  // Check date range
  const dateRange = db.prepare(`
    SELECT 
      MIN(date(timestamp)) as min_date,
      MAX(date(timestamp)) as max_date,
      COUNT(DISTINCT date(timestamp)) as unique_dates
    FROM app_usage
  `).get();

  console.log(`Date range: ${dateRange.min_date} to ${dateRange.max_date}`);
  console.log(`Unique dates: ${dateRange.unique_dates}`);

  // Show all available dates
  const dates = db.prepare(`
    SELECT 
      date(timestamp) as date,
      COUNT(*) as count,
      SUM(duration) as total_duration
    FROM app_usage
    GROUP BY date(timestamp)
    ORDER BY date DESC
  `).all();

  console.log("\nData by date:");
  dates.forEach(row => {
    const hours = Math.floor(row.total_duration / 3600);
    const minutes = Math.floor((row.total_duration % 3600) / 60);
    console.log(`  ${row.date}: ${row.count} records, ${hours}h ${minutes}m total`);
  });

  // Check today's data specifically
  const today = new Date();
  const todayStr = today.getFullYear() + "-" + 
                   String(today.getMonth() + 1).padStart(2, "0") + "-" + 
                   String(today.getDate()).padStart(2, "0");

  const todayData = db.prepare(`
    SELECT COUNT(*) as count, SUM(duration) as total_duration
    FROM app_usage
    WHERE date(timestamp) = ?
  `).get(todayStr);

  console.log(`\nToday (${todayStr}): ${todayData.count} records, ${Math.floor(todayData.total_duration / 3600)}h ${Math.floor((todayData.total_duration % 3600) / 60)}m`);

} catch (error) {
  console.error("Error:", error);
}

console.log("\n=== Check Complete ===");
