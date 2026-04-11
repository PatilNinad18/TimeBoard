import db from "./db/database.js";

console.log("🔍 Checking database state...");

try {
  const count = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
  console.log(`📊 Total records in app_usage: ${count.count}`);
  
  if (count.count > 0) {
    const rows = db.prepare("SELECT app_name, timestamp FROM app_usage ORDER BY timestamp DESC LIMIT 5").all();
    console.log("📝 Last 5 records:");
    rows.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.app_name} at ${row.timestamp}`);
    });
  } else {
    console.log("✅ Database is empty - ready for fresh tracking!");
  }
  
} catch (error) {
  console.error("❌ Error:", error);
}

process.exit(0);
