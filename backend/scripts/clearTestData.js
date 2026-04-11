import db from "../db/database.js";

console.log("🗑️ Clearing old test data from app_usage table...");

try {
  // Clear all existing data to start fresh
  const result = db.prepare("DELETE FROM app_usage").run();
  console.log(`✅ Deleted ${result.changes} old records from app_usage table`);
  
  // Verify the table is empty
  const count = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
  console.log(`📊 Records remaining: ${count.count}`);
  
  console.log("✅ Test data cleared successfully. Ready for real tracking!");
  
} catch (error) {
  console.error("❌ Error clearing test data:", error);
}

process.exit(0);
