// AI Productivity Insights Service
import db from "../db/database.js";

export function generateProductivityInsights() {
  try {
    // Get today's activity data
    const today = new Date().toISOString().split('T')[0];
    const activities = db.prepare(`
      SELECT app, duration, timestamp, is_productive, is_idle
      FROM app_usage 
      WHERE date(timestamp) = date(?)
      ORDER BY timestamp DESC
      LIMIT 50
    `).all();

    if (!activities.length) {
      return {
        insights: ["No activity data available for AI analysis"],
        suggestions: ["Start using applications to generate productivity patterns"],
        score: 0
      };
    }

    // Analyze patterns
    const productiveApps = activities.filter(a => a.is_productive && !a.is_idle);
    const distractingApps = activities.filter(a => !a.is_productive && !a.is_idle);
    const totalProductive = productiveApps.reduce((sum, a) => sum + a.duration, 0);
    const totalDistracting = distractingApps.reduce((sum, a) => sum + a.duration, 0);

    // Generate insights
    const insights = [];
    const suggestions = [];

    // Most used app
    const appUsage = {};
    activities.forEach(a => {
      appUsage[a.app] = (appUsage[a.app] || 0) + a.duration;
    });
    
    const mostUsedApp = Object.entries(appUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 1)[0];

    if (mostUsedApp) {
      insights.push(`Most time spent on ${mostUsedApp[0]} (${Math.round(mostUsedApp[1] / 60)} minutes)`);
    }

    // Productivity patterns
    const productiveRatio = totalProductive / (totalProductive + totalDistracting);
    if (productiveRatio > 0.8) {
      insights.push("Highly productive day - great focus!");
      suggestions.push("Maintain your current work routine");
    } else if (productiveRatio > 0.6) {
      insights.push("Good productivity balance");
      suggestions.push("Consider minimizing distractions during peak hours");
    } else if (productiveRatio < 0.3) {
      insights.push("Low productivity - many distractions");
      suggestions.push("Try using app blocker during focus sessions");
    }

    // Time-based suggestions
    const currentHour = new Date().getHours();
    if (currentHour >= 9 && currentHour <= 11) {
      suggestions.push("Peak morning hours detected - schedule important tasks");
    } else if (currentHour >= 14 && currentHour <= 16) {
      suggestions.push("Afternoon slump - consider taking a break");
    }

    // Calculate productivity score
    const score = Math.round(productiveRatio * 100);

    return {
      insights,
      suggestions,
      score,
      data: {
        mostUsedApp,
        productiveRatio,
        totalProductive: Math.round(totalProductive / 60),
        totalDistracting: Math.round(totalDistracting / 60),
        sessionCount: activities.length
      }
    };
  } catch (error) {
    console.error("AI Insights generation error:", error);
    return {
      insights: ["Unable to analyze productivity patterns"],
      suggestions: ["Check if tracking is working properly"],
      score: 0
    };
  }
}
