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
      <Card className="p-6">
        <p>Generating your daily plan...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={generatePlan} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="p-6">
        <Button onClick={generatePlan}>Generate Daily Plan</Button>
      </Card>
    );
  }

  const totalTasks = plan.morning.length + plan.afternoon.length + plan.evening.length;

  if (totalTasks === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Your Daily Plan</h3>
        <p className="text-gray-600 mb-4">
          No pending tasks. Great job staying on top of things!
        </p>
        <Button onClick={generatePlan} variant="secondary">
          Refresh Plan
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Your Daily Plan</h3>
        <Button onClick={generatePlan} size="sm" variant="secondary">
          Refresh
        </Button>
      </div>

      <div className="space-y-6">
        {plan.morning.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌅</span>
              <h4 className="text-lg font-semibold text-gray-800">Morning</h4>
              <span className="text-sm text-gray-500">
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
              <span className="text-2xl">☀️</span>
              <h4 className="text-lg font-semibold text-gray-800">Afternoon</h4>
              <span className="text-sm text-gray-500">
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
              <span className="text-2xl">🌙</span>
              <h4 className="text-lg font-semibold text-gray-800">Evening</h4>
              <span className="text-sm text-gray-500">
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

