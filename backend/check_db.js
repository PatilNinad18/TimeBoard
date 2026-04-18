const Database = require('better-sqlite3');
const db = new Database('./data/timeboard.db');

try {
  console.log('=== DATABASE CHECK ===');
  
  // Check total records
  const total = db.prepare('SELECT COUNT(*) as count FROM app_usage').get();
  console.log('Total records:', total.count);
  
  // Check today's records
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = db.prepare('SELECT COUNT(*) as count FROM app_usage WHERE date(timestamp) = ?').get(today);
  console.log('Today records:', todayRecords.count);
  
  // Show recent records
  const recent = db.prepare('SELECT app_name, timestamp, duration, is_productive, is_idle FROM app_usage ORDER BY timestamp DESC LIMIT 5').all();
  console.log('Recent records:');
  recent.forEach((record, i) => {
    console.log(`  ${i+1}. ${record.app_name} - ${record.duration}s - ${record.timestamp} - productive:${record.is_productive} idle:${record.is_idle}`);
  });
  
  // Check user_productive_apps table
  const productiveApps = db.prepare('SELECT * FROM user_productive_apps').all();
  console.log('Productive apps set:', productiveApps.length);
  productiveApps.forEach(app => {
    console.log(`  - ${app.app_name}`);
  });
  
  if (total.count === 0) {
    console.log('\n!!! NO DATA FOUND !!!');
    console.log('The app tracker is not collecting data!');
    console.log('Possible causes:');
    console.log('1. App tracker not started');
    console.log('2. active-win package not working');
    console.log('3. Database permissions issue');
    console.log('4. App not running long enough');
  }
  
} catch (error) {
  console.error('Database error:', error.message);
} finally {
  db.close();
}
