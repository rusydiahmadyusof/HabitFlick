"use client";

import { useState, useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { generateWeeklyPlan, type WeeklyPlan } from "@/lib/weeklyPlans";
import Card from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function WeeklyPlanCard() {
  const tasks = useTaskStore((state) => state.tasks);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Array.isArray(tasks)) {
      const plan = generateWeeklyPlan(tasks);
      setWeeklyPlan(plan);
      setLoading(false);
    }
  }, [tasks]);

  if (loading || !weeklyPlan) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Loading weekly plan...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Weekly Plan</h2>
        <span className="text-sm text-gray-600">{weeklyPlan.week}</span>
      </div>

      {weeklyPlan.focusAreas.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Focus Areas:</p>
          <div className="flex flex-wrap gap-2">
            {weeklyPlan.focusAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {weeklyPlan.dailyPlans.map((dayPlan, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{dayPlan.day}</h3>
                <p className="text-xs text-gray-600">{formatDate(dayPlan.date)}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {dayPlan.focus}
              </span>
            </div>
            {dayPlan.tasks.length > 0 ? (
              <ul className="space-y-1 mt-2">
                {dayPlan.tasks.slice(0, 3).map((task) => (
                  <li key={task.id} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {task.title}
                    </Link>
                  </li>
                ))}
                {dayPlan.tasks.length > 3 && (
                  <li className="text-xs text-gray-500">
                    +{dayPlan.tasks.length - 3} more tasks
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No tasks scheduled</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

