// Quick test without database imports
const fs = require('fs');
const path = require('path');

console.log("=== Quick Database Test ===");

try {
  const dbPath = path.join(__dirname, 'data', 'timeboard.db');
  console.log(`Database path: ${dbPath}`);
  console.log(`Database exists: ${fs.existsSync(dbPath)}`);
  
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`Database size: ${stats.size} bytes`);
  }
} catch (error) {
  console.error('Error checking database:', error);
}

// Test date formatting
const today = new Date();
console.log(`\nToday: ${today.toISOString()}`);
console.log(`Today formatted: ${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
console.log(`Yesterday: ${yesterday.toISOString()}`);
console.log(`Yesterday formatted: ${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`);

console.log("\n=== Test Complete ===");
