import assert from "node:assert";
import {
  detectKnownApp,
  extractDomain,
  coreTitle,
  isBrowser,
  isKnownAppName,
  stripBrowserSuffix,
  stripNotification,
} from "../services/domainExtractor.js";

console.log("==================================================");
console.log("🧪 Running Chrome Tab Detection & Parsing Tests");
console.log("==================================================");

const testCases = [
  // WhatsApp
  {
    rawApp: "Google Chrome",
    title: "(2) WhatsApp - Google Chrome",
    expectedApp: "WhatsApp",
    expectedDomain: "web.whatsapp.com",
  },
  {
    rawApp: "Google Chrome",
    title: "WhatsApp Web - Google Chrome",
    expectedApp: "WhatsApp",
    expectedDomain: "web.whatsapp.com",
  },
  {
    rawApp: "chrome.exe",
    title: "WhatsApp",
    expectedApp: "WhatsApp",
    expectedDomain: "web.whatsapp.com",
  },

  // LeetCode
  {
    rawApp: "Google Chrome",
    title: "Problems - LeetCode - Google Chrome",
    expectedApp: "LeetCode",
    expectedDomain: "leetcode.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Two Sum - LeetCode - Google Chrome",
    expectedApp: "LeetCode",
    expectedDomain: "leetcode.com",
  },
  {
    rawApp: "Microsoft Edge",
    title: "Two Sum - LeetCode - Personal - Microsoft Edge",
    expectedApp: "LeetCode",
    expectedDomain: "leetcode.com",
  },
  {
    rawApp: "Brave",
    title: "Explore - LeetCode - Brave",
    expectedApp: "LeetCode",
    expectedDomain: "leetcode.com",
  },

  // GitHub & GitLab
  {
    rawApp: "Google Chrome",
    title: "facebook/react: The library for web and native user interfaces - GitHub - Google Chrome",
    expectedApp: "GitHub",
    expectedDomain: "github.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Pull Requests · vercel/next.js · GitHub - Google Chrome",
    expectedApp: "GitHub",
    expectedDomain: "github.com",
  },

  // ChatGPT & AI
  {
    rawApp: "Google Chrome",
    title: "New chat - ChatGPT - Google Chrome",
    expectedApp: "ChatGPT",
    expectedDomain: "chatgpt.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Claude - Anthropic - Google Chrome",
    expectedApp: "Claude",
    expectedDomain: "claude.ai",
  },
  {
    rawApp: "Google Chrome",
    title: "Perplexity - Google Chrome",
    expectedApp: "Perplexity",
    expectedDomain: "perplexity.ai",
  },

  // YouTube & Media
  {
    rawApp: "Google Chrome",
    title: "Never Gonna Give You Up - YouTube - Google Chrome",
    expectedApp: "YouTube",
    expectedDomain: "youtube.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Spotify - Web Player: Music for everyone - Google Chrome",
    expectedApp: "Spotify",
    expectedDomain: "spotify.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Netflix - Watch TV Shows Online - Google Chrome",
    expectedApp: "Netflix",
    expectedDomain: "netflix.com",
  },

  // Social & Professional
  {
    rawApp: "Google Chrome",
    title: "(3) Feed | LinkedIn - Google Chrome",
    expectedApp: "LinkedIn",
    expectedDomain: "linkedin.com",
  },
  {
    rawApp: "Google Chrome",
    title: "r/reactjs - What do you think? - Reddit - Google Chrome",
    expectedApp: "Reddit",
    expectedDomain: "reddit.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Post / X - Google Chrome",
    expectedApp: "X (Twitter)",
    expectedDomain: "x.com",
  },

  // Developer & Reference
  {
    rawApp: "Google Chrome",
    title: "javascript - How do I filter an array? - Stack Overflow - Google Chrome",
    expectedApp: "Stack Overflow",
    expectedDomain: "stackoverflow.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Binary Search - GeeksforGeeks - Google Chrome",
    expectedApp: "GeeksforGeeks",
    expectedDomain: "geeksforgeeks.org",
  },
  {
    rawApp: "Google Chrome",
    title: "Coursera | Machine Learning Specialization - Google Chrome",
    expectedApp: "Coursera",
    expectedDomain: "coursera.org",
  },

  // Google Workspace
  {
    rawApp: "Google Chrome",
    title: "Inbox (5) - user@gmail.com - Gmail - Google Chrome",
    expectedApp: "Gmail",
    expectedDomain: "mail.google.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Project Plan - Google Docs - Google Chrome",
    expectedApp: "Google Docs",
    expectedDomain: "docs.google.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Budget 2026 - Google Sheets - Google Chrome",
    expectedApp: "Google Sheets",
    expectedDomain: "sheets.google.com",
  },

  // Development servers / Localhost
  {
    rawApp: "Google Chrome",
    title: "Vite + React - localhost:5173 - Google Chrome",
    expectedApp: "localhost:5173",
    expectedDomain: "localhost:5173",
  },

  // Universal Heuristic: ANY arbitrary website
  {
    rawApp: "Google Chrome",
    title: "Getting Started with Database - Supabase - Google Chrome",
    expectedApp: "Supabase",
    expectedDomain: "supabase.com",
  },
  {
    rawApp: "Google Chrome",
    title: "Introduction to Rust | Towards Data Science - Google Chrome",
    expectedApp: "Towards Data Science",
    expectedDomain: "towardsdatascience.com",
  },
  {
    rawApp: "Google Chrome",
    title: "FastAPI Tutorial · Tiangolo - Google Chrome",
    expectedApp: "Tiangolo",
    expectedDomain: "tiangolo.com",
  },

  // Browser internal pages (should remain rawApp)
  {
    rawApp: "Google Chrome",
    title: "New Tab - Google Chrome",
    expectedApp: null,
    expectedDomain: null,
  },
  {
    rawApp: "Google Chrome",
    title: "Settings - Google Chrome",
    expectedApp: null,
    expectedDomain: null,
  },
];

