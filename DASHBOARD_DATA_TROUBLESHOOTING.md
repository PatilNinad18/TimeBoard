# Dashboard Data Missing - Troubleshooting Guide

## **Problem**
The user reports that dashboard data is still missing even after multiple fixes.

---

## **Debug Steps Added**

### **1. Backend Debug Logging**
Added comprehensive logging to trace data flow:

#### **Data Aggregator (`dataAggregator.js`):**
```javascript
console.log(`[DataAggregator] Getting usage for: ${today}`);
console.log(`[DataAggregator] Productive apps:`, productiveApps);
console.log(`[DataAggregator] Found ${rows.length} records`);
console.log(`[DataAggregator] Raw rows:`, rows);
console.log(`[DataAggregator] Final result:`, result);
```

#### **Dashboard (`Dashboard.jsx`):**
```javascript
console.log('[Dashboard] Starting data load...');
console.log('[Dashboard] Stats data received:', statsData);
console.log('[Dashboard] Usage data received:', usageData);
console.log('[Dashboard] Processed apps:', processedApps);
console.log('[Dashboard] Data load completed');
```

---

## **How to Debug**

### **Step 1: Check Backend Console**
1. **Open terminal** in the TimeBoard backend directory
2. **Run the application**: `npm start`
3. **Watch console output** for debug messages
4. **Look for**:
   - `[DataAggregator]` messages
   - `[Dashboard]` messages (in browser console)
   - Any error messages

### **Step 2: Check Browser Console**
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Refresh the dashboard**
4. **Look for**:
   - `[Dashboard] Starting data load...`
   - `[Dashboard] Stats data received:`
   - `[Dashboard] Usage data received:`
   - Any JavaScript errors

### **Step 3: Verify Database Data**
Check if database actually contains data:
```javascript
// In backend terminal
node -e "
import('./db/database.js').then(db => {
  const count = db.prepare('SELECT COUNT(*) as count FROM app_usage').get();
  console.log('Total records:', count.count);
  
  const recent = db.prepare('SELECT app_name, timestamp, duration FROM app_usage ORDER BY timestamp DESC LIMIT 3').all();
  console.log('Recent:', recent);
}).catch(console.error);
"
```

---

## **Possible Issues & Solutions**

### **Issue 1: No Data in Database**
**Symptoms:**
- Console shows "Found 0 records"
- Dashboard shows all zeros

**Solutions:**
1. **Check app tracker** is running and collecting data
2. **Verify app tracker** is inserting data into database
3. **Check database permissions** and file access

### **Issue 2: Date Mismatch**
**Symptoms:**
- Data exists but "Found 0 records for today"
- Dashboard shows old data

**Solutions:**
1. **Check system date** is correct
2. **Verify timestamp format** in database
3. **Check timezone handling** in queries

### **Issue 3: API Connection Issues**
**Symptoms:**
- Console shows "Starting data load..." but no data received
- Network errors in browser console

**Solutions:**
1. **Check Electron app** is running properly
2. **Verify IPC handlers** are registered
3. **Check preload script** is working

### **Issue 4: Frontend Rendering Issues**
**Symptoms:**
- Data received but not displayed
- Components show empty states

**Solutions:**
1. **Check React state** is updating properly
2. **Verify component props** are passed correctly
3. **Check CSS display** properties (visibility, display)

---

## **Quick Tests**

### **Test 1: Manual API Call**
Open browser console and run:
```javascript
// Test API directly
window.api.getTodayProductivityStats().then(data => {
  console.log('Manual stats test:', data);
});
window.api.getUsage().then(data => {
  console.log('Manual usage test:', data);
});
```

### **Test 2: Database Direct Query**
```sql
-- Check today's data directly
SELECT app_name, duration, timestamp 
FROM app_usage 
WHERE date(timestamp) = date('now', 'localtime') 
ORDER BY timestamp DESC 
LIMIT 5;
```

### **Test 3: Check Productive Apps Table**
```sql
-- Check if productive apps are set
SELECT * FROM user_productive_apps;
```

---

## **Expected Debug Output**

### **Working System Should Show:**
```
[DataAggregator] Getting usage for: 2026-04-17
[DataAggregator] Productive apps: ["VS Code", "Terminal"]
[DataAggregator] Found 5 records
[DataAggregator] Raw rows: [{app_name: "Chrome", total_time: 3600}, ...]
[DataAggregator] Final result: [{app: "Chrome", totalSeconds: 3600, minutes: 60, category: "Distracting"}, ...]

[Dashboard] Starting data load...
[Dashboard] Stats data received: {productive: 7200, distracting: 3600, idle: 1800, score: 57}
[Dashboard] Usage data received: [{app: "Chrome", totalSeconds: 3600, minutes: 60, category: "Distracting"}, ...]
[Dashboard] Processed apps: [{app: "Chrome", totalSeconds: 3600, minutes: 60, category: "Distracting"}, ...]
[Dashboard] Data load completed
```

---

## **Next Steps**

### **If Debug Shows Issues:**
1. **No data found** → Check app tracker is working
2. **Date issues** → Fix timezone/date handling
3. **API errors** → Check IPC communication
4. **Rendering issues** → Check React components

### **If Debug Shows Data:**
1. **Data exists** but not displaying → Check frontend rendering
2. **Data received** but components empty → Check component props
3. **State updates** but UI doesn't change → Check React re-renders

---

## **Status: Debug Mode Active**

**Comprehensive logging added** to trace data flow
**Backend and frontend** debug points active
**Database verification** steps provided
**API testing** procedures documented

Run the application and check the console output to identify where the data flow is breaking!

---

*Last Updated: April 2026*  
*Version: 1.0.0*  
*Status: Debugging Active*
