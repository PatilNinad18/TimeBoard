const Database = require('better-sqlite3');
const db = new Database('./data/timeboard.db');

console.log('=== SIMPLE DATABASE CHECK ===');

try {
  const total = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
  console.log('Total records:', total.count);
  
  if (total.count > 0) {
    const sample = db.prepare("SELECT * FROM app_usage LIMIT 5").all();
    console.log('Sample records:');
    sample.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.app_name} - ${row.duration}s - ${row.timestamp} - idle:${row.is_idle}`);
    });
    
    const today = new Date().toISOString().slice(0,10);
    console.log('\nToday:', today);
    
    const todayData = db.prepare(`
      SELECT COUNT(*) as count, SUM(duration) as total_seconds
      FROM app_usage 
      WHERE DATE(timestamp) = ?
    `).get(today);
    
    console.log('Today records:', todayData.count);
    console.log('Today total:', Math.round(todayData.total_seconds/60), 'minutes');
  } else {
    console.log('❌ No data in database!');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}

db.close();
