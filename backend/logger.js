import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const LOG_DIR  = path.join(__dirname, "../logs");
const LOG_FILE = path.join(LOG_DIR, "timeboard.log");
const MAX_SIZE = 2 * 1024 * 1024; // 2MB — rotate after this

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Rotate log if too large
function rotateIfNeeded() {
  try {
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_SIZE) {
      fs.renameSync(LOG_FILE, LOG_FILE.replace(".log", ".old.log"));
    }
  } catch { /* ignore */ }
}

function timestamp() {
  return new Date().toISOString();
}

function write(level, context, message, data) {
  rotateIfNeeded();
  const line = `[${timestamp()}] [${level}] [${context}] ${message}${
    data !== undefined ? " | " + JSON.stringify(data) : ""
  }\n`;

  // Always write to console
  if (level === "ERROR") {
    console.error(line.trim());
  } else {
    console.log(line.trim());
  }

  // Write to file (non-blocking, ignore errors)
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch { /* ignore file write errors */ }
}

const logger = {
  info:  (ctx, msg, data) => write("INFO",  ctx, msg, data),
  warn:  (ctx, msg, data) => write("WARN",  ctx, msg, data),
  error: (ctx, msg, data) => write("ERROR", ctx, msg, data),
  debug: (ctx, msg, data) => {
    if (process.env.NODE_ENV === "development") {
      write("DEBUG", ctx, msg, data);
    }
  },
};

export default logger;