// Quick fix to create data for today
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'timeboard.db');
const db = new Database(dbPath);

console.log('=== CREATING SAMPLE DATA FOR TODAY ===');

const today = new Date();
const todayStr = today.getFullYear() + '-' + 
                 String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(today.getDate()).padStart(2, '0');

console.log('Creating data for:', todayStr);

// Sample apps with realistic usage
const sampleData = [
  { name: 'VS Code', duration: 7200, productive: 1, hour: 9 },
  { name: 'Google Chrome', duration: 3600, productive: 0, hour: 11 },
  { name: 'Figma', duration: 5400, productive: 1, hour: 14 },
  { name: 'Slack', duration: 1800, productive: 0, hour: 16 },
  { name: 'Terminal', duration: 2700, productive: 1, hour: 10 },
];

const insert = db.prepare(`
  INSERT INTO app_usage (app_name, duration, is_productive, is_idle, timestamp)
  VALUES (?, ?, ?, ?, ?)
`);

sampleData.forEach((app, index) => {
  const timestamp = `${todayStr} ${String(app.hour).padStart(2, '0')}:00:00`;
  
  try {
    insert.run(app.name, app.duration, app.productive, 0, timestamp);
    console.log(`  Added: ${app.name} for ${Math.floor(app.duration/60)}m at ${timestamp}`);
  } catch (err) {
    console.error(`Error inserting ${app.name}:`, err.message);
  }
});

// Verify data was created
const count = db.prepare('SELECT COUNT(*) as count FROM app_usage WHERE date(timestamp) = ?').get(todayStr);
console.log(`\nTotal records for today: ${count.count}`);

// Test the stats function
const { getTodayProductivityStats } = require('./services/statsService.js');
const stats = getTodayProductivityStats(todayStr, 'single');
console.log('Stats result:', stats);

db.close();
console.log('\n=== FIX COMPLETE ===');
