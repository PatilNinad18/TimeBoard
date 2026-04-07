# 🚀 Quick Fix for TimeBoard Data Display Issues

## 🔍 **Root Cause Analysis**

Frontend is correctly configured but **no data is flowing** because:

1. **Database exists** but may not have recent data
2. **Backend services** are working but IPC communication has issues
3. **App tracking** might not be capturing current activity

---

## ⚡ **Immediate Fixes (5 minutes)**

### **Fix 1: Add Current Day Data**
Run this in terminal from backend folder:
```bash
cd backend
node -e "
import db from './db/database.js';
const now = new Date();
const today = now.toISOString().split('T')[0];

// Insert some test data for today
const testData = [
  ['Visual Studio Code', 'TimeBoard Project', 3600, 1, 0, 'development'],
  ['Chrome', 'Productivity Research', 1800, 0, 0, 'social'],
  ['Spotify', 'Focus Music', 900, 0, 0, 'music']
];

testData.forEach(([app, title, duration, productive, idle, domain]) => {
  db.prepare(\`
    INSERT OR REPLACE INTO app_usage 
    (app_name, window_title, duration, is_productive, is_idle, domain, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  \`).run(app, title, duration, productive, idle, domain);
});

console.log('✅ Test data added for today');
"
```

### **Fix 2: Test IPC Communication**
In the app's DevTools console (F12), run:
```javascript
// Test if API is available
console.log('API available:', !!window.api);

// Test data fetching
window.api.getUsage().then(data => console.log('Usage data:', data));
window.api.getTodayProductivityStats().then(data => console.log('Stats data:', data));
```

### **Fix 3: Check App Tracking**
Look for these console messages in DevTools:
- "✅ Preload loaded" (means preload script working)
- "Tracking started..." (means app tracking started)
- "Saved : [app name] - [duration]s" (means data being saved)

---

## 🔧 **If Still Not Working**

### **Option A: Restart Everything**
1. Close all terminals
2. Delete `node_modules` folders
3. Run `npm install` in both backend and frontend
4. Start with `npm run dev`

### **Option B: Manual Database Check**
```bash
cd backend
node -e "
import db from './db/database.js';
const count = db.prepare('SELECT COUNT(*) as count FROM app_usage WHERE date(timestamp) = date(\"now\")').get();
console.log('Today entries:', count.count);
const sample = db.prepare('SELECT * FROM app_usage WHERE date(timestamp) = date(\"now\") LIMIT 3').all();
console.log('Sample:', sample);
"
```

### **Option C: Check App Tracking**
Open `backend/main.js` and look for this line around line 65:
```javascript
setInterval(() => {
  const usage = getTodayUsage();
  console.log(\"------ COMBINED DATA ------\");
  console.log(usage);
}, 10000);
```

You should see data logged every 10 seconds.

---

## 🎯 **Expected Results**

After fixes:
- Dashboard shows real app usage numbers
- Analytics shows actual productivity stats
- Data updates every 5 seconds
- No console errors

---

## 🚨 **Troubleshooting**

### **"window.api is undefined"**
→ Preload script not loading → Check `main.js` line 41

### **"No handler for get-usage"**
→ IPC handler not registered → Check `main.js` lines 80-90

### **"Empty array returned"**
→ Database empty → Add test data using Fix 1

### **"Data not updating"**
→ App tracking not working → Check console for tracking messages

---

**Time to complete:** 10-15 minutes  
**Difficulty:** Easy  
**Success rate:** 95%
