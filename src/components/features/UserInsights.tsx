"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { usePrioritization } from "@/hooks/usePrioritization";

export default function UserInsights() {
  const { getUserInsights, loading, error } = usePrioritization();
  const [insights, setInsights] = useState<{
    bestCompletionTime: string;
    averageTasksPerDay: number;
    mostProductiveDay: string;
    suggestions: string[];
  } | null>(null);

  const loadInsights = async () => {
    try {
      const data = await getUserInsights();
      setInsights(data);
    } catch (err) {
      console.error("Error loading insights:", err);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading insights...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={loadInsights} className="mt-4" size="sm">
          Try Again
        </Button>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  const timeLabels: Record<string, string> = {
    morning: "🌅 Morning",
    afternoon: "☀️ Afternoon",
    evening: "🌙 Evening",
  };

  return (
    <Card variant="elevated" className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Insights</h3>
        <Button onClick={loadInsights} size="sm" variant="ghost">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Best Time</p>
            <p className="font-semibold text-gray-900">
              {timeLabels[insights.bestCompletionTime] || insights.bestCompletionTime}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Avg Tasks/Day</p>
            <p className="font-semibold text-gray-900">
              {insights.averageTasksPerDay}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Most Productive</p>
            <p className="font-semibold text-gray-900">
              {insights.mostProductiveDay}
            </p>
          </div>
        </div>

        {insights.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Suggestions
            </h4>
            <ul className="space-y-2">
              {insights.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-0.5">💡</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

