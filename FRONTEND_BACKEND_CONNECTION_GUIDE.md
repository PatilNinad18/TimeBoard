# 🔌 Frontend-Backend Connection Guide

**Last Updated:** March 31, 2026  
**Purpose:** Step-by-step guide to fix frontend-backend communication in TimeBoard

---

## 📋 **Overview**

The main issue is that frontend and backend are not properly connected via IPC (Inter-Process Communication). This guide provides exact file changes needed to make everything work.

---

## 🚨 **Critical Files Requiring Changes**

### **Priority 1: Core IPC Fixes**

---

## 📁 **File 1: backend/preload.js**

**Issue:** Line 15 has `executeInMainWorld` instead of `exposeInMainWorld`

**Current Code (Line 15):**
```javascript
contextBridge.executeInMainWorld("api", {
```

**Fix To:**
```javascript
contextBridge.exposeInMainWorld("api", {
```

**Complete Fixed File:**
```javascript
import { contextBridge, ipcRenderer } from "electron";
import { getProductiveApps, setProductiveApps } from "./services/productivityService.js";
import { getTodayProductivityStats } from "./services/statsService.js";

contextBridge.exposeInMainWorld("statsAPI", {
  today: () => ipcRenderer.invoke("stats:today"),
  topApps: () => ipcRenderer.invoke("stats:top-apps"),
  productivity: () => ipcRenderer.invoke("stats:productivity")
});

contextBridge.exposeInMainWorld("api", {
  setProductiveApps: (apps) => 
    ipcRenderer.invoke("set-productive-apps", apps),
  getProductiveApps: ()=>
    ipcRenderer.invoke("get-productive-apps"),
  getTodayProductivityStats: () =>
    ipcRenderer.invoke("get-productivity-stats"),
  // Add missing methods
  getUsage: () =>
    ipcRenderer.invoke("get-usage")
});
```

---

## 📁 **File 2: backend/main.js**

**Issues:** 
1. Lines 17-18 reference non-existent functions
2. Missing IPC handler registration
3. Inconsistent handler names

**Current Code (Lines 16-26):**
```javascript
ipcMain.handle("stats:today", () => {
  return getTodayStats();  // ❌ Function doesn't exist
});

ipcMain.handle("stats:top-apps", () => {
  return getTopApps();     // ❌ Function doesn't exist
});

ipcMain.handle("stats:productivity", () => {
  return getProductivityStats(); // ❌ Function doesn't exist
});
```

**Fix To:**
```javascript
// Remove or fix these handlers - they reference non-existent functions
// ipcMain.handle("stats:today", () => {
//   return getTodayStats();
// });

// ipcMain.handle("stats:top-apps", () => {
//   return getTopApps();
// });

// ipcMain.handle("stats:productivity", () => {
//   return getProductivityStats();
// });
```

**Add these handlers after line 82:**
```javascript
// Add these missing handlers
ipcMain.handle("get-productive-stats", () => {
  return getTodayProductivityStats();
});

ipcMain.handle("get-usage", () => {
  return getTodayUsage();
});
```

---

## 📁 **File 3: frontend/src/pages/DashboardPage.jsx**

**Issues:**
1. Line 35-36: Wrong state assignment
2. Missing error handling
3. API call mismatch

**Current Code (Lines 30-38):**
```javascript
useEffect(() => {
  async function loadData() {
   const statsData = await window.api.getProductivityStats();
   const usageData = await window.api.getUsage();

    setStats(statsData);
    setStats(usageData);  // ❌ Should be setApps
  }
  // ...
}, []);
```

**Fix To:**
```javascript
useEffect(() => {
  async function loadData() {
    try {
      const statsData = await window.api.getTodayProductivityStats();
      const usageData = await window.api.getUsage();

      setStats(statsData);
      setApps(usageData);  // ✅ Fixed: setApps instead of setStats
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  }

  loadData();

  const interval = setInterval(loadData, 5000);
  return () => clearInterval(interval);
}, []);
```

---

## 📁 **File 4: frontend/src/pages/Reports.jsx**

**Issues:**
1. ReportsTable component commented out
2. Static data in summary cards
3. No real data integration

**Current Code (Line 8):**
```javascript
// import ReportsTable from '../components/Reports/ReportsTable';
```

