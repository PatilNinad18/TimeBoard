import db from "./db/database.js";

console.log("=== Generating Sample Historical Data ===");

function generateSampleData() {
  const apps = [
    { name: "VS Code", productive: true },
    { name: "Google Chrome", productive: false },
    { name: "Figma", productive: true },
    { name: "Slack", productive: false },
    { name: "Terminal", productive: true }
  ];

  const today = new Date();
  
  // Generate data for the last 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    
    const dateStr = date.getFullYear() + "-" + 
                   String(date.getMonth() + 1).padStart(2, "0") + "-" + 
                   String(date.getDate()).padStart(2, "0");

    console.log(`Generating data for ${dateStr}`);

    // Generate 5-10 random sessions per day
    const sessionCount = Math.floor(Math.random() * 5) + 5;
    
    for (let i = 0; i < sessionCount; i++) {
      const app = apps[Math.floor(Math.random() * apps.length)];
      const hour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
      const minute = Math.floor(Math.random() * 60);
      const duration = Math.floor(Math.random() * 7200) + 300; // 5 min to 2 hours
      
      const timestamp = `${dateStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
      
      try {
        db.prepare(`
          INSERT INTO app_usage (app_name, duration, is_productive, is_idle, timestamp)
          VALUES (?, ?, ?, ?, ?)
        `).run(app.name, duration, app.productive ? 1 : 0, 0, timestamp);
        
        console.log(`  Added: ${app.name} for ${Math.floor(duration/60)}m ${duration%60}s at ${timestamp}`);
      } catch (error) {
        console.error(`Error inserting data:`, error);
      }
    }
  }
}

try {
  generateSampleData();
  console.log("\n=== Sample data generation complete ===");
} catch (error) {
  console.error("Error:", error);
}
