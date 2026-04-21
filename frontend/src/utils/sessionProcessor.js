// ═══════════════════════════════════════════════════════════════
// Session Intelligence — Single Source of Truth
// NOTE: All durations are in MINUTES throughout this module
// ═══════════════════════════════════════════════════════════════

const MICRO_SWITCH_THRESHOLD = 2;  // minutes
const DEEP_WORK_THRESHOLD    = 25; // minutes

// ── Step 1 + 2: Sort and merge micro-switches ─────────────────
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

    // MICRO-SWITCH → absorb into previous, don't break deep work
    if (current.duration < MICRO_SWITCH_THRESHOLD) {
      prev.endTime   = current.endTime;
      prev.duration += current.duration;
      continue;
    }

    // SAME APP → extend
    if (prev.app === current.app) {
      prev.endTime   = current.endTime;
      prev.duration += current.duration;
      continue;
    }

    merged.push({ ...current });
  }

  return merged;
}

// ── Step 3: Classify into deep / shallow (durations in minutes) ─
export function analyzeSessions(sessions) {
  let deepWorkTime    = 0; // minutes
  let shallowWorkTime = 0; // minutes
  let totalTime       = 0; // minutes

  for (const s of sessions) {
    const d = s.duration; // minutes
    totalTime += d;

    if (d >= DEEP_WORK_THRESHOLD) {
      deepWorkTime += d;
    } else if (d >= MICRO_SWITCH_THRESHOLD) {
      shallowWorkTime += d;
    }
  }

  return { deepWorkTime, shallowWorkTime, totalTime };
}

// ── Step 4: Distraction at app level (durations in minutes) ──────
export function calculateDistractingTime(sessions, distractingApps = []) {
  let distractingTime = 0; // minutes
  let productiveTime  = 0; // minutes

  for (const s of sessions) {
    if (distractingApps.includes(s.app)) {
      distractingTime += s.duration;
    } else {
      productiveTime += s.duration;
    }
  }

  return { distractingTime, productiveTime };
}

// ── Step 5: Focus score ───────────────────────────────────────────
export function calculateFocusScore({ deepWorkTime, shallowWorkTime, distractingTime }) {
  const numerator   = deepWorkTime * 1.5 + shallowWorkTime;
  const denominator = deepWorkTime + shallowWorkTime + distractingTime * 1.2;
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

// ── Step 6: Single source of truth ────────────────────────────────
// INPUT: sessions with duration in MINUTES
// OUTPUT: all times in MINUTES
export function processSessions(sessions, distractingApps = []) {
  const merged = mergeSessions(sessions);

  const { deepWorkTime, shallowWorkTime, totalTime } = analyzeSessions(merged);
  const { distractingTime, productiveTime }          = calculateDistractingTime(merged, distractingApps);
  const focusScore                                   = calculateFocusScore({
    deepWorkTime,
    shallowWorkTime,
    distractingTime,
  });

  return {
    mergedSessions:  merged,
    deepWorkTime,      // minutes
    shallowWorkTime,   // minutes
    productiveTime,    // minutes
    distractingTime,   // minutes
    totalTime,         // minutes
    focusScore,        // 0-100
  };
}

// ── Formatters ─────────────────────────────────────────────────────
// Input: minutes (float or int)
export function fmtMinutes(minutes) {
  if (!minutes || isNaN(minutes) || minutes < 0) return "0m";
  const h   = Math.floor(minutes / 60);
  const m   = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Input: seconds
export function fmtSeconds(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0m";
  return fmtMinutes(seconds / 60);
}