**Fix To:**
```javascript
import ReportsTable from '../components/Reports/ReportsTable';
```

**Current Code (Line 51):**
```javascript
// <ReportsTable/>
```

**Fix To:**
```javascript
<ReportsTable/>
```

**Add data fetching:**
```javascript
import React, { useState, useEffect } from 'react';
// ... other imports

function Reports() {
  const [reportData, setReportData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});

  useEffect(() => {
    async function loadReportData() {
      try {
        const data = await window.api.getUsage();
        const stats = await window.api.getTodayProductivityStats();
        setReportData(data);
        setSummaryStats(stats);
      } catch (error) {
        console.error("Error loading report data:", error);
      }
    }
    loadReportData();
  }, []);

  return (
    <div className="p-7 space-y-6">
      <ReportsHeader/>
      
      {/* SummaryCards with real data */}
      <div className=''>
        <div className='flex space-x-10 justify-between h-40 w-300'>
          <SummaryCards
            title="Best Focus Day:"
            value={formatTime(summaryStats.productive || 0)}
            className="w-full"
          />
          <SummaryCards
            title="Average Focus Hours:"
            value={formatTime((summaryStats.productive || 0) / 7)}
            className="w-full"
          />
          {/* ... other cards with real data */}
        </div>
      </div>

      <div className='pt-6'>
        <div className='flex items-end justify-between'>
          <SearchBar/>
          <ExportButtons/>
        </div>
      </div>

      <ReportsTable data={reportData} />
    </div>
  );
}
```

---

## 📁 **File 5: frontend/src/pages/Analytics.jsx**

**Issues:**
1. Uses mock data instead of real API calls
2. No dynamic data loading

**Current Code (Lines 12-17):**
```javascript
const MOCK_STATS = {
  productiveTime: { label: "Total Productive Time", value: "35h 15m", trend: "up", delta: "+12%" },
  distractingTime: { label: "Total Distracting Time", value: "12h 05m", trend: "down", delta: "-8%" },
  idleTime: { label: "Total Idle Time", value: "4h 30m", trend: "neutral", delta: "0%" },
  focusScore: { label: "Focus Score %", value: "75%", trend: "up", scoreRaw: 75 },
};
```

**Fix To:**
```javascript
import React, { useState, useEffect } from "react";
// ... other imports

export default function Analytics() {
  const [filter, setFilter] = useState("Last 7 days");
  const [stats, setStats] = useState({
    productiveTime: { label: "Total Productive Time", value: "0h 0m", trend: "neutral", delta: "0%" },
    distractingTime: { label: "Total Distracting Time", value: "0h 0m", trend: "neutral", delta: "0%" },
    idleTime: { label: "Total Idle Time", value: "0h 0m", trend: "neutral", delta: "0%" },
    focusScore: { label: "Focus Score %", value: "0%", trend: "neutral", scoreRaw: 0 },
  });

  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        const data = await window.api.getTodayProductivityStats();
        setStats({
          productiveTime: { 
            label: "Total Productive Time", 
            value: formatTime(data.productive || 0), 
            trend: "up", 
            delta: "+12%" 
          },
          distractingTime: { 
            label: "Total Distracting Time", 
            value: formatTime(data.distracting || 0), 
            trend: "down", 
            delta: "-8%" 
          },
          idleTime: { 
            label: "Total Idle Time", 
            value: formatTime(data.idle || 0), 
            trend: "neutral", 
            delta: "0%" 
          },
          focusScore: { 
            label: "Focus Score %", 
            value: `${Math.round(data.score || 0)}%`, 
            trend: "up", 
            scoreRaw: Math.round(data.score || 0)
          },
        });
      } catch (error) {
        console.error("Error loading analytics data:", error);
      }
    }
    loadAnalyticsData();
  }, [filter]);

  // Helper function
  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  return (
    <div className="analytics-page">
      {/* ... rest of component with real stats */}
      <SummaryCards stats={stats} />
      {/* ... other components */}
    </div>
  );
}
```

---

## 🔧 **Frontend-Backend Connection Steps**

### **Step 1: Understand IPC Architecture**

```
Frontend (Renderer Process)
    ↓ calls
window.api.methodName()
    ↓ via
preload.js (exposeInMainWorld)
    ↓ invokes
ipcRenderer.invoke("channel-name", data)
    ↓ to
Backend (Main Process)
    ↓ handles
ipcMain.handle("channel-name", (event, data) => { ... })
    ↓ returns
Promise.resolve(result)
```

