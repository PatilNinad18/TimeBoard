# ⏱ TimeBoard

> **AI-powered productivity and activity tracking desktop application**

TimeBoard is a Windows desktop app built with **Electron + React** that silently monitors which applications you use, calculates a real-time focus/productivity score, and surfaces actionable insights — all stored locally, with no data ever leaving your machine.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Real-time App Tracking** | Polls the active window every second and records app usage sessions with millisecond precision |
| 🎯 **Focus Score** | Live productivity score based on your personally configured productive vs. distracting app lists |
| 🤖 **AI Insights** | Rule-based productivity analysis: most-used app, productive/distracting ratios, time-of-day suggestions |
| 📋 **Activity Timeline** | Per-session timeline view of every app switch throughout the day |
| 📈 **Analytics** | App breakdown, time distribution pie charts, daily trends (7/14/30 days), focus session detection |
| 📤 **Reports & CSV Export** | Weekly/monthly summary reports with paginated table and one-click CSV download |
| 🌙 **Dark / Light Mode** | Globally persisted theme with customizable accent color |
| 🔕 **Idle Detection** | Automatically attributes idle time separately — doesn't pollute your focus score |
| 🌙 **Midnight Split** | Sessions that cross midnight are automatically split so each day's data is accurate |

---

## 🛠 Tech Stack

### Backend (Electron Main Process)
| Library | Version | Purpose |
|---|---|---|
| `electron` | ^38 | Desktop shell & IPC bridge |
| `better-sqlite3` | ^12 | Embedded local SQLite database |
| `active-win` | ^8 | Reads the currently focused window & process name |
| `desktop-idle` | ^1.3 | Detects system idle state |
| `electron-builder` | ^26 | Packages the app into a Windows installer (NSIS) |

### Frontend (React SPA served inside Electron)
| Library | Version | Purpose |
|---|---|---|
| `react` | ^19 | UI framework |
| `react-router-dom` | ^7 | Client-side routing |
| `recharts` | ^3 | Charts (bar, pie, line) |
| `tailwindcss` | ^4 | Utility-first CSS |
| `zustand` | ^5 | Lightweight state management |
| `lucide-react` | ^0.545 | Icon set |
| `vite` | ^7 | Dev server & build tool |

---

## 📁 Project Structure

```
TimeBoard/
├── backend/                  # Electron main process
│   ├── main.js               # App entry: window creation, IPC handlers, health check
│   ├── preload.cjs           # Context-bridge: exposes safe API to the renderer
│   ├── logger.js             # Structured file logger
│   ├── db/
│   │   └── database.js       # SQLite connection & schema migrations
│   ├── services/
│   │   ├── appTracker.js     # Core 1 s polling loop, session management
│   │   ├── idleService.js    # Idle threshold detection
│   │   ├── domainExtractor.js# Maps browser windows → site names (YouTube, GitHub…)
│   │   ├── classificationService.js  # SQL helpers for productive/distracting joins
│   │   ├── productivityService.js    # CRUD for user_productive_apps table
│   │   ├── blockChecker.js           # CRUD for blocked_apps table
│   │   ├── dataAggregator.js         # getTodayUsage() rollup
│   │   ├── analyticsService.js       # App breakdown, trends, focus sessions
│   │   ├── statsService.js           # Productive / distracting / idle totals + score
│   │   ├── activityService.js        # Per-session activity log
│   │   ├── reportsService.js         # Weekly/monthly report summary & CSV
│   │   ├── aiInsightsService.js      # Pattern-based productivity insights
│   │   └── dataCleanup.js            # Periodic old-data pruning
│   ├── routes/
│   │   └── stats.js          # (reserved for future HTTP route use)
│   ├── assets/
│   │   └── logo.ico          # App icon
│   └── tests/
│       └── classification.test.js
│
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── main.jsx          # React root
│   │   ├── App.jsx           # Router setup (Landing → DashboardPage)
│   │   ├── context/
│   │   │   ├── ThemeContext.jsx   # Dark mode + accent color (persisted to localStorage)
│   │   │   └── UserContext.jsx   # User name + distracting apps (synced with Electron IPC)
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Onboarding wizard (name + distracting apps)
│   │   │   ├── Dashboard.jsx     # Summary cards, chart, focus score
│   │   │   ├── Analytics.jsx     # Detailed charts & trends
│   │   │   ├── Activity.jsx      # Session-by-session timeline
│   │   │   ├── Reports.jsx       # Summary cards + paginated table + CSV export
│   │   │   └── Settings.jsx      # Productivity rules, blocking, preferences, data mgmt
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Dashboard/        # SummaryCard, ProductivityChart, FocusCard, AppUsage…
│   │       ├── Analytics/
│   │       ├── Activity/
│   │       ├── Reports/
│   │       ├── Settings/         # ProductivityRules, DistractingAppsSettings, Preferences…
│   │       └── LandingPage/
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── logs/
│   └── timeboard.log         # Runtime log file
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- **Windows** (uses Windows-specific native modules: `active-win`, `desktop-idle`)

### 1 — Install dependencies

```bash
# Backend (Electron)
cd backend
npm install

