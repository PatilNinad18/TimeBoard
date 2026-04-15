import db from "./db/database.js";

const today = new Date().toISOString().slice(0,10);
console.log('Today:', today);

// Activity-style query
const activityRows = db.prepare(`
  SELECT app_name, SUM(duration) as total
  FROM app_usage 
  WHERE date(timestamp) = ? AND is_idle = 0
  GROUP BY app_name
`).all(today);

// Dashboard-style query  
const dashboardRows = db.prepare(`
  SELECT app_name, SUM(duration) as total
  FROM app_usage 
  WHERE DATE(timestamp) = ? AND is_idle = 0
  GROUP BY app_name
`).all(today);

console.log('Activity records:', activityRows.length);
console.log('Dashboard records:', dashboardRows.length);
console.log('Activity total:', activityRows.reduce((sum, row) => sum + row.total, 0), 'seconds');
console.log('Dashboard total:', dashboardRows.reduce((sum, row) => sum + row.total, 0), 'seconds');

// Check all data in database
const allRows = db.prepare(`
  SELECT COUNT(*) as count, SUM(duration) as total_seconds
  FROM app_usage
`).get();

console.log('Total records in DB:', allRows.count);
console.log('Total duration in DB:', allRows.total_seconds, 'seconds');

// Check idle vs active
const idleCheck = db.prepare(`
  SELECT is_idle, COUNT(*) as count, SUM(duration) as total
  FROM app_usage
  GROUP BY is_idle
`).all();

console.log('Idle vs Active:', idleCheck);

process.exit(0);
