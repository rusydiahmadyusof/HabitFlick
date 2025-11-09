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
    <Card 
      variant="outlined" 
      className="border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/10 transition-all duration-200 hover:shadow-md"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/habits/${habit.id}`}>
              <h3 className="font-semibold text-base sm:text-lg hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors break-words">
                {habit.title}
              </h3>
            </Link>
            {habit.description && (
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-1.5 line-clamp-2">
                {habit.description}
              </p>
            )}
          </div>
          <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 whitespace-nowrap flex-shrink-0">
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
            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <span>✓</span>
              Last completed: {formatDate(habit.lastCompleted)}
            </p>
          </div>
        )}

        {habit.frequency === "custom" && habit.customSchedule && (
          <div className="mb-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 font-medium">Schedule:</p>
            <div className="flex flex-wrap gap-2">
              {habit.customSchedule.daysOfWeek.map((day) => {
                const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                return (
                  <span
                    key={day}
                    className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs rounded-md font-medium"
                  >
                    {days[day]}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {!isCompletedToday() && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleComplete}
              disabled={isCompleting}
              isLoading={isCompleting}
              className="flex-1 sm:flex-initial min-w-[140px]"
            >
              {isCompleting ? "Completing..." : "Complete Today"}
            </Button>
          )}
          {isCompletedToday() && (
            <span className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300 rounded-lg flex items-center gap-1 flex-1 sm:flex-initial">
              ✓ Completed Today
            </span>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(habit)}
              className="flex-1 sm:flex-initial min-w-[80px]"
            >
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
            isLoading={isDeleting}
            className="flex-1 sm:flex-initial min-w-[80px]"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

