"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { usePrioritization } from "@/hooks/usePrioritization";
import { useTaskStore } from "@/store/taskStore";

export default function UserInsights() {
  const { getUserInsights, loading, error } = usePrioritization();
  const tasks = useTaskStore((state) => state.tasks);
  const [insights, setInsights] = useState<{
    bestCompletionTime: string;
    averageTasksPerDay: number;
    mostProductiveDay: string;
    suggestions: string[];
  } | null>(null);

  const loadInsights = async () => {
    try {
      // Use cached tasks from store to avoid redundant query
      const data = await getUserInsights(Array.isArray(tasks) && tasks.length > 0 ? tasks : undefined);
      setInsights(data);
    } catch (err) {
      console.error("Error loading insights:", err);
    }
  };

  useEffect(() => {
    // Only load insights if we have tasks loaded
    if ((Array.isArray(tasks) && tasks.length > 0) || !loading) {
      loadInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(tasks) ? tasks.length : 0]);

  if (loading) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <Button onClick={loadInsights} className="mt-4 w-full sm:w-auto" size="sm">
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
    <Card variant="elevated" className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">Your Insights</h3>
        <Button onClick={loadInsights} size="sm" variant="ghost" className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Best Time</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
              {timeLabels[insights.bestCompletionTime] || insights.bestCompletionTime}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Tasks/Day</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
              {insights.averageTasksPerDay}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Most Productive</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
              {insights.mostProductiveDay}
            </p>
          </div>
        </div>

        {insights.suggestions.length > 0 && (
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Suggestions
            </h4>
            <ul className="space-y-2">
              {insights.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-blue-500 dark:text-blue-400 mt-0.5">💡</span>
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

