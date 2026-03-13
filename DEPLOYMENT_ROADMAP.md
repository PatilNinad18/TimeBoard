# 🎯 TimeBoard - 10 Day Deployment Roadmap

**Project:** TimeBoard (Windows App Usage Tracker)  
**Timeline:** March 5-14, 2026  
**Deployment Date:** March 15, 2026  
**Daily Commitment:** 4 hours/day  
**Team:** Solo Developer  

---

## 📊 Overview

This roadmap provides a realistic 10-day sprint to deploy a **Minimum Viable Product (MVP)** of TimeBoard. The app will track app usage, show real-time analytics, and allow users to customize their focus settings.

### ✅ What Will Be Delivered
- ✅ Real-time app usage tracking
- ✅ Live dashboard with actual data
- ✅ Settings page for customization
- ✅ Reports page with data export
- ✅ Basic Analytics page
- ✅ Deployable .exe file

### ⏭️ What's Deferred to v2.0
- ⏭️ Focus Mode with app blocking
- ⏭️ Advanced notifications
- ⏭️ Cloud sync/backup
- ⏭️ Email reports
- ⏭️ Dark mode

---

## 📅 Day-by-Day Breakdown

### **DAY 1-2: Database & App Tracking Setup** ⚙️
**Duration:** 8 hours total (2 days × 4 hrs)  
**Goal:** App tracking working end-to-end with data persisting to database

#### Day 1 - Part 1 (4 hours)
**Tasks:**
- [ ] Create `backend/db/database.js` file for database initialization
- [ ] Define database schema:
  - `app_usage` table: id, app_name, window_title, timestamp, duration_seconds, is_productive
  - `daily_stats` table: id, date, total_focus_time, total_distracting_time, productivity_score
  - `blocked_apps` table: id, app_name, category, user_created_at
  - `user_settings` table: id, setting_key, setting_value
- [ ] Initialize better-sqlite3 database
- [ ] Create database instance and test connection

**Files to Create:**
```
backend/
  ├── db/
  │   └── database.js
  └── main.js (update)
```

**Acceptance Criteria:**
- Database file created in `backend/data/timeboard.db`
- All tables created successfully
- No errors when running backend

---

#### Day 2 - Part 2 (4 hours)
**Tasks:**
- [ ] Create `backend/services/appTracker.js`
- [ ] Implement app detection using `active-win` library
  - Poll foreground window every 1 second
  - Extract app name and window title
- [ ] Implement data persistence
  - Batch database writes every 10 seconds
  - Calculate productivity score based on blocked apps list
- [ ] Create `backend/services/dataAggregator.js`
  - Calculate daily stats
  - Generate productivity metrics
- [ ] Test: Open multiple apps and verify entries in database

**Files to Create:**
```
backend/
  ├── services/
  │   ├── appTracker.js
  │   └── dataAggregator.js
  └── main.js (update with starter code)
```

**Acceptance Criteria:**
- App tracking starts when backend runs
- Database populates with real app data
- `daily_stats` table updates with accurate metrics
- No data loss on app restart

**Deliverable:** ✅ Database recording real app usage in real-time

---

### **DAY 3: Electron IPC Bridge** 🌉
**Duration:** 4 hours  
**Goal:** Frontend can request tracking data from backend via IPC

#### Tasks
- [ ] Create `backend/preload.js` (secure IPC setup)
  - Expose safe IPC functions to renderer process
  - Implement context isolation for security
- [ ] Add IPC handlers in `backend/main.js`:
  - `get-today-usage` → returns today's app usage from DB
  - `get-daily-stats` → returns productivity stats
  - `get-blocked-apps` → returns user's distraction list
  - `add-blocked-app` → saves new distracted app
  - `remove-blocked-app` → removes from blocked list
- [ ] Update electron configuration to use preload.js
- [ ] Test IPC communication using DevTools

**Files to Create/Update:**
```
backend/
  ├── preload.js (NEW)
  ├── main.js (update with IPC handlers)
  └── ipc-handlers/ (NEW)
      ├── usageHandlers.js
      └── settingsHandlers.js
```

