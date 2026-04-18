const activeWindow = require('active-win');
const db = require('./db/database.js');

async function testTracker() {
  console.log('=== TESTING APP TRACKER ===');
  
  try {
    // Test 1: Check if active-win can find windows
    const windows = await activeWindow.getOpenWindows();
    console.log('Active windows found:', windows);
    console.log('Windows length:', windows.length);
    
    if (windows.length > 0) {
      windows.forEach((win, i) => {
        console.log(`Window ${i + 1}:`, {
          name: win.owner?.name || 'Unknown',
          title: win.title || 'No title',
          visible: win.visible
        });
      });
    } else {
      console.log('NO ACTIVE WINDOWS FOUND');
    }
    
    // Test 2: Check database directly
    const count = db.prepare('SELECT COUNT(*) as count FROM app_usage').get();
    console.log('Database records count:', count.count);
    
    // Test 3: Check recent records
    const recent = db.prepare('SELECT app_name, timestamp, duration FROM app_usage ORDER BY timestamp DESC LIMIT 3').all();
    console.log('Recent records:', recent);
    
    // Test 4: Manually insert test data
    const testInsert = db.prepare('INSERT INTO app_usage (app_name, window_title, domain, duration, is_productive, is_idle, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const now = new Date().toISOString();
    testInsert.run('Test App', 'Test Window', 'test.com', 60, 1, now);
    
    console.log('Inserted test record');
    
    // Test 5: Query back the test data
    const testQuery = db.prepare('SELECT * FROM app_usage WHERE app_name = ? ORDER BY timestamp DESC LIMIT 1').get('Test App');
    console.log('Test record retrieved:', testQuery);
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    db.close();
  }
}

testTracker();
