import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StreakDisplay from "@/components/features/StreakDisplay";
import type { Habit } from "@/types";
import { formatDate } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
}

export default function HabitCard({
  habit,
  onComplete,
  onDelete,
  onEdit,
}: HabitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const isCompletedToday = () => {
    if (!habit.lastCompleted) return false;
    const lastCompleted = new Date(habit.lastCompleted);
    const today = new Date();
    return (
      lastCompleted.getDate() === today.getDate() &&
      lastCompleted.getMonth() === today.getMonth() &&
      lastCompleted.getFullYear() === today.getFullYear()
    );
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(habit.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this habit?")) {
      setIsDeleting(true);
      try {
        await onDelete(habit.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const frequencyLabels = {
    daily: "Daily",
    weekly: "Weekly",
    custom: "Custom Schedule",
  };

  return (
    <Card variant="outlined" className="border-l-4 border-l-blue-500">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Link href={`/habits/${habit.id}`}>
              <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer">
                {habit.title}
              </h3>
            </Link>
            {habit.description && (
              <p className="text-gray-600 text-sm mt-1">{habit.description}</p>
            )}
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            {frequencyLabels[habit.frequency]}
          </span>
        </div>

        <div className="mb-4">
          <StreakDisplay
            currentStreak={habit.streak}
            longestStreak={habit.longestStreak}
          />
        </div>
        {habit.lastCompleted && (
          <div className="mb-3">
            <p className="text-sm text-gray-500">
              Last completed: {formatDate(habit.lastCompleted)}
            </p>
          </div>
        )}

        {habit.frequency === "custom" && habit.customSchedule && (
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Schedule:</p>
            <div className="flex gap-2">
              {habit.customSchedule.daysOfWeek.map((day) => {
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                return (
                  <span
                    key={day}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {days[day]}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {!isCompletedToday() && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? "Completing..." : "Complete Today"}
            </Button>
          )}
          {isCompletedToday() && (
            <span className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-lg">
              ✓ Completed Today
            </span>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(habit)}
            >
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

