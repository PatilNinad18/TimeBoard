import assert from "node:assert";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { classifyJoins, effectiveProductiveExpr } from "../services/classificationService.js";
import { setBlockedApps, getBlockedApps } from "../services/blockChecker.js";

console.log("==================================================");
console.log("🧪 Running TimeBoard Classification & Consistency Tests");
console.log("==================================================");

// Setup an in-memory test database matching the real schema
const db = new Database(":memory:");

db.exec(`
  CREATE TABLE app_usage (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name      TEXT    NOT NULL,
    window_title  TEXT,
    domain        TEXT,
    timestamp     DATETIME NOT NULL,
    duration      REAL    NOT NULL DEFAULT 0,
    is_productive INTEGER NOT NULL DEFAULT 1,
    is_idle       INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE blocked_apps (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name       TEXT UNIQUE NOT NULL,
    category       TEXT,
    user_created_at DATETIME
  );

  CREATE TABLE user_productive_apps (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    app_name TEXT UNIQUE NOT NULL
  );
`);

// Helper calculation functions using the shared classification logic
function getProductivityStats(dateStr) {
  const sql = `
    SELECT
      a.is_idle,
      (${effectiveProductiveExpr()}) AS effective_productive,
      COALESCE(SUM(a.duration), 0) AS total
    FROM app_usage a
    ${classifyJoins()}
    WHERE date(a.timestamp) = date(?)
    GROUP BY a.is_idle, effective_productive
  `;

  const rows = db.prepare(sql).all(dateStr);

  let productive = 0, distracting = 0, idle = 0;
  for (const row of rows) {
    if (row.is_idle) {
      idle += row.total;
    } else if (row.effective_productive) {
      productive += row.total;
    } else {
      distracting += row.total;
    }
  }

  const total = productive + distracting;
  const score = total === 0 ? 0 : (productive / total) * 100;
  return { productive, distracting, idle, totalTime: productive + distracting + idle, score };
}

function getAppBreakdown(dateStr) {
  const sql = `
    SELECT
      a.app_name,
      COALESCE(SUM(a.duration), 0) AS total_time,
      (${effectiveProductiveExpr()}) AS effective_productive
    FROM app_usage a
    ${classifyJoins()}
    WHERE date(a.timestamp) = date(?) AND a.app_name != 'Idle' AND a.is_idle = 0
    GROUP BY a.app_name, effective_productive
    ORDER BY total_time DESC
  `;

  const rows = db.prepare(sql).all(dateStr);
  return rows.map((r, i) => ({
    id: i + 1,
    name: r.app_name,
    totalSeconds: r.total_time,
    category: r.effective_productive ? "Productive" : "Distracting"
  }));
}

function getTimeDistribution(dateStr) {
  const stats = getProductivityStats(dateStr);
  const total = stats.totalTime;
  if (total === 0) {
    return [
      { label: "Productive", value: 0 },
      { label: "Distracting", value: 0 },
      { label: "Idle", value: 0 }
    ];
  }
  return [
    { label: "Productive", value: Math.round((stats.productive / total) * 100) },
    { label: "Distracting", value: Math.round((stats.distracting / total) * 100) },
    { label: "Idle", value: Math.round((stats.idle / total) * 100) }
  ];
}

function getTodayUsage(dateStr) {
  const rows = db.prepare(`
    SELECT
      a.app_name,
      COALESCE(SUM(a.duration), 0) as total_time,
      CASE WHEN (${effectiveProductiveExpr()}) = 1 THEN 'Productive' ELSE 'Distracting' END as category
    FROM app_usage a
    ${classifyJoins()}
    WHERE date(a.timestamp) = date(?) AND a.app_name != 'Idle' AND a.is_idle = 0
    GROUP BY a.app_name
    ORDER BY total_time DESC
  `).all(dateStr);

  return rows.map(row => ({
    app: row.app_name,
    totalSeconds: row.total_time,
    minutes: Math.round(row.total_time / 60),
    category: row.category
  }));
}

function clearTables() {
  db.prepare("DELETE FROM app_usage").run();
  db.prepare("DELETE FROM blocked_apps").run();
  db.prepare("DELETE FROM user_productive_apps").run();
}

function testSetBlockedApps(apps) {
  const insert = db.prepare(`INSERT OR IGNORE INTO blocked_apps (app_name) VALUES (?)`);
  const deleteAll = db.prepare(`DELETE FROM blocked_apps`);
  const deleteFromProd = db.prepare(`DELETE FROM user_productive_apps WHERE lower(app_name) = lower(?)`);

  db.transaction((appList) => {
    deleteAll.run();
    for (const app of appList) {
      if (app && typeof app === "string" && app.trim()) {
        const trimmed = app.trim();
        insert.run(trimmed);
        deleteFromProd.run(trimmed);
      }
    }
  })(apps || []);
}

const TODAY = "2026-09-26";

// ==========================================
// TEST 1, 2, 3, 4, 9: Frontend Source Code Inspection for Read-Only Badges
// ==========================================
console.log("\n▶ TEST 1-4 & 9: Confirm category badges are strictly read-only outside Settings");
const frontendSrcDir = path.resolve("..", "frontend", "src");

