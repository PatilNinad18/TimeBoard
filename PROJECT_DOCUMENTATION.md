# TimeBoard - Project Documentation

## Overview

TimeBoard is a comprehensive productivity tracking application built with Electron, React, and SQLite. It helps users monitor their application usage patterns, categorize apps as productive or distracting, and gain insights into their digital habits through detailed analytics.

## Architecture

### Technology Stack

- **Frontend**: React 18 with modern hooks and context management
- **Backend**: Node.js with Electron for desktop application
- **Database**: SQLite with better-sqlite3 for efficient data storage
- **UI Framework**: Custom CSS with dark/light theme support
- **State Management**: React Context API for theme and user preferences

### Project Structure

```
TimeBoard/
backend/
  db/
    database.js          # SQLite database connection and setup
  services/
    analyticsService.js  # Analytics data processing and queries
    statsService.js      # Productivity statistics calculations
    dataAggregator.js    # Daily usage data aggregation
    activityService.js    # Activity timeline data
  ipc/
    handlers.js          # IPC communication handlers
  preload.cjs            # Preload script for secure API exposure
  main.js                # Electron main process
  server.js              # Backend server entry point

frontend/
  src/
    components/
      Dashboard/          # Dashboard-specific components
      Analytics/          # Analytics page components
      Activity/           # Activity timeline components
      Reports/            # Reports page components
      Common/             # Shared UI components
    context/
      ThemeContext.js     # Dark/light theme management
      UserContext.js      # User preferences and settings
    pages/
      Dashboard.jsx        # Main dashboard page
      Analytics.jsx        # Analytics and insights page
      Activity.jsx         # Activity timeline page
      Reports.jsx          # Productivity reports page
    utils/
      sessionAnalysis.js   # Session intelligence utilities
    App.jsx                # Main application component
    index.js              # Application entry point
```

## Core Features

### 1. Real-time Application Tracking
- Monitors active applications and their usage duration
- Captures window titles for detailed session information
- Distinguishes between active usage and idle time
- Stores data with local timestamps for accurate time tracking

### 2. App Classification System
- Dynamic categorization of apps as "Productive" or "Distracting"
- User-configurable productive apps list
- Automatic classification based on user preferences
- Real-time updates to classification settings

### 3. Productivity Analytics
- **Dashboard**: Real-time productivity metrics and app usage overview
- **Analytics Page**: Detailed breakdowns, trends, and insights
- **Activity Timeline**: Hour-by-hour view of application usage
- **Reports**: Historical productivity reports with export functionality

### 4. Session Intelligence
- **Noise Filtering**: Automatic removal of sessions < 1 minute
- **Deep Work Detection**: Identifies focused work sessions (25+ minutes)
- **Shallow Work Classification**: Categorizes brief work sessions (2-24 minutes)
- **Work Quality Metrics**: Calculates deep work ratios and productivity patterns

### 5. Theme System
- Dark and light theme support
- Persistent theme preferences
- Dynamic accent color customization
- Consistent theming across all components

## Database Schema

### Core Tables

#### `app_usage`
```sql
CREATE TABLE app_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT NOT NULL,
  window_title TEXT,
  duration INTEGER NOT NULL,        -- Duration in seconds
  is_productive INTEGER DEFAULT 0, -- 0 = Distracting, 1 = Productive
  is_idle INTEGER DEFAULT 0,       -- 0 = Active, 1 = Idle
  timestamp DATETIME NOT NULL      -- Local timestamp
);
```

