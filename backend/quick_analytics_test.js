// Quick test using the same imports as the services
console.log("=== Quick Analytics Test ===");

try {
  // Test the exact same way as services
  const db = require('./db/database.js');
  
  // Test yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.getFullYear() + '-' + 
                     String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(yesterday.getDate()).padStart(2, '0');
  
  console.log('Testing date:', yesterdayStr);
  
  // Direct SQL test
  console.log('\n=== Direct SQL Test ===');
  const result = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN is_productive=1 AND is_idle=0 THEN duration ELSE 0 END),0) as productive,
      COALESCE(SUM(CASE WHEN is_productive=0 AND is_idle=0 THEN duration ELSE 0 END),0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle=1 THEN duration ELSE 0 END),0) as idle
    FROM app_usage
    WHERE date(timestamp) = ?
  `).get(yesterdayStr);
  
  console.log('Direct SQL result:', result);
  
  // Test buildCond function from analyticsService
  console.log('\n=== Testing buildCond ===');
  
  // Simulate the buildCond function
  function buildCond(dateFilter, mode) {
    if (!dateFilter) {
      return { cond: `date(timestamp) = date('now','localtime')`, param: null };
    }
    if (mode === "single") {
      return { cond: `date(timestamp) = ?`, param: dateFilter };
    }
    return {
      cond: `date(timestamp) >= ? AND date(timestamp) <= date('now','localtime')`,
      param: dateFilter,
    };
  }
  
  const { cond, param } = buildCond(yesterdayStr, 'single');
  console.log('Condition:', cond);
  console.log('Parameter:', param);
  
  // Test with condition
  const testResult = db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN is_productive=1 AND is_idle=0 THEN duration ELSE 0 END),0) as productive,
      COALESCE(SUM(CASE WHEN is_productive=0 AND is_idle=0 THEN duration ELSE 0 END),0) as distracting,
      COALESCE(SUM(CASE WHEN is_idle=1 THEN duration ELSE 0 END),0) as idle
    FROM app_usage
    WHERE ${cond}
  `).get(param);
  
  console.log('Test result:', testResult);
  
  console.log('\n=== Test Complete ===');
  
} catch (error) {
  console.error('Test error:', error.message);
}
