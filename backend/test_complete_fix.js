// Complete test of the fixed analytics system
console.log("=== Complete Analytics Fix Test ===");

try {
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const dbPath = path.join(__dirname, 'data', 'timeboard.db');
  const db = new Database(dbPath);
  
  // Import the fixed services
  const { getTodayProductivityStats } = require('./services/statsService.js');
  const { 
    getAppBreakdown, 
    getTopDistractions, 
    getTimeDistribution, 
    getFocusSessions 
  } = require('./services/analyticsService.js');
  
  // Test dates
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.getFullYear() + '-' + 
                  String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(today.getDate()).padStart(2, '0');
  
  const yesterdayStr = yesterday.getFullYear() + '-' + 
                     String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(yesterday.getDate()).padStart(2, '0');
  
  console.log(`Testing dates: Today=${todayStr}, Yesterday=${yesterdayStr}`);
  
  // Test Today (single mode)
  console.log('\n=== Testing Today (single mode) ===');
  const todayStats = getTodayProductivityStats(todayStr, 'single');
  console.log('Today stats:', todayStats);
  
  const todayBreakdown = getAppBreakdown(todayStr, 'single');
  console.log('Today breakdown count:', todayBreakdown.length);
  
  // Test Yesterday (single mode)
  console.log('\n=== Testing Yesterday (single mode) ===');
  const yesterdayStats = getTodayProductivityStats(yesterdayStr, 'single');
  console.log('Yesterday stats:', yesterdayStats);
  
  const yesterdayBreakdown = getAppBreakdown(yesterdayStr, 'single');
  console.log('Yesterday breakdown count:', yesterdayBreakdown.length);
  
  // Test Last 7 days (range mode)
  console.log('\n=== Testing Last 7 days (range mode) ===');
  const weekStats = getTodayProductivityStats(yesterdayStr, 'range');
  console.log('Week stats:', weekStats);
  
  const weekBreakdown = getAppBreakdown(yesterdayStr, 'range');
  console.log('Week breakdown count:', weekBreakdown.length);
  
  // Check if data exists in database
  console.log('\n=== Database Data Check ===');
  const yesterdayCount = db.prepare(`
    SELECT COUNT(*) as count FROM app_usage 
    WHERE date(timestamp) = ?
  `).get(yesterdayStr);
  
  console.log(`Records for yesterday (${yesterdayStr}):`, yesterdayCount.count);
  
  if (yesterdayCount.count === 0) {
    console.log('⚠️  No data exists for yesterday - creating sample data...');
    
    // Create sample data for testing
    const insert = db.prepare(`
      INSERT INTO app_usage (app_name, duration, is_productive, is_idle, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const sampleData = [
      ['VS Code', 3600, 1, 0, `${yesterdayStr} 09:00:00`],
      ['Google Chrome', 1800, 0, 0, `${yesterdayStr} 10:00:00`],
      ['Figma', 2400, 1, 0, `${yesterdayStr} 14:00:00`],
      ['Slack', 1200, 0, 0, `${yesterdayStr} 16:00:00`],
    ];
    
    sampleData.forEach(row => {
      try {
        insert.run(...row);
        console.log(`  Created: ${row[0]} for ${row[4]}`);
      } catch (err) {
        console.error(`Error creating ${row[0]}:`, err.message);
      }
    });
    
    // Test again after creating data
    console.log('\n=== Testing After Creating Data ===');
    const newYesterdayStats = getTodayProductivityStats(yesterdayStr, 'single');
    console.log('New yesterday stats:', newYesterdayStats);
  }
  
  db.close();
  console.log('\n=== Test Complete ===');
  
} catch (error) {
  console.error('Test error:', error.message);
  console.error('Stack:', error.stack);
}