**Acceptance Criteria:**
- Preload.js properly loads without errors
- Can call `window.electronAPI.getTodayUsage()` from DevTools console
- IPC returns data from database successfully
- No security warnings in DevTools

**Deliverable:** ✅ IPC communication working between main and renderer

---

### **DAY 4-5: Real Dashboard & Data Connection** 📊
**Duration:** 8 hours (2 days × 4 hrs)  
**Goal:** Dashboard showing REAL data instead of dummy data

#### Day 4 (4 hours)
**Tasks:**
- [ ] Update `frontend/src/pages/DashboardPage.jsx`
  - Remove dummy data imports
  - Add useEffect hook to fetch data on mount
  - Call IPC handlers to get real data
  - Parse response and update component state
- [ ] Update component state management:
  - Replace hardcoded summary card values
  - Replace hardcoded chart data
  - Replace hardcoded app usage list
- [ ] Test dashboard loads without errors
- [ ] Verify summary cards show correct numbers

**Update Files:**
```
frontend/src/
  ├── pages/DashboardPage.jsx (update)
  ├── hooks/
  │   └── useAppUsage.js (NEW - custom hook for IPC calls)
  └── utils/
      └── dataFormatters.js (NEW - format DB data for charts)
```

**Acceptance Criteria:**
- Dashboard loads without crashing
- Summary cards display real data (not "4h 20m" dummy data)
- Console shows no IPC errors
- Data updates when opening/closing apps

---

#### Day 5 (4 hours)
**Tasks:**
- [ ] Implement real-time updates using IPC listeners
  - Set up interval to refresh data every 30 seconds
  - Update all chart components with new data
  - Smooth transitions between data updates
- [ ] Test with multiple apps
  - Open VSCode, Chrome, Spotify simultaneously
  - Verify dashboard updates correctly
  - Check app usage list updates in real-time
- [ ] Optimize performance
  - Reduce unnecessary re-renders
  - Cache data appropriately

**Update Files:**
```
frontend/src/
  ├── hooks/useAppUsage.js (enhance with interval refresh)
  ├── components/Dashboard/ (update all components)
  └── App.jsx (if needed)
```

**Acceptance Criteria:**
- Dashboard updates every 30 seconds without manual refresh
- All charts reflect real-time data
- No memory leaks from interval listeners
- Smooth user experience

**Deliverable:** ✅ Dashboard shows live tracking data from database

---

### **DAY 6: Settings & Distraction Configuration** ⚙️
**Duration:** 4 hours  
**Goal:** Users can customize which apps are "distracting"

#### Tasks
- [ ] Complete `frontend/src/pages/Settings.jsx`
  - Add toggle: Enable/Disable tracking
  - Add form to add distracting apps
  - Add list of current blocked apps with delete buttons
  - Add daily focus goal input
  - Add save button
- [ ] Implement backend handlers for settings:
  - Save user settings to database
  - Update blocked apps list
  - Validate inputs
- [ ] Test persistence
  - Close and reopen app
  - Verify settings are saved
  - Verify blocked apps list persists

**Create/Update Files:**
```
frontend/src/
  ├── pages/Settings.jsx (complete implementation)
  └── components/Settings/
      ├── SettingsForm.jsx (NEW)
      ├── BlockedAppsList.jsx (NEW)
      └── GoalSetter.jsx (NEW)
```

**Acceptance Criteria:**
- Settings page is not a placeholder
- Can add/remove blocked apps
- Settings save to database
- App restarts with saved settings

**Deliverable:** ✅ Functional Settings page with data persistence

---

### **DAY 7: Reports Table & Data Export** 📋
**Duration:** 4 hours  
**Goal:** Users can view historical data and export

#### Tasks
- [ ] Fix `frontend/src/components/Reports/ReportsTable.jsx`
  - Replace placeholder with real table
  - Fetch historical data from database via IPC
  - Display columns: App Name, Time Spent, Date, Productivity Score
  - Format times nicely (e.g., "2h 30m")
- [ ] Implement date filtering
  - Dropdown: Last 7 days, Last 30 days, All Time
  - Query database with date ranges
  - Update table on filter change
