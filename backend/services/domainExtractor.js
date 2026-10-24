export const BROWSERS = [
  "Google Chrome",
  "chrome",
  "chrome.exe",
  "Microsoft Edge",
  "msedge",
  "msedge.exe",
  "Edge",
  "Brave",
  "brave",
  "brave.exe",
  "Brave Browser",
  "Opera",
  "opera.exe",
  "Opera GX",
  "Vivaldi",
  "vivaldi.exe",
  "Arc",
  "arc.exe",
  "Firefox",
  "firefox",
  "firefox.exe",
  "Mozilla Firefox",
  "Chromium",
  "chromium.exe",
];

export function isBrowser(appName) {
  if (!appName) return false;
  const lower = appName.toLowerCase().replace(/\.exe$/, "").trim();
  return (
    BROWSERS.some((b) => b.toLowerCase().replace(/\.exe$/, "") === lower) ||
    lower.includes("chrome") ||
    lower.includes("edge") ||
    lower.includes("brave") ||
    lower.includes("firefox") ||
    lower.includes("opera") ||
    lower.includes("vivaldi") ||
    lower.includes("arc") ||
    lower === "chromium"
  );
}

// Regex to strip browser suffixes added at the end of window titles
const BROWSER_SUFFIX_REGEX =
  /\s*[-–—|]\s*(?:(?:Personal|Work|Profile\s*\d+|Default)\s*[-–—|]\s*)?(?:Google Chrome|Microsoft Edge|Brave Browser|Brave|Firefox|Mozilla Firefox|Opera GX|Opera|Vivaldi|Arc|Chromium)(?:\s*\((?:Incognito|Private)\))?$/i;

// Regex to strip unread / notification / media / recording indicators from the beginning
const NOTIFICATION_PREFIX_REGEX =
  /^(\(\d+\+?\)|\[\d+\+?\]|\*\s*|•\s*|[▶🔴🔔✓]\s*)\s*/;

export function stripNotification(title) {
  if (!title) return "";
  return title.replace(NOTIFICATION_PREFIX_REGEX, "").trim();
}

export function stripBrowserSuffix(title) {
  if (!title) return "";
  return title.replace(BROWSER_SUFFIX_REGEX, "").trim();
}

