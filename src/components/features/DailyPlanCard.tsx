"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { usePrioritization } from "@/hooks/usePrioritization";
import { useTaskStore } from "@/store/taskStore";
import TaskCard from "@/components/features/TaskCard";
import type { Task } from "@/types";

interface DailyPlanCardProps {
  onTaskComplete: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export default function DailyPlanCard({
  onTaskComplete,
  onTaskDelete,
}: DailyPlanCardProps) {
  const { getSuggestedOrder, loading, error } = usePrioritization();
  const tasks = useTaskStore((state) => state.tasks);
  const [plan, setPlan] = useState<{
    morning: Task[];
    afternoon: Task[];
    evening: Task[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      // Use cached tasks from store to avoid redundant query
      const suggestedOrder = await getSuggestedOrder(Array.isArray(tasks) && tasks.length > 0 ? tasks : undefined);
      setPlan(suggestedOrder);
    } catch (err) {
      console.error("Error generating plan:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Only generate plan if we have tasks loaded
    if ((Array.isArray(tasks) && tasks.length > 0) || !loading) {
      generatePlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(tasks) ? tasks.length : 0]);

  if (loading || isGenerating) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-gray-600 dark:text-gray-400">Generating your daily plan...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <Button onClick={generatePlan} className="mt-4 w-full sm:w-auto">
          Try Again
        </Button>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="p-4 sm:p-6">
        <Button onClick={generatePlan} className="w-full sm:w-auto">Generate Daily Plan</Button>
      </Card>
    );
  }

  const totalTasks = plan.morning.length + plan.afternoon.length + plan.evening.length;

  if (totalTasks === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50">Your Daily Plan</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No pending tasks. Great job staying on top of things!
        </p>
        <Button onClick={generatePlan} variant="secondary" className="w-full sm:w-auto">
          Refresh Plan
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-50">Your Daily Plan</h3>
        <Button onClick={generatePlan} size="sm" variant="secondary" className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {plan.morning.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl sm:text-2xl">🌅</span>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Morning</h4>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                ({plan.morning.length} tasks)
              </span>
            </div>
            <div className="space-y-3">
              {plan.morning.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onTaskComplete}
                  onDelete={onTaskDelete}
                />
              ))}
            </div>
          </section>
        )}

        {plan.afternoon.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl sm:text-2xl">☀️</span>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Afternoon</h4>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                ({plan.afternoon.length} tasks)
              </span>
            </div>
            <div className="space-y-3">
              {plan.afternoon.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onTaskComplete}
                  onDelete={onTaskDelete}
                />
              ))}
            </div>
          </section>
        )}

        {plan.evening.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl sm:text-2xl">🌙</span>
              <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">Evening</h4>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                ({plan.evening.length} tasks)
              </span>
            </div>
            <div className="space-y-3">
              {plan.evening.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onTaskComplete}
                  onDelete={onTaskDelete}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Card>
  );
}

