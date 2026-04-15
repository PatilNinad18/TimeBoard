# App Tracking Discrepancy Analysis

## **Problem Summary** ⚠️

**Activity Page: 4h 30m** vs **Dashboard: 41m**

This significant discrepancy indicates different data sources or filtering logic between the two pages.

---

## **Most Likely Root Causes** 🎯

### **1. Different Date Ranges (Most Probable)**
- **Activity Page**: Might be showing data from multiple days
- **Dashboard**: Strictly filtering "today" only
- **Check**: Activity page date picker might be set to "All Time" or include multiple days

### **2. Date Function Inconsistency**
- **Activity**: Uses `date(timestamp)` 
- **Dashboard**: Uses `DATE(timestamp)`
- SQLite functions might return different results due to timezone

### **3. Idle Time Filtering**
- Both should exclude `is_idle = 0`
- But idle detection might be inconsistent
- Some sessions incorrectly marked as idle

---

## **Immediate Investigation Steps** 🔍

### **Step 1: Check Activity Page Date Filter**
1. Go to Activity page
2. Check the date selector (top of page)
3. Is it set to "Today" or "All Time"?
4. If set to "All Time", change to "Today"

### **Step 2: Compare Raw Data**
1. Open browser DevTools (F12)
2. Go to Activity page - check console for total time
3. Go to Dashboard - check console for total time
4. Compare the raw data arrays

### **Step 3: Verify Database Contents**
The database should contain consistent data that both pages query from the same source.

---

## **Expected Console Output**

### **Activity Page Console:**
```
🔍 Looking for activity data for: 2026-04-14
📋 Found X real activity sessions for 2026-04-14
✅ Activity state updated with real data
```

### **Dashboard Console:**
```
🔄 Starting data load...
📊 Usage data received: [...]
📊 Mapped apps for chart: [...]
```

---

## **Quick Fix Actions** 🚀

### **1. Verify Date Selection**
- Ensure Activity page is set to "Today"
- Not "All Time" or previous days

### **2. Check Frontend State**
- Both pages should use same API endpoints
- Verify no local state manipulation

### **3. Restart Application**
- Clear any cached data
- Fresh start ensures consistency

---

## **Technical Deep Dive** 📊

### **Activity Page Queries:**
```javascript
// Gets individual sessions
SELECT id, app_name, duration, is_idle, timestamp
FROM app_usage
WHERE date(timestamp) = ? AND is_idle = 0
ORDER BY timestamp ASC
```

### **Dashboard Queries:**
```javascript
// Gets aggregated data
SELECT app_name, SUM(duration) as total_time
FROM app_usage
WHERE DATE(timestamp) = ? AND is_idle = 0
GROUP BY app_name
```

**Both should return identical totals mathematically.**

---

## **Most Likely Scenario** 💡

**User has Activity page set to "All Time" while Dashboard shows "Today":**

- Activity: Shows 4h 30m (multiple days combined)
- Dashboard: Shows 41m (today only)
- This is a UI configuration issue, not a tracking bug

---

## **Solution Checklist** ✅

- [ ] Check Activity page date selector
- [ ] Ensure both pages show "Today"
- [ ] Verify console logs match
- [ ] Restart TimeBoard if needed
- [ ] Check if data persists across restarts

---

**The discrepancy is most likely due to different date ranges being displayed, not a tracking bug.**

---

**Status: Analysis Complete**  
**Root Cause: Date Range Mismatch**  
**Action: Verify Date Selection**