- [ ] Implement CSV export
  - Add "Export as CSV" button
  - Use Node.js fs module to create CSV file
  - Save to Downloads folder
  - Show success message

**Create/Update Files:**
```
frontend/src/
  ├── pages/Reports.jsx (update)
  ├── components/Reports/
  │   ├── ReportsTable.jsx (complete)
  │   ├── DateFilter.jsx (NEW)
  │   └── ExportButtons.jsx (update)
backend/
  └── ipc-handlers/exportHandlers.js (NEW)
```

**Acceptance Criteria:**
- Reports table displays real historical data
- Date filter works correctly
- CSV export creates valid file
- File opens correctly in Excel/Google Sheets

**Deliverable:** ✅ Working Reports page with export functionality

---

### **DAY 8: Analytics Page & Polish** 📈
**Duration:** 4 hours  
**Goal:** Basic analytics and UI cleanup

#### Tasks
- [ ] Complete `frontend/src/pages/Analytics.jsx`
  - Top 5 productive apps (bar chart)
  - Productivity trend over time (line chart)
  - Daily focus hours this week (bar chart)
  - Weekly summary stats
- [ ] Fetch analytics data via new IPC handler:
  - `get-analytics-data` → returns computed metrics
- [ ] UI Polish
  - Check all pages for broken layouts
  - Verify text is readable
  - Ensure responsive design at 1200x800 minimum
  - Fix any color/styling inconsistencies
  - Check sidebar active state highlighting
- [ ] Test all navigation
  - Click through all pages
  - Verify no broken links
  - Check for console errors

**Create/Update Files:**
```
frontend/src/
  ├── pages/Analytics.jsx (complete)
  ├── components/Analytics/ (NEW)
  │   ├── TopAppsChart.jsx
  │   ├── ProductivityTrendChart.jsx
  │   └── WeeklyStatsCard.jsx
backend/
  └── ipc-handlers/analyticsHandlers.js (NEW)
```

**Acceptance Criteria:**
- Analytics page displays meaningful charts
- Data is calculated correctly
- All pages look polished
- No visual bugs or typos
- Sidebar navigation works smoothly

**Deliverable:** ✅ All pages functional with real data and polished UI

---

### **DAY 9: Testing & Bug Fixes** 🧪
**Duration:** 4 hours  
**Goal:** Stable, deployable application

#### Tasks
- [ ] **Functional Testing**
  - [ ] Open VSCode, Chrome, Discord, Spotify
  - [ ] Verify each app is tracked correctly
  - [ ] Check dashboard updates live
  - [ ] Leave app running for 5 mins, verify data accumulates
  - [ ] Test Settings: add/remove apps, verify changes apply
  - [ ] Generate and download CSV export
  - [ ] Close and restart app → verify data persists
- [ ] **Edge Case Testing**
  - [ ] What if no apps tracked yet? (show helpful message)
  - [ ] What if database is empty? (show "No data yet")
  - [ ] Time zone edge cases
  - [ ] Midnight transition (daily stat rollover)
- [ ] **Performance Testing**
  - [ ] App launches in < 3 seconds
  - [ ] Dashboard updates smoothly
  - [ ] No memory leaks (task manager check)
- [ ] **Critical Bug Fixes**
  - Record all bugs found
  - Fix only critical bugs (crashes, data loss)
  - Defer minor UI bugs to v2.0

**Testing Checklist:**
```
Application Stability
- [ ] App launches without errors
- [ ] No console errors in DevTools
- [ ] No uncaught exceptions
- [ ] Database doesn't get corrupted

Data Accuracy
- [ ] Tracked apps match what user opened
- [ ] Time calculations are correct
- [ ] Stats sum up correctly

UI/UX
- [ ] All pages load
- [ ] All buttons work
- [ ] No broken layouts
- [ ] Text is readable
```

**Acceptance Criteria:**
- No critical bugs remain
- App is stable for 30+ min continuous use
- All core features work as expected
- Ready for user deployment

**Deliverable:** ✅ Tested, stable application

---

### **DAY 10: Build & Packaging** 📦
**Duration:** 4 hours  
**Goal:** Ready to deploy as .exe

