// Test analytics service functions directly
console.log("=== Testing Analytics Service Functions ===");

try {
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const dbPath = path.join(__dirname, 'data', 'timeboard.db');
  const db = new Database(dbPath);
  
  // Test yesterday's date
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.getFullYear() + '-' + 
                     String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(yesterday.getDate()).padStart(2, '0');
  
  console.log('Testing with date:', yesterdayStr);
  
  // Test statsService directly
  console.log('\n=== Testing statsService ===');
  const { getTodayProductivityStats } = require('./services/statsService.js');
  const stats = getTodayProductivityStats(yesterdayStr, 'single');
  console.log('Stats result:', stats);
  
  // Test analyticsService functions
  console.log('\n=== Testing analyticsService ===');
  const { 
    getAppBreakdown, 
    getTopDistractions, 
    getTimeDistribution, 
    getFocusSessions 
  } = require('./services/analyticsService.js');
  
  const breakdown = getAppBreakdown(yesterdayStr, 'single');
  console.log('Breakdown result:', breakdown);
  
  const distractions = getTopDistractions(yesterdayStr, 'single');
  console.log('Distractions result:', distractions);
  
  const distribution = getTimeDistribution(yesterdayStr, 'single');
  console.log('Distribution result:', distribution);
  
  const sessions = getFocusSessions(25, yesterdayStr, 'single');
  console.log('Sessions result:', sessions);
  
  db.close();
  console.log('\n=== Test Complete ===');
  
} catch (error) {
  console.error('Test error:', error.message);
  console.error('Stack:', error.stack);
}
