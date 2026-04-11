import React, { useState, useEffect } from "react";
import { FaBrain, FaLightbulb } from "react-icons/fa";

export default function AIInsights() {
  const [insights, setInsights] = useState({
    insights: [],
    suggestions: [],
    score: 0,
    loading: true
  });

  useEffect(() => {
    async function loadAIInsights() {
      try {
        console.log("🤖 Loading AI insights...");
        
        if (!window.api) {
          console.warn("⚠️ window.api not available");
          return;
        }

        const data = await window.api.getAIInsights();
        console.log("🤖 AI insights received:", data);
        
        setInsights(data);
        console.log("✅ AI insights state updated");
      } catch (error) {
        console.error("❌ Error loading AI insights:", error);
      }
    }

    loadAIInsights();
    const interval = setInterval(loadAIInsights, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (insights.loading) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 border-t-transparent"></div>
        <p className="text-gray-600 mt-2">Loading AI insights...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <FaBrain className="text-blue-500 text-2xl mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">AI Productivity Insights</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <FaLightbulb className="mr-2" />
            Insights
          </h4>
          <div className="space-y-2">
            {insights.insights.map((insight, index) => (
              <div key={index} className="bg-blue-100 rounded p-3 text-sm text-blue-700">
                {insight}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Suggestions</h4>
          <div className="space-y-2">
            {insights.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-green-100 rounded p-3 text-sm text-green-700">
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-2">Productivity Score</h4>
          <div className="text-3xl font-bold text-purple-600">
            {insights.score}/100
          </div>
        </div>
      </div>
    </div>
  );
}
