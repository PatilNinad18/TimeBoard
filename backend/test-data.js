import db from "./db/database.js";

// Add test data to verify frontend works
const testData = [
  {
    app_name: "Visual Studio Code",
    window_title: "TimeBoard - frontend/src/pages/DashboardPage.jsx",
    duration: 3600, // 1 hour
    is_productive: 1,
    is_idle: 0,
    domain: "development"
  },
  {
    app_name: "Chrome",
    window_title: "YouTube - Time Management Tips",
    duration: 1800, // 30 minutes
    is_productive: 0,
    is_idle: 0,
    domain: "youtube.com"
  },
  {
    app_name: "Spotify",
    window_title: "Focus Music Playlist",
    duration: 900, // 15 minutes
    is_productive: 0,
    is_idle: 0,
    domain: "music"
  }
];

// Insert test data
testData.forEach(data => {
  db.prepare(`
    INSERT INTO app_usage 
    (app_name, window_title, duration, is_productive, is_idle, domain, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-${Math.floor(Math.random() * 8)} hours'))
  `).run(
    data.app_name,
    data.window_title,
    data.duration,
    data.is_productive,
    data.is_idle,
    data.domain
  );
});

console.log("✅ Test data added successfully");

// Verify data was inserted
const count = db.prepare("SELECT COUNT(*) as count FROM app_usage").get();
console.log(`Total database entries: ${count.count}`);

const today = db.prepare(`
  SELECT COUNT(*) as count FROM app_usage 
  WHERE date(timestamp) = date('now')
`).get();
console.log(`Today's entries: ${today.count}`);
