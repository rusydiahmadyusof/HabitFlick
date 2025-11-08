import type { Task } from "@/types";

/**
 * Calculate priority score for a task
 * Higher score = higher priority
 */
export function calculatePriorityScore(task: Task): number {
  let score = 0;

  // User-set priority
  const priorityWeights = { high: 100, medium: 50, low: 10 };
  score += priorityWeights[task.priority] || 0;

  // Due date urgency
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      // Overdue
      score += 200;
    } else if (daysUntilDue === 0) {
      // Due today
      score += 150;
    } else if (daysUntilDue <= 3) {
      // Due within 3 days
      score += 100 - daysUntilDue * 10;
    }
  }

  // Status weighting
  if (task.status === "in-progress") {
    score += 20;
  }

  return score;
}

/**
 * Sort tasks by priority
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    return scoreB - scoreA; // Higher score first
  });
}

