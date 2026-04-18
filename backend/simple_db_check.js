// Simple database check
console.log("=== Database Check ===");

try {
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const dbPath = path.join(__dirname, 'data', 'timeboard.db');
  console.log('Database path:', dbPath);
  
  const db = new Database(dbPath, { readonly: true });
  
  // Check total records
  const total = db.prepare('SELECT COUNT(*) as count FROM app_usage').get();
  console.log('Total records:', total.count);
  
  // Check distinct dates
  const dates = db.prepare(`
    SELECT DISTINCT date(timestamp) as date, COUNT(*) as count 
    FROM app_usage 
    GROUP BY date(timestamp) 
    ORDER BY date DESC 
    LIMIT 10
  `).all();
  
  console.log('\nAvailable dates:');
  dates.forEach(row => {
    console.log(`  ${row.date}: ${row.count} records`);
  });
  
  // Check yesterday specifically
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.getFullYear() + '-' + 
                     String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(yesterday.getDate()).padStart(2, '0');
  
  console.log(`\nYesterday (${yesterdayStr}):`);
  const yesterdayCount = db.prepare(`
    SELECT COUNT(*) as count FROM app_usage 
    WHERE date(timestamp) = ?
  `).get(yesterdayStr);
  
  console.log(`  Records: ${yesterdayCount.count}`);
  
  db.close();
  console.log('\n=== Check Complete ===');
  
} catch (error) {
  console.error('Error:', error.message);
}
