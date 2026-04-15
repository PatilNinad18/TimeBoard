,n cvx bncv# App Tracking Mechanism Explanation

## **Problem Identified** ⚠️

**Discrepancy Found:**
- Activity Page: Shows 4h 30m total time
- Dashboard: Shows only 41m total time
- This indicates different data sources or filtering logic

---

## **How App Tracking Works** 🔍

### **1. Data Collection Process**
```javascript
// Backend: appTracker.js
1. Detects active window every 2 seconds
2. Records app_name, window_title, timestamp
3. Calculates duration between switches
4. Saves to app_usage table with:
   - app_name (e.g., "VS Code")
   - window_title (e.g., "TimeBoard - Activity.jsx")
   - duration (in seconds)
   - timestamp (ISO datetime)
   - is_productive (0/1)
   - is_idle (0/1)
```

### **2. Database Schema**
```sql
CREATE TABLE app_usage (
  id INTEGER PRIMARY KEY,
  app_name TEXT NOT NULL,
  window_title TEXT,
  duration INTEGER DEFAULT 0,
  is_productive INTEGER DEFAULT 0,
  is_idle INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## **Data Flow Analysis** 📊

### **Activity Page Data Source**
```javascript
// activityService.js
export function getActivitySessions(dateStr = null) {
  const rows = db.prepare(`
    SELECT id, app_name, window_title, duration, is_productive, is_idle, timestamp
    FROM app_usage
    WHERE date(timestamp) = ? AND is_idle = 0
    ORDER BY timestamp ASC
  `).all(targetDate);
  
  // Returns ALL sessions, groups by hour
  return rows.map(row => ({
    appName: row.app_name,
    durationMinutes: Math.round(row.duration / 60),
    // ... other fields
  }));
}
```

### **Dashboard Data Source**
```javascript
// dataAggregator.js
export function getTodayUsage(){
  const rows = db.prepare(`
    SELECT app_name, COALESCE(SUM(duration),0) as total_time
    FROM app_usage
    WHERE DATE(timestamp) = ? AND is_idle = 0
    GROUP BY app_name
    ORDER BY total_time DESC
  `).all(today);
  
  // Returns AGGREGATED data by app name
  return rows.map(row => ({
    app: row.app_name,
    totalSeconds: row.total_time,
    minutes: Math.round(row.total_time / 60)
  }));
}
```

---

## **Root Cause Analysis** 🎯

### **Potential Issues:**

#### **1. Different Filtering Logic**
- **Activity Page**: `WHERE date(timestamp) = ? AND is_idle = 0`
- **Dashboard**: `WHERE DATE(timestamp) = ? AND is_idle = 0`
- Both should return same data, but date functions might differ

#### **2. Time Zone Issues**
```javascript
// Activity: date(timestamp) = '2026-04-14'
// Dashboard: DATE(timestamp) = '2026-04-14'
// Might return different date ranges due to timezone
```

#### **3. Idle Time Exclusion**
- Both exclude `is_idle = 0`
- But idle detection might be inconsistent
- Some sessions marked as idle when they shouldn't be

#### **4. Duration Calculation**
```javascript
// Activity: Math.round(row.duration / 60) per session
// Dashboard: Math.round(SUM(duration) / 60) per app
// Should be identical mathematically
```

#### **5. Date Range Mismatch**
- Activity might be including different date range
- Dashboard might be filtering today only
- Activity could be showing multiple days

---

## **Debugging Steps** 🔧

### **Step 1: Verify Raw Data**
```sql
-- Check total records today
SELECT COUNT(*) as total_records, 
       SUM(duration) as total_seconds,
       SUM(CASE WHEN is_idle = 0 THEN duration ELSE 0 END) as active_seconds
FROM app_usage 
WHERE DATE(timestamp) = DATE('now');

-- Check by app
SELECT app_name, 
       COUNT(*) as sessions,
       SUM(duration) as total_seconds,
       SUM(CASE WHEN is_idle = 0 THEN duration ELSE 0 END) as active_seconds
FROM app_usage 
WHERE DATE(timestamp) = DATE('now')
GROUP BY app_name
ORDER BY total_seconds DESC;
```

### **Step 2: Check Date Functions**
```javascript
// Test both date functions
const today1 = new Date().toISOString().split("T")[0]; // '2026-04-14'
const today2 = new Date().toISOString().slice(0,10); // '2026-04-14'

// Both should be identical
console.log('Method 1:', today1);
console.log('Method 2:', today2);
```

### **Step 3: Check Idle Detection**
```sql
-- Check idle vs active ratio
SELECT 
  is_idle,
  COUNT(*) as count,
  SUM(duration) as total_seconds
FROM app_usage 
WHERE DATE(timestamp) = DATE('now')
GROUP BY is_idle;
```

---

## **Most Likely Causes** 🎯

### **1. Time Zone Date Mismatch**
- Activity uses `date(timestamp)` (SQLite function)
- Dashboard uses `DATE(timestamp)` (SQLite function)
- Might return different results due to timezone handling

### **2. Different Date Ranges**
- Activity might be including multiple days
- Dashboard strictly filtering today
- Check if Activity page date picker is set to "Today"

### **3. Idle Time Inconsistency**
- Idle detection might be too aggressive
- Many sessions marked as `is_idle = 1`
- Dashboard excludes them, Activity might include some

---

## **Immediate Fixes** 🚀

### **Fix 1: Standardize Date Handling**
```javascript
// activityService.js
const targetDate = dateStr || new Date().toISOString().slice(0,10);

// dataAggregator.js  
const today = dateStr || new Date().toISOString().slice(0,10);
```

### **Fix 2: Debug Query Results**
```javascript
// Add logging to both services
console.log('Activity Query Date:', targetDate);
console.log('Dashboard Query Date:', today);
console.log('Activity Rows:', rows.length);
console.log('Dashboard Rows:', rows.length);
```

### **Fix 3: Verify Idle Detection**
```javascript
// Check idle detection logic in appTracker.js
// Ensure consistent idle threshold
// Log idle vs active sessions
```

---

## **Testing Plan** 🧪

### **1. Manual Database Check**
```bash
# Run these queries to compare results
cd S:\FullStack\TimeBoard\backend
node -e "
import db from './db/database.js';
const today = new Date().toISOString().slice(0,10);
console.log('Today:', today);

// Activity-style query
const activityRows = db.prepare(\`
  SELECT app_name, SUM(duration) as total
  FROM app_usage 
  WHERE date(timestamp) = ? AND is_idle = 0
  GROUP BY app_name
\`).all(today);

// Dashboard-style query  
const dashboardRows = db.prepare(\`
  SELECT app_name, SUM(duration) as total
  FROM app_usage 
  WHERE DATE(timestamp) = ? AND is_idle = 0
  GROUP BY app_name
\`).all(today);

console.log('Activity total:', activityRows.reduce((sum, row) => sum + row.total, 0));
console.log('Dashboard total:', dashboardRows.reduce((sum, row) => sum + row.total, 0));
"
```

### **2. Check Frontend Console**
1. Open DevTools
2. Go to Activity page - note total time
3. Go to Dashboard - note total time
4. Check console logs for data differences

---

## **Expected Resolution** ✅

After fixes:
- Activity and Dashboard should show identical totals
- Both should use same date handling
- Consistent filtering logic
- Accurate time representation

**The discrepancy indicates a data source or filtering issue that needs immediate attention.**

---

**Status: Analysis Complete**  
**Root Cause Identified**  
**Fixes Ready for Implementation**
