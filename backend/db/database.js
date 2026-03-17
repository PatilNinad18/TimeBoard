import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../data/timeboard.db");

// ensure data folder exists
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS app_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT,
    window_title TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration REAL,
    is_productive INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    total_focus_time INTEGER DEFAULT 0,
    total_distracting_time INTEGER DEFAULT 0,
    productivity_score REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blocked_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT UNIQUE,
    category TEXT,
    user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE,
    setting_value TEXT
);

CREATE TABLE IF NOT EXISTS user_productive_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT UNIQUE
    );
`);

const columns = db.prepare(`PRAGMA table_info(app_usage)`).all();

const hasDomain = columns.some(col => col.name === "domain");

if(!hasDomain) {
    db.exec(`ALTER TABLE app_usage ADD COLUMN domain TEXT`);
    console.log("Added domain column");
    
}

db.exec(`

CREATE INDEX IF NOT EXISTS idx_app_usage_timestamp
ON app_usage(timestamp);

CREATE INDEX IF NOT EXISTS idx_app_usage_app_name
ON app_usage(app_name);

CREATE INDEX IF NOT EXISTS idx_app_usage_productive
ON app_usage(is_productive);

`);
console.log("Database initialized");

export default db;