# Rebuild native modules for the installed Electron version
npx electron-rebuild

# Frontend (React)
cd ../frontend
npm install
```

### 2 — Development mode

Open **two terminals**:

```bash
# Terminal 1 — start the Vite dev server (frontend)
cd frontend
npm run dev
# → serves on http://localhost:5173
```

```bash
# Terminal 2 — launch Electron (backend)
cd backend
npm start
# → Electron loads http://localhost:5173 in dev mode
```

### 3 — Production build

```bash
# 1. Build the React frontend
cd frontend
npm run build
# → output goes to frontend/dist/

# 2. Package the Electron app into a Windows installer
cd ../backend
npm run dist
# → installer appears in backend/release/TimeBoard-Setup-<version>.exe
```

---

## ⚙️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                       Electron Main Process                  │
│                                                              │
│  ┌──────────────┐   every 1 s    ┌──────────────────────┐   │
│  │  appTracker  │ ─────────────► │  active-win / idle   │   │
│  │              │                │  (native OS query)   │   │
│  │  • session   │◄───────────────│                      │   │
│  │    mgmt      │   app + title  └──────────────────────┘   │
│  │  • classify  │                                            │
│  │  • midnight  │ ──► SQLite (better-sqlite3)                │
│  │    split     │      app_usage, blocked_apps,              │
│  └──────────────┘      user_productive_apps                  │
│                                                              │
│  IPC handlers (ipcMain.handle) ──► preload.cjs (contextBridge)
│                                          │                   │
└──────────────────────────────────────────┼───────────────────┘
                                           │ window.api.*
                              ┌────────────▼──────────────┐
                              │   React SPA (Renderer)    │
                              │  Dashboard / Analytics /  │
                              │  Activity / Reports /     │
                              │  Settings                 │
                              └───────────────────────────┘
```

### App Classification
1. **Distracting list wins** — if the app is in the user's "distracting" list it scores 0.
2. **Productive list next** — if it's in the "productive" list it scores 1.
3. **Default: productive** — anything else is assumed productive so day-one focus scores work out of the box.

### Focus Score
`score = (productive_seconds / (productive_seconds + distracting_seconds)) × 100`

---

## 🖥 Pages Overview

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` (first launch) | 3-step onboarding: welcome → name → pick distracting apps |
| **Dashboard** | `/dashboard` | Summary cards, productivity chart, focus score ring, app list |
| **Analytics** | `/analytics` | App breakdown, time distribution, daily trends, focus sessions |
| **Activity** | `/activity` | Chronological session timeline for any selected day |
| **Reports** | `/reports` | Weekly/monthly rollup, paginated app table, CSV export |
| **Settings** | `/settings` | Productivity/blocking rules, theme, idle threshold, data management |

---

## 🔒 Privacy

All data is stored **locally** in a SQLite database inside the app's user-data directory. Nothing is sent to any server. The app has no network requests.

---

## 📜 License

ISC © TimeBoard
