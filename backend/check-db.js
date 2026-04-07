const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../data/timeboard.db");
console.log("Database path:", dbPath);

try {
  const db = new Database(dbPath, { readonly: true });
  
  // Check if table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Tables:", tables.map(t => t.name));
  
  // Check if data exists
  const count = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
  console.log("App usage entries:", count.count);
  
  // Get sample data
  if (count.count > 0) {
    const sample = db.prepare("SELECT * FROM app_usage LIMIT 3").all();
    console.log("Sample data:", sample);
  }
  
  // Check today's data
  const today = db.prepare(`
    SELECT COUNT(*) as count FROM app_usage 
    WHERE date(timestamp) = date('now')
  `).get();
  console.log("Today's entries:", today.count);
  
  db.close();
} catch (error) {
  console.error("Database error:", error.message);
}
