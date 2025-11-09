import type { Task } from "@/types";
import { calculatePriorityScore } from "./prioritization";

export interface WeeklyPlan {
  week: string;
  focusAreas: string[];
  dailyPlans: {
    day: string;
    date: Date;
    tasks: Task[];
    focus: string;
  }[];
}

/**
 * Generate a weekly plan from tasks
 */
export function generateWeeklyPlan(tasks: Task[]): WeeklyPlan {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays: { day: string; date: Date }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    weekDays.push({
      day: days[i],
      date,
    });
  }

  // Filter pending tasks
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  
  // Sort by priority
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    return scoreB - scoreA;
  });

  // Distribute tasks across the week
  const dailyPlans = weekDays.map(({ day, date }) => {
    // Get tasks due on this day or without due date
    const dayTasks = sortedTasks.filter((task) => {
      if (!task.dueDate) return true;
      const dueDate = new Date(task.dueDate);
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });

    // Limit to 3-5 tasks per day
    const tasksForDay = dayTasks.slice(0, 5);

    // Determine focus based on task priorities
    const highPriorityCount = tasksForDay.filter((t) => t.priority === "high").length;
    let focus = "Balanced day";
    if (highPriorityCount >= 3) {
      focus = "High priority focus";
    } else if (highPriorityCount >= 1) {
      focus = "Important tasks";
    } else if (tasksForDay.length === 0) {
      focus = "Rest day";
    }

    return {
      day,
      date,
      tasks: tasksForDay,
      focus,
    };
  });

  // Extract focus areas from task titles/descriptions
  const focusAreas = Array.from(
    new Set(
      sortedTasks
        .slice(0, 10)
        .map((t) => t.title.split(" ")[0])
        .filter(Boolean)
    )
  ).slice(0, 3);

  return {
    week: `Week of ${startOfWeek.toLocaleDateString()}`,
    focusAreas,
    dailyPlans,
  };
}