#### Tasks
- [ ] **Build Frontend**
  - [ ] Run `npm run build` in frontend folder
  - [ ] Verify no build errors
  - [ ] Check build output in `frontend/dist/`
- [ ] **Test Production Build**
  - [ ] Build Electron app locally
  - [ ] Test .exe creation
  - [ ] Launch .exe and verify it works
  - [ ] Test all features in production build
- [ ] **Database Initialization**
  - [ ] Verify database initializes on first run
  - [ ] Delete database and rerun → should recreate
- [ ] **Package Application**
  - [ ] Create `electron-builder` config (optional but recommended)
  - [ ] Or manually package as .exe
  - [ ] Create installer (if time permits)
- [ ] **Documentation**
  - [ ] Create `INSTALL.md` for deployment
  - [ ] Create `USER_GUIDE.md` for end users
  - [ ] Document system requirements (Windows 10+, 100MB free)
- [ ] **Final Checks**
  - [ ] .exe runs on clean system
  - [ ] No missing dependencies
  - [ ] Database file created automatically
  - [ ] All features work

**Update Files:**
```
Project Root/
  ├── INSTALL.md (NEW)
  ├── USER_GUIDE.md (NEW)
  ├── package.json (add build scripts if needed)
  └── backend/
      └── electron-builder.json (optional)
```

**Acceptance Criteria:**
- .exe file created successfully
- App launches and runs on clean Windows system
- All features accessible
- Database initialized automatically
- Documentation complete

**Deliverable:** ✅ .exe file ready to distribute

---

### **DAY 11: DEPLOYMENT WEEK** 🚀
**What Happens After Day 10:**
- [ ] Deploy application to users/testers
- [ ] Gather feedback
- [ ] Monitor for critical bugs
- [ ] Have v2.0 feature list ready

**Not Included in 10-Day Sprint:**
- ⏭️ Bug fixes during deployment
- ⏭️ User support
- ⏭️ Feature enhancements

---

## ⚡ Speed Optimization Tips

To complete this in 10 days at 4 hrs/day:

### 1. **Code Reuse**
- Copy/paste existing components rather than building from scratch
- Use dummy data patterns already in codebase
- Reuse chart configurations from ProductivityChart.jsx

### 2. **Disable Non-Critical Features**
- Skip animations/transitions (add post-launch)
- Minimal error handling (add robust handling in v2.0)
- Skip input validation where possible (add in v2.0)
- No email/notifications (deferred)

### 3. **Focus on Core Path**
- Track → Database → IPC → Dashboard
- Don't optimize prematurely
- Don't refactor existing code
- Don't add new libraries

### 4. **Testing Strategy**
- Test manually only, no automated tests
- Test happy path, not edge cases
- One browser window, one OS (Windows only)
- 30-second tests per feature

### 5. **Database Strategy**
- Simple schema (no complex relationships)
- No migrations
- Schemas stay the same throughout
- SQLite is sufficient

### 6. **Frontend Strategy**
- Use existing Tailwind setup, don't customize
- Use existing components where possible
- Copy/paste styling patterns
- Don't worry about CSS optimization

---

## 📋 Critical Path (Do These First if Behind)

If you fall behind schedule, prioritize in this exact order:

### Tier 1 (MUST COMPLETE)
- ✅ Days 1-2: Database + Tracking
- ✅ Day 3: IPC Bridge
- ✅ Days 4-5: Real Dashboard
- ✅ Day 10: Build & Deploy

**Reason:** These are non-negotiable for app to work

### Tier 2 (IMPORTANT)
- ✅ Day 6: Settings
- ✅ Day 7: Reports

**Reason:** Core features users expect, but can be simplified

### Tier 3 (NICE-TO-HAVE)
- ⏭️ Day 8: Analytics (can skip)
- ⏭️ Day 9: Full testing (do minimal testing)

**Reason:** Can be added in v2.0

**Decision Rule:** If 2 days behind by Day 7, skip Analytics (Day 8) and focus on stability.

---

## 🔧 Day 1 Immediate Actions

To start TODAY without wasting time:

1. **Create folder structure:**
   ```bash
   mkdir backend/db
   mkdir backend/services
   mkdir backend/ipc-handlers
   mkdir frontend/src/hooks
   mkdir frontend/src/utils
   ```