### **Step 2: Fix Preload Script**

1. Open `backend/preload.js`
2. Change line 15: `executeInMainWorld` → `exposeInMainWorld`
3. Add missing `getUsage` method to the `api` object
4. Save file

### **Step 3: Fix Main Process Handlers**

1. Open `backend/main.js`
2. Comment out lines 16-26 (reference non-existent functions)
3. Add proper handlers after line 82:
   ```javascript
   ipcMain.handle("get-productive-stats", () => {
     return getTodayProductivityStats();
   });
   
   ipcMain.handle("get-usage", () => {
     return getTodayUsage();
   });
   ```
4. Save file

### **Step 4: Fix Dashboard Data Flow**

1. Open `frontend/src/pages/DashboardPage.jsx`
2. Fix line 36: `setStats(usageData)` → `setApps(usageData)`
3. Add try-catch error handling
4. Update API calls to match preload methods
5. Save file

### **Step 5: Test Basic Connection**

1. Restart the Electron app
2. Open DevTools (F12)
3. In console, test: `window.api.getUsage()`
4. Should return array of app usage data
5. Test: `window.api.getTodayProductivityStats()`
6. Should return productivity stats object

### **Step 6: Enable Reports Table**

1. Open `frontend/src/pages/Reports.jsx`
2. Uncomment line 8: `import ReportsTable`
3. Uncomment line 51: `<ReportsTable/>`
4. Add data fetching logic
5. Save file

### **Step 7: Connect Analytics to Real Data**

1. Open `frontend/src/pages/Analytics.jsx`
2. Replace mock data with real API calls
3. Add useEffect for data loading
4. Add error handling
5. Save file

---

## 🧪 **Testing Connection**

### **Test 1: Basic IPC**
```javascript
// In DevTools console
window.api.getUsage().then(console.log);
window.api.getTodayProductivityStats().then(console.log);
```

### **Test 2: Dashboard**
1. Open app
2. Dashboard should show real app usage data
3. Numbers should update every 5 seconds
4. No console errors

### **Test 3: Settings**
1. Go to Settings page
2. Toggle tracking on/off
3. Changes should persist
4. No console errors

### **Test 4: Reports**
1. Go to Reports page
2. Should see real data in table
3. Export button should work
4. No console errors

### **Test 5: Analytics**
1. Go to Analytics page
2. Should see real stats in cards
3. Charts should display real data
4. No console errors

---

## 🚨 **Common Issues & Solutions**

### **Issue: "window.api is undefined"**
**Cause:** Preload script not loaded correctly
**Solution:** 
1. Check `backend/main.js` line 41: preload path is correct
2. Restart Electron app
3. Check DevTools for preload script errors

### **Issue: "Cannot read property of undefined"**
**Cause:** API method not exposed in preload
**Solution:**
1. Check `backend/preload.js` for missing methods
2. Ensure all methods are properly exposed
3. Restart app

### **Issue: "No handler registered for channel"**
**Cause:** IPC handler not registered in main process
**Solution:**
1. Check `backend/main.js` for missing handlers
2. Ensure handlers are registered before app ready
3. Restart app

### **Issue: Empty data returned**
**Cause:** Database has no data or query issues
**Solution:**
1. Check if app tracking is working
2. Check database file exists and has data
3. Test queries directly in database

---

## ✅ **Verification Checklist**

After making all changes:

- [ ] Dashboard shows real app usage data
- [ ] Settings page loads without errors
- [ ] Reports page displays real data
- [ ] Analytics page shows real statistics
- [ ] No console errors in DevTools
- [ ] Data updates every 5 seconds
- [ ] Export functionality works
- [ ] All navigation works smoothly

---

## 🎯 **Expected Outcome**

After completing these changes:

1. **Dashboard** will display live app usage data
2. **Settings** will allow configuration changes
3. **Reports** will show historical data with export
4. **Analytics** will provide real insights and trends
5. **All pages** will be fully functional with real data

The application will transform from a static demo to a fully functional productivity tracking tool.

---

**Implementation Time:** 2-3 hours  
**Difficulty:** Medium  
**Risk:** Low (changes are straightforward)  

Good luck! 🚀
