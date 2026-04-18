// Create sample data for yesterday if none exists
console.log("=== Creating Yesterday Data ===");

try {
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const dbPath = path.join(__dirname, 'data', 'timeboard.db');
  const db = new Database(dbPath);
  
  // Calculate yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.getFullYear() + '-' + 
                     String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(yesterday.getDate()).padStart(2, '0');
  
  console.log('Creating data for:', yesterdayStr);
  
  // Check if data exists for yesterday
  const existingCount = db.prepare(`
    SELECT COUNT(*) as count FROM app_usage 
    WHERE date(timestamp) = ?
  `).get(yesterdayStr);
  
  console.log(`Existing records for yesterday: ${existingCount.count}`);
  
  if (existingCount.count === 0) {
    // Create sample data for yesterday
    const sampleApps = [
      { name: 'VS Code', productive: 1 },
      { name: 'Google Chrome', productive: 0 },
      { name: 'Figma', productive: 1 },
      { name: 'Slack', productive: 0 },
      { name: 'Terminal', productive: 1 }
    ];
    
    const insert = db.prepare(`
      INSERT INTO app_usage (app_name, duration, is_productive, is_idle, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    let totalInserted = 0;
    
    sampleApps.forEach((app, index) => {
      // Create 2-3 sessions per app throughout the day
      const sessionCount = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < sessionCount; i++) {
        const hour = Math.floor(Math.random() * 16) + 6; // 6 AM to 10 PM
        const minute = Math.floor(Math.random() * 60);
        const duration = Math.floor(Math.random() * 3600) + 300; // 5 min to 1 hour
        
        const timestamp = `${yesterdayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
        
        try {
          insert.run(app.name, duration, app.productive, 0, timestamp);
          totalInserted++;
          console.log(`  Added: ${app.name} for ${Math.floor(duration/60)}m at ${timestamp}`);
        } catch (err) {
          console.error(`Error inserting ${app.name}:`, err.message);
        }
      }
    });
    
    console.log(`\nTotal records inserted: ${totalInserted}`);
  } else {
    console.log('Yesterday data already exists, skipping creation.');
  }
  
  db.close();
  console.log('\n=== Creation Complete ===');
  
} catch (error) {
  console.error('Error:', error.message);
}
