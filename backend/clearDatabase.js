import db from "./db/database.js";

console.log("🗑️ Clearing all old data...");

try {
  const result = db.prepare("DELETE FROM app_usage").run();
  console.log(`✅ Deleted ${result.changes} old records`);
  
  const count = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
  console.log(`📊 Records remaining: ${count.count}`);
  
} catch (error) {
  console.error("❌ Error:", error);
}

process.exit(0);
