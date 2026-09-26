const BROWSERS = ["Google Chrome", "Microsoft Edge", "Brave"];

// Only these get pulled out as their own "app" — everything else on the
// browser stays lumped together as "Google Chrome". Add more as needed.
const KNOWN_APPS = {
  YouTube: ["youtube"],
  Spotify: ["spotify"],
  Netflix: ["netflix"],
};

export const KNOWN_APP_NAMES = Object.keys(KNOWN_APPS);

export function isKnownAppName(name) {
  return KNOWN_APP_NAMES.includes(name);
}

export function detectKnownApp(appName, windowTitle) {
  if (!BROWSERS.includes(appName) || !windowTitle) return null;

  const title = windowTitle.toLowerCase();

  for (const [site, keywords] of Object.entries(KNOWN_APPS)) {
    if (keywords.some((kw) => title.includes(kw))) {
      return site;
    }
  }

  return null;
}

// The "core" part of a browser window title — everything before the first
// " - " (i.e. before any " - Site Name - Browser" suffix). Browsers update
// their OS window title in steps, so a poll can occasionally land mid-update
// with the suffix briefly missing or truncated. Comparing titles by their
// core lets the tracker recognize "still the same tab" through that kind of
// noise, instead of treating every flicker as a real tab switch.
export function coreTitle(windowTitle) {
  if (!windowTitle) return "";
  return windowTitle.split(" - ")[0].trim().toLowerCase();
}

// Second-to-last " - "-separated segment of the title, e.g. "YouTube" in
// "My video - YouTube - Google Chrome", or "Google Search" in
// "query - Google Search - Google Chrome". Used for the domain column on
// tabs that aren't one of the KNOWN_APPS above.
export function extractDomain(appName, windowTitle) {
  if (!BROWSERS.includes(appName) || !windowTitle) return null;
  const parts = windowTitle.split(" - ").map((p) => p.trim());
  if (parts.length >= 3) return parts[parts.length - 2];
  return null;
}