// Curated dictionary of top websites for 100% exact recognition and clean canonical names
export const KNOWN_WEB_APPS = [
  { name: "WhatsApp", domain: "web.whatsapp.com", patterns: [/whatsapp/i] },
  { name: "LeetCode", domain: "leetcode.com", patterns: [/leetcode/i] },
  { name: "GitHub", domain: "github.com", patterns: [/github/i] },
  { name: "GitLab", domain: "gitlab.com", patterns: [/gitlab/i] },
  { name: "Bitbucket", domain: "bitbucket.org", patterns: [/bitbucket/i] },
  { name: "Stack Overflow", domain: "stackoverflow.com", patterns: [/stack\s*overflow/i] },
  { name: "Stack Exchange", domain: "stackexchange.com", patterns: [/stack\s*exchange/i] },
  { name: "YouTube", domain: "youtube.com", patterns: [/youtube/i] },
  { name: "YouTube Music", domain: "music.youtube.com", patterns: [/youtube music/i] },
  { name: "ChatGPT", domain: "chatgpt.com", patterns: [/chatgpt/i, /chat\.openai/i] },
  { name: "Claude", domain: "claude.ai", patterns: [/claude\.ai/i, /\bclaude\b/i] },
  { name: "Perplexity", domain: "perplexity.ai", patterns: [/perplexity/i] },
  { name: "Google Gemini", domain: "gemini.google.com", patterns: [/gemini\.google/i, /\bgemini\b/i] },
  { name: "Copilot", domain: "copilot.microsoft.com", patterns: [/copilot/i] },
  { name: "Google Search", domain: "google.com", patterns: [/google search/i, /\bgoogle\s*-\s*search\b/i] },
  { name: "Google Docs", domain: "docs.google.com", patterns: [/google docs/i, /docs\.google/i] },
  { name: "Google Sheets", domain: "sheets.google.com", patterns: [/google sheets/i, /sheets\.google/i] },
  { name: "Google Slides", domain: "slides.google.com", patterns: [/google slides/i, /slides\.google/i] },
  { name: "Google Drive", domain: "drive.google.com", patterns: [/google drive/i, /drive\.google/i] },
  { name: "Google Meet", domain: "meet.google.com", patterns: [/google meet/i, /meet\.google/i, /^meet\s*-\s*[a-z0-9-]+/i] },
  { name: "Gmail", domain: "mail.google.com", patterns: [/\bgmail\b/i, /google mail/i, /mail\.google/i] },
  { name: "Google Calendar", domain: "calendar.google.com", patterns: [/google calendar/i, /calendar\.google/i] },
  { name: "Google Maps", domain: "maps.google.com", patterns: [/google maps/i, /maps\.google/i] },
  { name: "Reddit", domain: "reddit.com", patterns: [/\breddit\b/i, /^r\/[a-z0-9_]+/i] },
  { name: "X (Twitter)", domain: "x.com", patterns: [/\btwitter\b/i, /(?:^|\s|\/|-)\s*X(?:\s*[-–—|]|$)/] },
  { name: "LinkedIn", domain: "linkedin.com", patterns: [/linkedin/i] },
  { name: "Instagram", domain: "instagram.com", patterns: [/instagram/i] },
  { name: "Facebook", domain: "facebook.com", patterns: [/facebook/i] },
  { name: "Telegram", domain: "web.telegram.org", patterns: [/telegram/i] },
  { name: "Discord", domain: "discord.com", patterns: [/discord/i] },
  { name: "Slack", domain: "slack.com", patterns: [/slack/i] },
  { name: "Notion", domain: "notion.so", patterns: [/notion/i] },
  { name: "Figma", domain: "figma.com", patterns: [/figma/i] },
  { name: "Canva", domain: "canva.com", patterns: [/canva/i] },
  { name: "Trello", domain: "trello.com", patterns: [/trello/i] },
  { name: "Jira", domain: "atlassian.net", patterns: [/jira/i] },
  { name: "Confluence", domain: "atlassian.net", patterns: [/confluence/i] },
  { name: "Spotify", domain: "spotify.com", patterns: [/spotify/i] },
  { name: "Netflix", domain: "netflix.com", patterns: [/netflix/i] },
  { name: "Prime Video", domain: "primevideo.com", patterns: [/prime\s*video/i] },
  { name: "Disney+", domain: "disneyplus.com", patterns: [/disney\+/i, /disney plus/i] },
  { name: "Twitch", domain: "twitch.tv", patterns: [/twitch/i] },
  { name: "Coursera", domain: "coursera.org", patterns: [/coursera/i] },
  { name: "Udemy", domain: "udemy.com", patterns: [/udemy/i] },
  { name: "edX", domain: "edx.org", patterns: [/\bedx\b/i] },
  { name: "Khan Academy", domain: "khanacademy.org", patterns: [/khan academy/i] },
  { name: "Codeforces", domain: "codeforces.com", patterns: [/codeforces/i] },
  { name: "HackerRank", domain: "hackerrank.com", patterns: [/hackerrank/i] },
  { name: "CodeChef", domain: "codechef.com", patterns: [/codechef/i] },
  { name: "GeeksforGeeks", domain: "geeksforgeeks.org", patterns: [/geeksforgeeks/i] },
  { name: "W3Schools", domain: "w3schools.com", patterns: [/w3schools/i] },
  { name: "MDN Web Docs", domain: "developer.mozilla.org", patterns: [/mdn web docs/i, /developer\.mozilla/i] },
  { name: "Medium", domain: "medium.com", patterns: [/\bmedium\b/i] },
  { name: "Dev.to", domain: "dev.to", patterns: [/dev\.to/i] },
  { name: "Substack", domain: "substack.com", patterns: [/substack/i] },
  { name: "Hashnode", domain: "hashnode.com", patterns: [/hashnode/i] },
  { name: "Amazon", domain: "amazon.com", patterns: [/\bamazon\.(?:com|in|co\.uk|de|fr|ca|com\.au)\b/i, /\bamazon\b/i] },
  { name: "Flipkart", domain: "flipkart.com", patterns: [/flipkart/i] },
  { name: "eBay", domain: "ebay.com", patterns: [/\bebay\b/i] },
  { name: "AliExpress", domain: "aliexpress.com", patterns: [/aliexpress/i] },
  { name: "Wikipedia", domain: "wikipedia.org", patterns: [/wikipedia/i] },
  { name: "Hacker News", domain: "news.ycombinator.com", patterns: [/hacker news/i, /y combinator/i] },
  { name: "Overleaf", domain: "overleaf.com", patterns: [/overleaf/i] },
  { name: "Kaggle", domain: "kaggle.com", patterns: [/kaggle/i] },
  { name: "Vercel", domain: "vercel.com", patterns: [/vercel/i] },
  { name: "Netlify", domain: "netlify.com", patterns: [/netlify/i] },
  { name: "Supabase", domain: "supabase.com", patterns: [/supabase/i] },
  { name: "Firebase", domain: "firebase.google.com", patterns: [/firebase/i] },
  { name: "Linear", domain: "linear.app", patterns: [/\blinear\b/i] },
  { name: "Asana", domain: "asana.com", patterns: [/asana/i] },
  { name: "ClickUp", domain: "clickup.com", patterns: [/clickup/i] },
  { name: "Miro", domain: "miro.com", patterns: [/\bmiro\b/i] },
  { name: "Zoom", domain: "zoom.us", patterns: [/\bzoom\b/i] },
  { name: "Pinterest", domain: "pinterest.com", patterns: [/pinterest/i] },
  { name: "Quora", domain: "quora.com", patterns: [/quora/i] },
  { name: "TikTok", domain: "tiktok.com", patterns: [/tiktok/i] },
  { name: "TradingView", domain: "tradingview.com", patterns: [/tradingview/i] },
  { name: "Zerodha Kite", domain: "kite.zerodha.com", patterns: [/kite/i, /zerodha/i] },
  { name: "Groww", domain: "groww.in", patterns: [/groww/i] },
  { name: "Upstox", domain: "upstox.com", patterns: [/upstox/i] },
  { name: "Hugging Face", domain: "huggingface.co", patterns: [/hugging\s*face/i] },
  { name: "Replit", domain: "replit.com", patterns: [/replit/i] },
  { name: "CodePen", domain: "codepen.io", patterns: [/codepen/i] },
  { name: "CodeSandbox", domain: "codesandbox.io", patterns: [/codesandbox/i] },
  { name: "Postman", domain: "postman.com", patterns: [/postman/i] },
  { name: "npm", domain: "npmjs.com", patterns: [/\bnpmjs?\b/i] },
  { name: "PyPI", domain: "pypi.org", patterns: [/\bpypi\b/i] },
];

