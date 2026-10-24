import { isProductiveApp } from "./productivityService.js";
import { isBlocked } from "./blockChecker.js";

const DEFAULT_PRODUCTIVE_DOMAINS = [
  "leetcode",
  "github",
  "gitlab",
  "stackoverflow",
  "stackexchange",
  "geeksforgeeks",
  "codeforces",
  "hackerrank",
  "coursera",
  "udemy",
  "edx",
  "khanacademy",
  "w3schools",
  "developer.mozilla",
  "docs.google",
  "sheets.google",
  "notion",
  "overleaf",
  "kaggle",
];

export function classifyApp(appName, domain) {
  if (isBlocked(appName)) {
    return 0;
  }

  if (isProductiveApp(appName)) {
    return 1;
  }

  if (domain) {
    const domainLower = domain.toLowerCase();
    if (DEFAULT_PRODUCTIVE_DOMAINS.some((d) => domainLower.includes(d))) {
      return 1;
    }
  }

  // Everything else = distracting
  return 0;
}
