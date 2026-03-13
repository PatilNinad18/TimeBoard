import db from "./db/database.js";

const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ").all();
console.log(result);

db.prepare(`
    INSERT INTO app_usage (app_name, window_title, duration_seconds)
    VALUES (?,?,?)
    `).run("Chrome", "YouTube - Google Chrome", 120);

const rows = db.prepare("SELECT * FROM app_usage").all();

console.log(rows);