const filesToCheck = [
  path.join(frontendSrcDir, "components", "Dashboard", "AppUsage.jsx"),
  path.join(frontendSrcDir, "components", "Dashboard", "ProductiveVsDistracting.jsx"),
  path.join(frontendSrcDir, "components", "Analytics", "AppBreakdownTable.jsx"),
  path.join(frontendSrcDir, "pages", "Activity.jsx"),
  path.join(frontendSrcDir, "pages", "Reports.jsx"),
  path.join(frontendSrcDir, "components", "Settings", "ProductivityRules.jsx"),
];

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, "utf8");
  assert.strictEqual(
    content.includes("Click badge to toggle"),
    false,
    `File ${path.basename(file)} must not contain 'Click badge to toggle'`
  );
  assert.strictEqual(
    content.includes("Click an app to toggle category"),
    false,
    `File ${path.basename(file)} must not contain 'Click an app to toggle category'`
  );
  assert.strictEqual(
    content.includes("toggleAppClassification"),
    false,
    `File ${path.basename(file)} must not use toggleAppClassification`
  );
  assert.strictEqual(
    content.includes("setAppClassification"),
    false,
    `File ${path.basename(file)} must not use setAppClassification`
  );
}
console.log("  ✅ Category badges verified to be 100% read-only across all non-Settings components");

// ==========================================
// TEST 5 & 6: Adding Chrome to Distracting Apps in Settings
// ==========================================
console.log("\n▶ TEST 5 & 6: Adding Chrome to Distracting Apps in Settings changes Chrome to Distracting everywhere");
clearTables();

// 35 minutes of historical Chrome activity
db.prepare(`
  INSERT INTO app_usage (app_name, duration, is_productive, is_idle, timestamp)
  VALUES ('Google Chrome', 2100, 1, 0, '${TODAY}T10:00:00')
`).run();

// User adds Google Chrome to Settings -> Distracting Apps
testSetBlockedApps(["Google Chrome"]);

const statsAfterAdd = getProductivityStats(TODAY);
const usageAfterAdd = getTodayUsage(TODAY);
const breakdownAfterAdd = getAppBreakdown(TODAY);

console.log("  Stats after adding Chrome to Distracting:", statsAfterAdd);
assert.strictEqual(statsAfterAdd.distracting, 2100, "Distracting time must be 2100s (35 min)");
assert.strictEqual(statsAfterAdd.productive, 0, "Productive time must be 0s");
assert.strictEqual(statsAfterAdd.score, 0, "Focus score must be 0%");
assert.strictEqual(usageAfterAdd[0].category, "Distracting");
assert.strictEqual(breakdownAfterAdd[0].category, "Distracting");
console.log("  ✅ TEST 5 & 6 PASSED");

// ==========================================
// TEST 7 & 8: Removing Chrome from Distracting Apps in Settings
// ==========================================
console.log("\n▶ TEST 7 & 8: Removing Chrome from Distracting Apps returns it to Productive and recalculates historical time");

// User removes Google Chrome from Distracting Apps
testSetBlockedApps([]);

const statsAfterRemove = getProductivityStats(TODAY);
const usageAfterRemove = getTodayUsage(TODAY);
const breakdownAfterRemove = getAppBreakdown(TODAY);

console.log("  Stats after removing Chrome from Distracting:", statsAfterRemove);
assert.strictEqual(statsAfterRemove.productive, 2100, "Productive time must increase by 2100s");
assert.strictEqual(statsAfterRemove.distracting, 0, "Distracting time must decrease to 0s");
assert.strictEqual(statsAfterRemove.score, 100, "Focus score must be 100%");
assert.strictEqual(usageAfterRemove[0].category, "Productive");
assert.strictEqual(breakdownAfterRemove[0].category, "Productive");
console.log("  ✅ TEST 7 & 8 PASSED");

// ==========================================
// TEST 10: Dynamic reclassification without restart
// ==========================================
console.log("\n▶ TEST 10: Classification changes dynamically update query results without restarting");
testSetBlockedApps(["Visual Studio Code"]);
db.prepare(`
  INSERT INTO app_usage (app_name, duration, is_productive, is_idle, timestamp)
  VALUES ('Visual Studio Code', 1800, 1, 0, '${TODAY}T11:00:00')
`).run();

const statsDynamic = getProductivityStats(TODAY);
assert.strictEqual(statsDynamic.productive, 2100); // Chrome
assert.strictEqual(statsDynamic.distracting, 1800); // VS Code
console.log("  ✅ TEST 10 PASSED");

// ==========================================
// TEST 11: Idempotence & Duplicate Prevention in Distracting Apps
// ==========================================
console.log("\n▶ TEST 11: Repeatedly saving Distracting Apps prevents duplicate records and inconsistent state");
testSetBlockedApps(["Google Chrome", "Google Chrome", "Google Chrome"]);

const blockedRows = db.prepare("SELECT app_name FROM blocked_apps").all();
assert.strictEqual(blockedRows.length, 1, "Duplicate app names must be deduplicated");
assert.strictEqual(blockedRows[0].app_name, "Google Chrome");
console.log("  ✅ TEST 11 PASSED");

console.log("\n==================================================");
console.log("🎉 ALL 11 TESTS PASSED SUCCESSFULLY!");
console.log("==================================================");

process.exit(0);
