import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../data/timeboard.db");

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

// FIX: timestamp has NO default — appTracker must always pass it explicitly
// This prevents SQLite from silently using UTC CURRENT_TIMESTAMP
db.exec(`
  CREATE TABLE IF NOT EXISTS app_usage (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name    TEXT,
    window_title TEXT,
    domain      TEXT,
    timestamp   DATETIME,
    duration    REAL,
    is_productive INTEGER DEFAULT 0,
    is_idle     INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    date                   TEXT UNIQUE,
    total_focus_time       INTEGER DEFAULT 0,
    total_distracting_time INTEGER DEFAULT 0,
    productivity_score     REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS blocked_apps (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name       TEXT UNIQUE,
    category       TEXT,
    user_created_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key   TEXT UNIQUE,
    setting_value TEXT
  );

  CREATE TABLE IF NOT EXISTS user_productive_apps (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT UNIQUE
  );
`);

// Migrate existing DB: add missing columns if upgrading from old schema
const columns = db.prepare(`PRAGMA table_info(app_usage)`).all();
const colNames = columns.map(c => c.name);

if (!colNames.includes("domain")) {
  db.exec(`ALTER TABLE app_usage ADD COLUMN domain TEXT`);
  console.log("Migrated: added domain column");
}
if (!colNames.includes("is_idle")) {
  db.exec(`ALTER TABLE app_usage ADD COLUMN is_idle INTEGER DEFAULT 0`);
  console.log("Migrated: added is_idle column");
}

// FIX: if old rows have NULL timestamp (from migration), backfill with a placeholder
// so date() queries don't silently skip them
db.exec(`
  UPDATE app_usage 
  SET timestamp = datetime('now', 'localtime')
  WHERE timestamp IS NULL;
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_app_usage_timestamp  ON app_usage(timestamp);
  CREATE INDEX IF NOT EXISTS idx_app_usage_app_name   ON app_usage(app_name);
  CREATE INDEX IF NOT EXISTS idx_app_usage_productive ON app_usage(is_productive);
`);

console.log("Database initialized");

export default db;