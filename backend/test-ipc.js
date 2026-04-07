// Test IPC handlers directly
const { getTodayUsage } = require('./services/dataAggregator.js');
const { getTodayProductivityStats } = require('./services/statsService.js');

console.log('Testing backend services directly...');

// Test dataAggregator
try {
  const usage = getTodayUsage();
  console.log('✅ getTodayUsage():', usage);
} catch (error) {
  console.error('❌ getTodayUsage failed:', error.message);
}

// Test statsService
try {
  const stats = getTodayProductivityStats();
  console.log('✅ getTodayProductivityStats():', stats);
} catch (error) {
  console.error('❌ getTodayProductivityStats failed:', error.message);
}
