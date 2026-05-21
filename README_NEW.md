# TimeBoard

<div align="center">

![TimeBoard Logo](https://via.placeholder.com/200x80/3b82f6/ffffff?text=TimeBoard)

**Privacy-Focused Productivity Tracking**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-2196F3?style=flat&logo=electron)](https://electronjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite)](https://sqlite.org/)

Track your digital habits, understand your productivity patterns, and optimize your focus time - all stored locally on your device.

</div>

## Features

### **Core Functionality**
- **Real-time Application Tracking** - Monitors active applications and usage duration
- **Smart App Classification** - Categorize apps as productive or distracting
- **Privacy-First Design** - All data stored locally, no cloud dependencies
- **Cross-Platform Support** - Windows, macOS, and Linux compatibility

### **Analytics & Insights**
- **Productivity Dashboard** - Real-time metrics and focus scores
- **Detailed Analytics** - Time distribution, trends, and patterns
- **Activity Timeline** - Hour-by-hour view of your digital day
- **Historical Reports** - Track productivity over time with CSV export

### **Intelligent Features**
- **Session Intelligence** - Automatically identifies deep work sessions
- **Noise Filtering** - Ignores brief app switches (< 1 minute)
- **Focus Score Calculation** - Mathematical productivity scoring
- **Customizable Metrics** - Tailor tracking to your workflow

## Quick Start

### **System Requirements**
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Storage**: 500MB available space
- **Display**: 1024x768 resolution minimum

### **Installation**

#### **Option 1: Download Pre-built Binary**
1. Visit [Releases](https://github.com/yourusername/timeboard/releases)
2. Download the appropriate version for your OS
3. Run the installer and follow the setup wizard
4. Launch TimeBoard from your applications folder

#### **Option 2: Build from Source**
```bash
# Clone the repository
git clone https://github.com/yourusername/timeboard.git
cd timeboard

# Install dependencies
npm install

# Start development mode
npm run dev

# Build for production
npm run build

# Package as distributable
npm run package
```

### **First Time Setup**
1. **Launch TimeBoard** - The app starts automatically tracking your usage
2. **Configure Productive Apps** - Go to Settings to mark apps as productive
3. **Explore Dashboard** - View your real-time productivity metrics
4. **Check Analytics** - Dive deeper into your usage patterns

## Usage Guide

### **Dashboard Overview**
- **Focus Score**: Overall productivity percentage (0-100%)
- **Productive Time**: Total time spent in productive applications
- **Distracting Time**: Total time spent in distracting applications
- **Idle Time**: System idle periods
- **Deep Work**: Focused sessions 25+ minutes in productive apps

### **App Classification**
1. **Access Settings**: Click the settings icon in the sidebar
2. **Productive Apps Tab**: Add/remove apps from your productive list
3. **Automatic Classification**: Apps not in productive list are marked as distracting
4. **Real-time Updates**: Changes apply immediately to all metrics

### **Analytics Features**
- **Time Distribution**: Pie chart of productive/distracting/idle time
- **App Breakdown**: Detailed usage by application
- **Top Distractions**: Your most time-consuming distracting apps
- **Focus Trends**: Daily productivity patterns over time
- **Focus Sessions**: Analysis of your focused work periods

### **Activity Timeline**
- **Hourly View**: See exactly which apps you used and when
- **Session Details**: Window titles and duration for each session
- **Filter Options**: Search by app name or time range
- **Noise Filter**: Automatic hiding of brief app switches

### **Reports & Export**
- **Historical Data**: View productivity over different time periods
- **CSV Export**: Download your data for external analysis
- **Summary Metrics**: Best focus days, average hours, consistency scores
- **Custom Date Ranges**: Analyze specific periods of interest

## Advanced Features

### **Session Intelligence**
TimeBoard automatically categorizes your work sessions:

- **Deep Work**: 25+ minutes in productive apps
- **Shallow Work**: 2-24 minutes in productive apps  
- **Noise**: < 2 minutes (automatically filtered out)
- **Focus Score**: Calculated as `(productive time / total time) × 100`

### **Noise Filtering**
To provide meaningful insights, TimeBoard automatically:
- Ignores app sessions shorter than 1 minute
- Merges rapid app switches into continuous sessions
- Filters out system background processes
- Focuses on meaningful usage patterns

### **Customization Options**
- **Theme Selection**: Dark mode, light mode, or system preference
- **Accent Colors**: Choose your preferred accent color
- **Data Retention**: Configure how long to keep usage data
- **Update Frequency**: Set refresh intervals for real-time updates

## Technical Details

### **Architecture**
- **Frontend**: React 18 with modern hooks and context management
- **Backend**: Node.js with Electron for desktop application
- **Database**: SQLite with better-sqlite3 for efficient local storage
- **UI Framework**: Custom CSS with CSS-in-JS for theming

### **Data Privacy**
- **Local Storage**: All data stored exclusively on your device
- **No Telemetry**: No usage data sent to external servers
- **No Cloud Dependencies**: Full functionality without internet connection
- **Data Ownership**: Complete control over your productivity data

### **Performance**
- **Low Memory Usage**: Optimized for minimal system impact
- **Efficient Database**: Indexed SQLite for fast queries
- **Background Processing**: Non-blocking data collection
- **Smart Caching**: Intelligent data caching for responsive UI

## Configuration

### **Environment Variables**
```bash
# Development
NODE_ENV=development
PORT=3000

# Production  
NODE_ENV=production
```

### **Database Configuration**
- **Location**: `%APPDATA%/TimeBoard/timeboard.db` (Windows)
- **Backup**: Database automatically backed up before updates
- **Migration**: Schema migrations handled automatically
- **Optimization**: Automatic database optimization and cleanup

### **Advanced Settings**
Edit `config.json` in your TimeBoard data directory:
```json
{
  "tracking": {
    "idleTimeout": 300,
    "minSessionDuration": 60,
    "deepWorkThreshold": 1500
  },
  "privacy": {
    "dataRetentionDays": 365,
    "anonymizeData": false
  },
  "ui": {
    "theme": "system",
    "accentColor": "#3b82f6",
    "refreshInterval": 120000
  }
}
```

## Troubleshooting

### **Common Issues**

#### **Application Won't Start**
- **Check System Requirements**: Ensure your OS meets minimum requirements
- **Permissions**: Run as administrator on Windows if needed
- **Antivirus**: Add TimeBoard to your antivirus exceptions
- **Graphics Drivers**: Update graphics drivers on Windows

#### **Data Not Showing**
- **Permissions**: Grant accessibility/screen recording permissions
- **Restart Tracking**: Toggle tracking off and on in settings
- **Database Check**: Verify database file isn't corrupted
- **Rebuild Index**: Use Settings > Advanced > Rebuild Database

#### **High CPU Usage**
- **Update App**: Ensure you're running the latest version
- **Reduce Refresh Rate**: Increase update interval in settings
- **Exclude Apps**: Add background apps to exclusion list
- **Reinstall**: Clean reinstall may resolve performance issues

#### **Sync Issues**
- **Local Storage Only**: TimeBoard doesn't sync to cloud
- **Manual Backup**: Use Export feature for data backup
- **File Permissions**: Check database file permissions
- **Disk Space**: Ensure sufficient disk space available

### **Debug Information**
Enable debug mode for troubleshooting:
```bash
# Windows
set DEBUG=timeboard:* && timeboard.exe

# macOS/Linux  
DEBUG=timeboard:* ./TimeBoard
```

### **Log Files**
Find log files in:
- **Windows**: `%APPDATA%/TimeBoard/logs/`
- **macOS**: `~/Library/Logs/TimeBoard/`
- **Linux**: `~/.local/share/TimeBoard/logs/`

## Development

### **Setup Development Environment**
```bash
# Clone repository
git clone https://github.com/yourusername/timeboard.git
cd timeboard

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Package application
npm run package
```

### **Project Structure**
```
timeboard/
backend/
  services/           # Business logic and data processing
  db/                # Database schema and migrations
  ipc/               # Inter-process communication
  main.js            # Electron main process
frontend/
  src/
    components/      # React components
    pages/           # Page components
    context/         # React context providers
    utils/           # Utility functions
    App.jsx           # Main application component
```

### **Contributing**
1. **Fork Repository**: Create a fork on GitHub
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Make Changes**: Implement your feature with tests
4. **Test Thoroughly**: Ensure all tests pass
5. **Submit PR**: Create a pull request with description

### **Code Standards**
- **ESLint**: Follow project linting rules
- **Prettier**: Use consistent code formatting
- **TypeScript**: Prefer TypeScript for new code
- **Tests**: Write tests for new features
- **Documentation**: Update documentation for changes

## API Reference

### **IPC Events**
```javascript
// Productivity Stats
window.api.getTodayProductivityStats(dateFilter, mode)

// App Usage Data
window.api.getUsage()

// Analytics Data
window.api.getAppBreakdown(dateFilter, mode)
window.api.getTimeDistribution(dateFilter, mode)
window.api.getTopDistractions(dateFilter, mode)

// Activity Sessions
window.api.getActivitySessions(dateStr)

// User Settings
window.api.getProductiveApps()
window.api.setProductiveApps(apps)
```

### **Database Schema**
```sql
-- App usage tracking
CREATE TABLE app_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT NOT NULL,
  window_title TEXT,
  duration INTEGER NOT NULL,
  is_productive INTEGER DEFAULT 0,
  is_idle INTEGER DEFAULT 0,
  timestamp DATETIME NOT NULL
);

-- User productive apps
CREATE TABLE user_productive_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## FAQ

### **Is TimeBoard really private?**
Yes! All data is stored locally on your device. No data is sent to external servers, and there's no telemetry or analytics tracking.

### **Can TimeBoard track my passwords or sensitive data?**
No. TimeBoard only tracks application names, window titles, and usage duration. It does not track keystrokes, passwords, or application content.

### **How accurate is the tracking?**
TimeBoard uses system-level APIs for accurate tracking. However, some applications may not be trackable due to security restrictions.

### **Can I export my data?**
Yes! TimeBoard supports CSV export of all your productivity data from the Reports page.

### **Does TimeBoard work offline?**
Yes! TimeBoard is fully functional without an internet connection since all data is stored locally.

### **How much system resources does TimeBoard use?**
TimeBoard is optimized for minimal resource usage, typically using less than 100MB RAM and minimal CPU impact.

### **Can I customize the productive apps list?**
Yes! You can add or remove apps from your productive list in Settings at any time.

### **What happens if I uninstall TimeBoard?**
Your data remains in the application data directory. You can export it before uninstalling or manually back up the database file.

## Support

### **Getting Help**
- **Documentation**: [Full Documentation](https://docs.timeboard.app)
- **Community Forum**: [Discuss TimeBoard](https://github.com/yourusername/timeboard/discussions)
- **Bug Reports**: [Report Issues](https://github.com/yourusername/timeboard/issues)
- **Feature Requests**: [Suggest Features](https://github.com/yourusername/timeboard/issues/new?template=feature_request.md)

### **Contact**
- **Email**: support@timeboard.app
- **Twitter**: [@TimeBoardApp](https://twitter.com/TimeBoardApp)
- **Website**: [timeboard.app](https://timeboard.app)

## License

TimeBoard is released under the [MIT License](LICENSE).

---

<div align="center">

**Built with passion for productivity and privacy**

[![Made with Love](https://img.shields.io/badge/Made%20with%20%E2%99%A5-red)](https://timeboard.app)
[![Privacy First](https://img.shields.io/badge/Privacy%20First-green)](https://timeboard.app)

</div>