export const KNOWN_APP_NAMES = KNOWN_WEB_APPS.map((a) => a.name);

// Pages internal to the browser (not external websites)
const INTERNAL_PAGES = [
  "new tab",
  "untitled",
  "settings",
  "downloads",
  "history",
  "extensions",
  "bookmarks",
  "chrome://",
  "edge://",
  "about:blank",
];

export function isInternalBrowserPage(cleanTitle) {
  if (!cleanTitle) return true;
  const lower = cleanTitle.toLowerCase().trim();
  return INTERNAL_PAGES.some((p) => lower === p || lower.startsWith(p));
}

// Separators used on websites to split Page Title and Site Name
const TITLE_SEPARATORS_REGEX = /\s+(?:[-–—|·•:»>]|–|—)\s+/;

/**
 * Universal heuristic to extract website name and domain for ANY website
 */
export function extractAnyWebsite(cleanTitle) {
  if (!cleanTitle || isInternalBrowserPage(cleanTitle)) return null;

  // 1. Check for localhost or local IP dev servers
  const localhostMatch = cleanTitle.match(/\b(localhost:\d+|127\.0\.0\.1:\d+|0\.0\.0\.0:\d+)\b/i);
  if (localhostMatch) {
    return {
      name: localhostMatch[1].toLowerCase(),
      domain: localhostMatch[1].toLowerCase(),
    };
  }

  // 2. Check for explicit domain in title (e.g. "myblog.dev", "api.stripe.com")
  const domainInTitle = cleanTitle.match(/\b([a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|io|dev|ai|app|co|in|edu|gov|xyz|tech|so|to|me|tv|info|uk|ca|de))\b/i);

  // 3. Split by standard separators
  const parts = cleanTitle.split(TITLE_SEPARATORS_REGEX).map((s) => s.trim()).filter(Boolean);

  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];

    // Priority to segment containing explicit domain
    if (domainInTitle) {
      const segWithDomain = parts.find((p) => p.toLowerCase().includes(domainInTitle[1].toLowerCase()));
      if (segWithDomain) {
        return {
          name: segWithDomain,
          domain: domainInTitle[1].toLowerCase(),
        };
      }
    }

    // Usually the last segment is the brand/site name (e.g. "Page - Site Name")
    // If the last segment is reasonably concise (1-4 words, <= 30 chars), choose it
    if (last.length <= 30 && last.split(/\s+/).length <= 4 && !/[.!?]$/.test(last)) {
      const derivedDomain = domainInTitle
        ? domainInTitle[1].toLowerCase()
        : `${last.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
      return {
        name: last,
        domain: derivedDomain,
      };
    }

    // Otherwise if the first segment is concise brand name (e.g. "Stripe: Payments for the Internet")
    if (first.length <= 25 && first.split(/\s+/).length <= 3) {
      const derivedDomain = domainInTitle
        ? domainInTitle[1].toLowerCase()
        : `${first.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
      return {
        name: first,
        domain: derivedDomain,
      };
    }
  }

  // 4. Single segment or fallback: if a domain was found
  if (domainInTitle) {
    return {
      name: domainInTitle[1],
      domain: domainInTitle[1].toLowerCase(),
    };
  }

  // 5. Short title alone is the site name
  if (cleanTitle.length <= 30 && cleanTitle.split(/\s+/).length <= 4) {
    return {
      name: cleanTitle,
      domain: `${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    };
  }

  // 6. Generic fallback: take first 3 words
  const words = cleanTitle.split(/\s+/).slice(0, 3).join(" ");
  return {
    name: words,
    domain: `${words.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
  };
}

/**
 * Detects whether an app is known or is a browser tab.
 */
export function isKnownAppName(name) {
  if (!name) return false;
  return KNOWN_APP_NAMES.includes(name) || !isBrowser(name);
}

/**
 * Detects the specific tab / web app from a browser window.
 * Returns the app name (e.g., "WhatsApp", "LeetCode", "Supabase", etc.) or null.
 */
export function detectKnownApp(appName, windowTitle) {
  if (!isBrowser(appName) || !windowTitle) return null;

  const strippedTitle = stripBrowserSuffix(windowTitle);
  const clean = stripNotification(strippedTitle);

  if (isInternalBrowserPage(clean)) return null;

  // 1. Match against curated list of known web apps
  for (const site of KNOWN_WEB_APPS) {
    if (site.patterns.some((re) => re.test(clean) || re.test(windowTitle))) {
      return site.name;
    }
  }

  // 2. Universal fallback for any other website
  const anySite = extractAnyWebsite(clean);
  if (anySite && anySite.name) {
    return anySite.name;
  }

  return null;
}

/**
 * Extracts the core page title for session tracking comparisons.
 * Strips notification counts and browser suffixes so unread count changes
 * don't split sessions, but genuine page changes do.
 */
export function coreTitle(windowTitle) {
  if (!windowTitle) return "";
  const noSuffix = stripBrowserSuffix(windowTitle);
  const clean = stripNotification(noSuffix);
  // Compare on the first part before major separator
  return clean.split(TITLE_SEPARATORS_REGEX)[0].trim().toLowerCase();
}

/**
 * Extracts the domain from the window title or app name.
 */
export function extractDomain(appName, windowTitle) {
  if (!windowTitle && !appName) return null;

  const strippedTitle = stripBrowserSuffix(windowTitle || "");
  const clean = stripNotification(strippedTitle);

  // 1. Check if appName or title matches a known web app
  for (const site of KNOWN_WEB_APPS) {
    if (
      site.name.toLowerCase() === (appName || "").toLowerCase() ||
      site.patterns.some((re) => re.test(clean) || re.test(windowTitle || ""))
    ) {
      return site.domain;
    }
  }

  // 2. Check for any website heuristic
  if (isBrowser(appName) || (appName && appName.includes(".")) || (windowTitle && isBrowser(windowTitle))) {
    const anySite = extractAnyWebsite(clean);
    if (anySite && anySite.domain) {
      return anySite.domain;
    }
  }

  return null;
}