let count = 0;
for (const tc of testCases) {
  count++;
  const detectedApp = detectKnownApp(tc.rawApp, tc.title);
  const domain = extractDomain(detectedApp || tc.rawApp, tc.title);

  assert.strictEqual(
    detectedApp,
    tc.expectedApp,
    `[Case ${count}] App mismatch for "${tc.title}". Expected "${tc.expectedApp}", got "${detectedApp}"`
  );

  if (tc.expectedDomain !== undefined) {
    assert.strictEqual(
      domain,
      tc.expectedDomain,
      `[Case ${count}] Domain mismatch for "${tc.title}". Expected "${tc.expectedDomain}", got "${domain}"`
    );
  }

  console.log(`✅ [TEST ${count}] Passed: "${tc.title}" -> "${detectedApp || tc.rawApp}" (${domain})`);
}

// Test notification stripping and session continuity in coreTitle
console.log("\n▶ Testing coreTitle notification stability...");
const t1 = "(1) WhatsApp - Google Chrome";
const t2 = "(5) WhatsApp - Google Chrome";
const t3 = "WhatsApp - Google Chrome";
assert.strictEqual(coreTitle(t1), coreTitle(t2));
assert.strictEqual(coreTitle(t2), coreTitle(t3));
console.log(`✅ Notification unread count change does not break coreTitle: "${coreTitle(t1)}"`);

// Test browser detection
console.log("\n▶ Testing browser detection...");
assert.strictEqual(isBrowser("Google Chrome"), true);
assert.strictEqual(isBrowser("chrome.exe"), true);
assert.strictEqual(isBrowser("Microsoft Edge"), true);
assert.strictEqual(isBrowser("msedge.exe"), true);
assert.strictEqual(isBrowser("Brave"), true);
assert.strictEqual(isBrowser("brave.exe"), true);
assert.strictEqual(isBrowser("VS Code"), false);
assert.strictEqual(isBrowser("TimeBoard"), false);
console.log("✅ Browser process detection verified.");

console.log("\n==================================================");
console.log("🎉 ALL TAB DETECTION TESTS PASSED SUCCESSFULLY!");
console.log("==================================================");