#### `user_productive_apps`
```sql
CREATE TABLE user_productive_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Data Flow

1. **Data Collection**: Main process monitors active applications
2. **Data Storage**: Usage data stored in SQLite with local timestamps
3. **Data Processing**: Backend services aggregate and analyze data
4. **Data Presentation**: Frontend components display processed data
5. **User Interaction**: User preferences stored and applied to future data

## API Endpoints

### Productivity Statistics
- `getTodayProductivityStats(dateFilter, mode)` - Daily/period productivity metrics
- `getUsage()` - Current day's app usage data
- `getReportSummary(period)` - Historical report summaries

### Analytics Data
- `getAppBreakdown(dateFilter, mode)` - App usage breakdown by category
- `getTimeDistribution(dateFilter, mode)` - Productive/distracting/idle time distribution
- `getTopDistractions(dateFilter, mode)` - Most distracting applications
- `getDailyTrends(days)` - Daily productivity trends
- `getFocusSessions(threshold, dateFilter, mode)` - Focus session analysis

### Activity Timeline
- `getActivitySessions(dateStr)` - Detailed activity timeline for specific date

### User Settings
- `getProductiveApps()` - Get user's productive apps list
- `setProductiveApps(apps)` - Update productive apps preferences

## Key Algorithms

### Noise Filtering
```javascript
// Removes applications used for less than 1 minute
HAVING COALESCE(SUM(duration), 0) >= 60
```

### Session Classification
```javascript
export function analyzeSessions(sessions) {
  let deepWorkTime = 0;
  let shallowWorkTime = 0;
  let totalValidTime = 0;

  sessions.forEach(session => {
    const duration = session.duration;
    
    if (duration < 2) return; // Ignore noise
    
    totalValidTime += duration;
    
    if (duration >= 25) {
      deepWorkTime += duration;      // Deep work: 25+ minutes
    } else {
      shallowWorkTime += duration;   // Shallow work: 2-24 minutes
    }
  });
  
  return {
    deepWorkTime,
    shallowWorkTime,
    totalValidTime,
    deepWorkRatio: Math.round((deepWorkTime / totalValidTime) * 100),
    shallowWorkRatio: Math.round((shallowWorkTime / totalValidTime) * 100)
  };
}
```

### Focus Score Calculation
```javascript
const total = productive + distracting;
const score = total === 0 ? 0 : (productive / total) * 100;
```

## Performance Optimizations

### Database Optimizations
- **WAL Mode**: Enables concurrent reads and writes
- **Prepared Statements**: Reuses SQL query templates
- **Indexing**: Optimized timestamp and app_name queries
- **Connection Pooling**: Efficient database connection management

### Frontend Optimizations
- **React.memo**: Prevents unnecessary re-renders
- **useCallback/useMemo**: Optimizes expensive calculations
- **Debounced Updates**: Reduces API call frequency
- **Lazy Loading**: Components load on-demand

### Data Processing
- **Aggregated Queries**: Pre-calculated daily statistics
- **Noise Filtering**: Removes irrelevant data at SQL level
- **Batch Processing**: Groups multiple operations for efficiency

## Security Considerations

### Electron Security
- **Context Isolation**: Enabled for secure preload scripts
- **Node Integration**: Disabled in renderer process
- **Preload Script**: Secure API exposure to frontend
- **Content Security Policy**: Restricts resource loading

### Data Privacy
- **Local Storage**: All data stored locally on user's machine
- **No Telemetry**: No data sent to external servers
- **User Control**: Complete control over data retention and deletion

## Configuration

### Environment Variables
```bash
# Development
NODE_ENV=development
PORT=3000

# Production
NODE_ENV=production
```

### Application Settings
- **Theme**: Dark/Light mode preference
- **Accent Color**: Customizable UI accent colors
- **Productive Apps**: User-configurable app classification
- **Data Retention**: Configurable data cleanup policies

## Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Package application
npm run package
```

### Testing
- **Unit Tests**: Core utility functions
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: User workflow validation
- **Performance Tests**: Memory and CPU usage monitoring

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Check database file permissions
- Verify SQLite installation
- Ensure sufficient disk space

#### Performance Issues
- Monitor database size and cleanup old data
- Check for memory leaks in long-running processes
- Optimize SQL queries with EXPLAIN plan

#### Data Accuracy
- Verify system clock synchronization
- Check timezone configuration
- Validate timestamp formats

### Debug Tools
- **Developer Console**: Browser DevTools for frontend debugging
- **Database Browser**: SQLite tools for direct data inspection
- **Performance Monitor**: System resource usage tracking
- **Log Files**: Detailed application logging

## Future Enhancements

### Planned Features
- **Cross-Platform Sync**: Cloud synchronization for multiple devices
- **Advanced Analytics**: Machine learning insights and recommendations
- **Integration APIs**: Third-party app and service integrations
- **Mobile App**: Companion mobile application
- **Team Features**: Shared productivity tracking for teams

### Technical Improvements
- **Microservices Architecture**: Scalable backend services
- **Real-time Updates**: WebSocket-based live data streaming
- **Advanced Caching**: Redis-based caching layer
- **Automated Testing**: Comprehensive test coverage
- **Performance Monitoring**: Application performance metrics

## Contributing

### Code Standards
- **ESLint**: JavaScript/JSX linting and formatting
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit validation
- **Documentation**: Comprehensive code documentation

### Development Guidelines
- **Feature Branches**: Isolated feature development
- **Code Reviews**: Peer review process
- **Testing**: Test-driven development approach
- **Documentation**: Updated documentation for all changes

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support, bug reports, or feature requests:
- **GitHub Issues**: Track bugs and feature requests
- **Documentation**: Comprehensive project documentation
- **Community**: User discussion and support forums

---

*TimeBoard - Productivity Through Insight*  
*Last Updated: 2026-04-20*
