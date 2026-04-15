import db from "./db/database.js";

console.log('=== DATABASE ANALYSIS ===');

// Check if database exists and has data
try {
  const count = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
  console.log('Total records in app_usage:', count.count);
  
  if (count.count === 0) {
    console.log('❌ No data found in database!');
    console.log('This explains the discrepancy - both pages should show 0 time');
    process.exit(0);
  }
  
  // Get today's date in different formats
  const now = new Date();
  const today1 = now.toISOString().split("T")[0]; // 2026-04-14
  const today2 = now.toISOString().slice(0,10);  // 2026-04-14
  
  console.log('Today (format 1):', today1);
  console.log('Today (format 2):', today2);
  
  // Check what dates exist in database
  const dates = db.prepare(`
    SELECT DATE(timestamp) as date, COUNT(*) as count, SUM(duration) as total_seconds
    FROM app_usage 
    GROUP BY DATE(timestamp)
    ORDER BY date DESC
    LIMIT 7
  `).all();
  
  console.log('Recent dates in database:');
  dates.forEach(d => {
    console.log(`  ${d.date}: ${d.count} records, ${Math.round(d.total_seconds/60)} minutes`);
  });
  
  // Test both query methods
  console.log('\n=== QUERY COMPARISON ===');
  
  // Method 1: date(timestamp)
  const method1 = db.prepare(`
    SELECT COUNT(*) as count, SUM(duration) as total_seconds
    FROM app_usage 
    WHERE date(timestamp) = ? AND is_idle = 0
  `).get(today1);
  
  // Method 2: DATE(timestamp)
  const method2 = db.prepare(`
    SELECT COUNT(*) as count, SUM(duration) as total_seconds
    FROM app_usage 
    WHERE DATE(timestamp) = ? AND is_idle = 0
  `).get(today2);
  
  console.log('Method 1 (date):', method1.count, 'records,', Math.round(method1.total_seconds/60), 'minutes');
  console.log('Method 2 (DATE):', method2.count, 'records,', Math.round(method2.total_seconds/60), 'minutes');
  
  // Check all data (ignoring date filter)
  const allData = db.prepare(`
    SELECT COUNT(*) as count, SUM(duration) as total_seconds
    FROM app_usage 
    WHERE is_idle = 0
  `).get();
  
  console.log('\nAll time data (no date filter):');
  console.log('Records:', allData.count);
  console.log('Total time:', Math.round(allData.total_seconds/60), 'minutes');
  
  // Check idle data
  const idleData = db.prepare(`
    SELECT COUNT(*) as count, SUM(duration) as total_seconds
    FROM app_usage 
    WHERE is_idle = 1
  `).get();
  
  console.log('\nIdle time data:');
  console.log('Records:', idleData.count);
  console.log('Total idle time:', Math.round(idleData.total_seconds/60), 'minutes');
  
} catch (error) {
  console.error('Database error:', error);
}

process.exit(0);