2. **Start with database.js boilerplate** (provided separately)

3. **Set up a development log:**
   - Create `PROGRESS.log` to track daily work
   - Write what you'll do before starting each session
   - Write what you completed at end of session

4. **Daily standup template:**
   ```
   [Day X] Date: March Y
   
   Today's Goal: [specific, measurable]
   
   Completed:
   - [ ] Task 1
   - [ ] Task 2
   
   Blockers:
   - [any issues]
   
   Tomorrow's Plan:
   - [ ] Task 1
   ```

---

## 📊 Progress Tracking Template

Copy/paste this into your project:

```markdown
# PROGRESS TRACKING

## Completed ✅
- [x] Database schema designed
- [ ] ...

## In Progress 🔄
- [ ] Currently working on...

## Blocked 🔴
- [ ] Waiting for...

## Next Up ⏭️
- [ ] Day X tasks...
```

---

## 🎯 Success Criteria on March 15

On Day 11, the app is considered **SUCCESSFULLY DEPLOYED** if:

✅ **Functional Requirements**
- Application launches without crashing
- App tracking captures real data
- Dashboard displays real usage data (not dummy)
- Settings can be changed and persist
- Reports can be generated and exported
- Data survives app restart

✅ **Non-Functional Requirements**
- App runs on Windows 10/11
- Startup time < 3 seconds
- No critical bugs
- Database initializes automatically
- Memory stable over 30 min usage

✅ **Deployment**
- .exe file created
- Distributable to users
- Installation instructions clear
- User guide complete

**NOT Required (Defer to v2.0):**
- Perfect UI/UX
- Advanced analytics
- App blocking/focus mode
- Cloud sync
- Email notifications
- Mobile app
- Dark mode

---

## ⚠️ Risk Mitigation

### High-Risk Areas
1. **IPC Communication** (Day 3)
   - Mitigation: Test with DevTools console first
   
2. **Database Queries** (Days 1-2)
   - Mitigation: Use simple queries, avoid complex joins
   
3. **Real-time Updates** (Day 5)
   - Mitigation: Start with 30sec refresh, optimize later

4. **CSV Export** (Day 7)
   - Mitigation: Use Node built-in fs module

### Fallback Plans
- If IPC breaks: Use file-based communication
- If chart libraries fail: Use simple data tables
- If database corrupts: Rebuild from SQL file
- If deadline slips: Deploy without Analytics page

---

## 📞 Quick Reference

### Key Dependencies Already Installed
```json
{
  "active-win": "^8.2.1",        // Get active window
  "better-sqlite3": "^12.4.1",   // Database
  "electron": "^38.2.2",         // Desktop app
  "recharts": "^3.3.0",          // Charts
  "react-router-dom": "^7.9.4",  // Navigation
  "zustand": "^5.0.8"            // State (optional)
}
```

### Key Files to Create
- `backend/db/database.js` - Database setup
- `backend/services/appTracker.js` - Tracking logic
- `backend/preload.js` - IPC security
- `backend/ipc-handlers/*.js` - IPC endpoints
- `frontend/src/hooks/useAppUsage.js` - Data fetching
- `frontend/src/utils/dataFormatters.js` - Data transformation

### IPC Functions to Implement
```javascript
// Renderer calls these
window.electronAPI.getTodayUsage()      // → usage data
window.electronAPI.getDailyStats()      // → stats
window.electronAPI.getBlockedApps()     // → app list
window.electronAPI.addBlockedApp(name)  // → save
window.electronAPI.removeBlockedApp(id) // → delete
window.electronAPI.exportToCSV()        // → file path
```

---

## 📝 Notes

- **Git commits:** Commit daily to track progress
- **Backup:** Backup database structure before major changes
- **Slack/Discord:** Save progress updates for accountability
- **Sleep:** Get proper sleep, 4-hour focused sessions are better than 8-hour unfocused
- **Deadline:** Don't slip days—prioritize appropriately if behind

---

**Last Updated:** March 4, 2026  
**Status:** Ready to Start  
**Expected Completion:** March 15, 2026 ✅
