import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { app } from "electron";

// Store DB in user's AppData/Roaming/TimeBoard/data
const dbDir = path.join(
  app.getPath("userData"),
  "data"
);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "timeboard.db");

console.log("[DB] Path:", dbPath);

const db = new Database(dbPath);

// ── WAL mode — much faster writes, safer on crash ─────────────────────────
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = -8000");   // 8MB cache
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS app_usage (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name      TEXT    NOT NULL,
    window_title  TEXT,
    domain        TEXT,
    timestamp     DATETIME NOT NULL,
    duration      REAL    NOT NULL DEFAULT 0,
    is_productive INTEGER NOT NULL DEFAULT 1,
    is_idle       INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    id                     INTEGER PRIMARY KEY AUTOINCREMENT,
    date                   TEXT UNIQUE,
    total_focus_time       INTEGER DEFAULT 0,
    total_distracting_time INTEGER DEFAULT 0,
    productivity_score     REAL    DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS blocked_apps (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name       TEXT UNIQUE NOT NULL,
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
    app_name TEXT UNIQUE NOT NULL
  );
`);

// ── Migrations — safely add columns if upgrading from older schema ─────────
const columns = db.prepare("PRAGMA table_info(app_usage)").all();
const colNames = columns.map(c => c.name);

if (!colNames.includes("domain")) {
  db.exec("ALTER TABLE app_usage ADD COLUMN domain TEXT");
  console.log("[DB] Migrated: added domain column");
}
if (!colNames.includes("is_idle")) {
  db.exec("ALTER TABLE app_usage ADD COLUMN is_idle INTEGER DEFAULT 0");
  console.log("[DB] Migrated: added is_idle column");
}

// Normalize old Electron records to the app's real name.
try {
  const usageUpdate = db.prepare(`
    UPDATE app_usage
    SET app_name = ?
    WHERE app_name = ?
  `).run("TimeBoard", "Electron");

  if (usageUpdate.changes > 0) {
    console.log(`[DB] Migrated: renamed ${usageUpdate.changes} app_usage rows from Electron to TimeBoard`);
  }

  const productiveExists = db.prepare(`
    SELECT 1 FROM user_productive_apps WHERE app_name = ?
  `).get("TimeBoard");

  if (productiveExists) {
    const deleted = db.prepare(`
      DELETE FROM user_productive_apps
      WHERE app_name = ?
    `).run("Electron");

    if (deleted.changes > 0) {
      console.log(`[DB] Migrated: removed ${deleted.changes} duplicate Electron productive app rows`);
    }
  } else {
    const productiveUpdate = db.prepare(`
      UPDATE user_productive_apps
      SET app_name = ?
      WHERE app_name = ?
    `).run("TimeBoard", "Electron");

    if (productiveUpdate.changes > 0) {
      console.log(`[DB] Migrated: renamed ${productiveUpdate.changes} productive app rows from Electron to TimeBoard`);
    }
  }

  const blockedExists = db.prepare(`
    SELECT 1 FROM blocked_apps WHERE app_name = ?
  `).get("TimeBoard");

  if (blockedExists) {
    db.prepare(`
      DELETE FROM blocked_apps
      WHERE app_name = ?
    `).run("Electron");
  } else {
    db.prepare(`
      UPDATE blocked_apps
      SET app_name = ?
      WHERE app_name = ?
    `).run("TimeBoard", "Electron");
  }
} catch (err) {
  console.error("[DB] Electron rename migration error:", err.message);
}

// ── Indexes — critical for performance with large datasets ─────────────────
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_usage_timestamp
    ON app_usage(timestamp);

  CREATE INDEX IF NOT EXISTS idx_usage_date
    ON app_usage(date(timestamp));

  CREATE INDEX IF NOT EXISTS idx_usage_app_name
    ON app_usage(app_name);

  CREATE INDEX IF NOT EXISTS idx_usage_productive
    ON app_usage(is_productive);

  CREATE INDEX IF NOT EXISTS idx_usage_idle
    ON app_usage(is_idle);

  -- Composite index for the most common query pattern
  CREATE INDEX IF NOT EXISTS idx_usage_date_productive
    ON app_usage(date(timestamp), is_productive, is_idle);
`);

// ── Auto-cleanup — keep only last 90 days to prevent unbounded growth ──────
try {
  const deleted = db.prepare(`
    DELETE FROM app_usage
    WHERE timestamp < datetime('now', 'localtime', '-90 days')
  `).run();

  if (deleted.changes > 0) {
    console.log(`[DB] Cleaned up ${deleted.changes} old records (>90 days)`);
    // Reclaim space after large deletions
    db.exec("VACUUM");
  }
} catch (err) {
  console.error("[DB] Cleanup error:", err.message);
}

// ── Fix NULL timestamps from old schema ────────────────────────────────────
try {
  const fixed = db.prepare(`
    UPDATE app_usage
    SET timestamp = datetime('now', 'localtime')
    WHERE timestamp IS NULL
  `).run();
  if (fixed.changes > 0) {
    console.log(`[DB] Fixed ${fixed.changes} NULL timestamps`);
  }
} catch (err) {
  console.error("[DB] Timestamp fix error:", err.message);
}

// ── DB stats on startup ───────────────────────────────────────────────────
try {
  const count = db.prepare("SELECT COUNT(*) as c FROM app_usage").get();
  const size  = fs.statSync(dbPath).size;
  console.log(`[DB] Initialized — ${count.c} records | ${(size/1024).toFixed(1)} KB | ${dbPath}`);
} catch (err) {
  console.error("[DB] Stats error:", err.message);
}

export default db;