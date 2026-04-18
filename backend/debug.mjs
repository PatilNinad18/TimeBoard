import db from './db/database.js';

console.log('\n=== Last 10 rows with timestamps ===');
db.prepare('SELECT app_name, timestamp, duration, is_productive FROM app_usage ORDER BY timestamp DESC LIMIT 10')
  .all()
  .forEach(r => console.log(r));

console.log('\n=== Distinct dates in DB ===');
db.prepare("SELECT DISTINCT date(timestamp) as d, COUNT(*) as c FROM app_usage GROUP BY date(timestamp) ORDER BY d DESC")
  .all()
  .forEach(r => console.log(r));

console.log('\n=== Today local date ===');
const now = new Date();
const local =
  now.getFullYear() + '-' +
  String(now.getMonth() + 1).padStart(2, '0') + '-' +
  String(now.getDate()).padStart(2, '0');

console.log('Local today:', local);

console.log('\n=== Yesterday query test ===');
const yest = new Date(now);
yest.setDate(yest.getDate() - 1);

const yestStr =
  yest.getFullYear() + '-' +
  String(yest.getMonth() + 1).padStart(2, '0') + '-' +
  String(yest.getDate()).padStart(2, '0');

console.log('Yesterday string:', yestStr);

const rows = db.prepare(
  "SELECT COUNT(*) as c FROM app_usage WHERE date(timestamp) = ?"
).get(yestStr);

console.log('Rows for yesterday:', rows.c);

console.log('\n=== Last 7 days query test ===');
const rows7 = db.prepare(
  "SELECT COUNT(*) as c, date(timestamp) as d FROM app_usage WHERE date(timestamp) >= ? GROUP BY d"
).all(yestStr);

console.log('Rows last 7 days:', rows7);