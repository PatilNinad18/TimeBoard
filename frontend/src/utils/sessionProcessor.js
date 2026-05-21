// ═══════════════════════════════════════════════════════════════
// Session Intelligence — Single Source of Truth
// All durations MUST be in MINUTES when passed to these functions
// ═══════════════════════════════════════════════════════════════

const MICRO_SWITCH_THRESHOLD = 2;  // minutes
const DEEP_WORK_THRESHOLD    = 25; // minutes

export function mergeSessions(sessions) {
  if (!sessions || sessions.length === 0) return [];

  const sorted = [...sessions].sort((a, b) => a.startTime - b.startTime);
  const merged = [];

  for (const current of sorted) {
    const prev = merged[merged.length - 1];

    if (!prev) {
      merged.push({ ...current });
      continue;
    }

    if (current.duration < MICRO_SWITCH_THRESHOLD) {
      prev.endTime   = current.endTime;
      prev.duration += current.duration;
      continue;
    }

    if (prev.app === current.app) {
      prev.endTime   = current.endTime;
      prev.duration += current.duration;
      continue;
    }

    merged.push({ ...current });
  }

  return merged;
}

export function analyzeSessions(sessions, distractingApps = []) {
  let deepWorkTime    = 0;
  let shallowWorkTime = 0;
  let totalTime       = 0;
  // Normalize distracting apps for case-insensitive comparison
  const distractSet = new Set((distractingApps || []).map(a => String(a || "").toLowerCase()));

  for (const s of sessions) {
    if (isNaN(s.duration) || s.duration <= 0) continue;

    // Only consider productive apps for deep work calculation
    const appNameNorm = String(s.app || "").toLowerCase();
    if (distractSet.has(appNameNorm)) {
      totalTime += s.duration; // Count in total but not in deep/shallow work
      continue;
    }

    totalTime += s.duration;

    if (s.duration >= DEEP_WORK_THRESHOLD) {
      deepWorkTime += s.duration;
    } else if (s.duration >= MICRO_SWITCH_THRESHOLD) {
      shallowWorkTime += s.duration;
    }
    // < MICRO_SWITCH_THRESHOLD sessions are ignored (noise)
  }

  return { deepWorkTime, shallowWorkTime, totalTime };
}

export function calculateDistractingTime(sessions, distractingApps = []) {
  let distractingTime = 0;
  let productiveTime  = 0;

  // Normalize distracting apps for case-insensitive matching
  const distractSet = new Set((distractingApps || []).map(a => String(a || "").toLowerCase()));

  for (const s of sessions) {
    if (isNaN(s.duration) || s.duration <= 0) continue;
    const appNameNorm = String(s.app || "").toLowerCase();
    if (distractSet.has(appNameNorm)) {
      distractingTime += s.duration;
    } else {
      productiveTime += s.duration;
    }
  }

  return { distractingTime, productiveTime };
}

export function calculateFocusScore({ deepWorkTime, shallowWorkTime, distractingTime }) {
  // Validate inputs
  const dw  = Math.max(0, deepWorkTime    || 0);
  const sw  = Math.max(0, shallowWorkTime || 0);
  const dis = Math.max(0, distractingTime || 0);

  const denominator = dw + sw + dis;
  if (denominator === 0) return 0;

  // Simple, honest formula: productive / total
  // Deep work gets a slight bonus (1.2x) but score can NEVER exceed 100
  const numerator = dw * 1.2 + sw;
  const raw       = (numerator / denominator) * 100;

  // Hard cap at 100 — a focus score above 100% is meaningless
  return Math.min(100, Math.round(raw));
}

// ── ONLY call with real individual sessions from getActivitySessions ──
// NEVER call with aggregated per-app totals
export function processSessions(sessions, distractingApps = []) {
  if (!sessions || sessions.length === 0) {
    return {
      mergedSessions:  [],
      deepWorkTime:    0,
      shallowWorkTime: 0,
      productiveTime:  0,
      distractingTime: 0,
      totalTime:       0,
      focusScore:      0,
    };
  }

  // Safety: ensure all durations are valid positive minutes
  const valid = sessions.filter(s =>
    s && s.app && typeof s.duration === "number" && s.duration > 0 && !isNaN(s.duration)
  );

  const merged = mergeSessions(valid);

  const { deepWorkTime, shallowWorkTime, totalTime } = analyzeSessions(merged, distractingApps);
  const { distractingTime, productiveTime }          = calculateDistractingTime(merged, distractingApps);

  const focusScore = calculateFocusScore({
    deepWorkTime,
    shallowWorkTime,
    distractingTime,
  });

  return {
    mergedSessions:  merged,
    deepWorkTime,
    shallowWorkTime,
    productiveTime,
    distractingTime,
    totalTime,
    focusScore,
  };
}

// Formatters
export function fmtMinutes(minutes) {
  if (!minutes || isNaN(minutes) || minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function fmtSeconds(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return "0m";
  return fmtMinutes(seconds / 60);
}