@echo off
cd /d "s:\FullStack\TimeBoard\backend"
echo Creating sample data for today...
node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/timeboard.db');
const today = new Date();
const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
console.log('Creating data for:', todayStr);
const insert = db.prepare('INSERT INTO app_usage (app_name, duration, is_productive, is_idle, timestamp) VALUES (?, ?, ?, ?, ?)');
const sampleData = [
  ['VS Code', 7200, 1, 0, todayStr + ' 09:00:00'],
  ['Google Chrome', 3600, 0, 0, todayStr + ' 11:00:00'],
  ['Figma', 5400, 1, 0, todayStr + ' 14:00:00'],
  ['Slack', 1800, 0, 0, todayStr + ' 16:00:00']
];
sampleData.forEach(row => {
  try {
    insert.run(...row);
    console.log('Added:', row[0]);
  } catch(e) {
    console.log('Error:', e.message);
  }
});
const count = db.prepare('SELECT COUNT(*) as count FROM app_usage WHERE date(timestamp) = ?').get(todayStr);
console.log('Total records today:', count.count);
db.close();
console.log('Done!');
"
pause
