import * as admin from "firebase-admin";
import type { Task } from "../../../src/types";

/**
 * Calculate priority score for a task
 * Higher score = higher priority
 */
export function calculatePriorityScore(task: any): number {
  let score = 0;

  // User-set priority weights
  const priorityWeights: Record<string, number> = {
    high: 100,
    medium: 50,
    low: 10,
  };
  score += priorityWeights[task.priority] || 0;

  // Due date urgency
  if (task.dueDate) {
    const dueDate = (task.dueDate as admin.firestore.Timestamp).toDate();
    const now = new Date();
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      // Overdue - highest priority
      score += 200;
    } else if (daysUntilDue === 0) {
      // Due today
      score += 150;
    } else if (daysUntilDue <= 1) {
      // Due tomorrow
      score += 120;
    } else if (daysUntilDue <= 3) {
      // Due within 3 days
      score += 100 - daysUntilDue * 10;
    } else if (daysUntilDue <= 7) {
      // Due within a week
      score += 50 - daysUntilDue * 5;
    }
  }

  // Status weighting
  if (task.status === "in-progress") {
    score += 20; // Boost in-progress tasks
  } else if (task.status === "completed") {
    score -= 1000; // Completed tasks go to bottom
  }

  // Age factor (older tasks get slight boost if not completed)
  if (task.createdAt && task.status !== "completed") {
    const createdAt = (task.createdAt as admin.firestore.Timestamp).toDate();
    const daysOld = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysOld > 7) {
      score += 5; // Slight boost for older tasks
    }
  }

  return score;
}

/**
 * Sort tasks by priority
 */
export function sortTasksByPriority(tasks: any[]): any[] {
  return [...tasks].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    return scoreB - scoreA; // Higher score first
  });
}

/**
 * Generate suggested task order for today
 */
export function generateSuggestedOrder(tasks: any[]): {
  morning: any[];
  afternoon: any[];
  evening: any[];
} {
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in-progress");
  const sorted = sortTasksByPriority(pendingTasks);

  // Split into time blocks based on priority
  const morning: any[] = [];
  const afternoon: any[] = [];
  const evening: any[] = [];

  sorted.forEach((task, index) => {
    const score = calculatePriorityScore(task);
    
    if (score >= 150) {
      // High priority - morning
      morning.push(task);
    } else if (score >= 80) {
      // Medium-high priority - afternoon
      afternoon.push(task);
    } else {
      // Lower priority - evening
      evening.push(task);
    }
  });

  return { morning, afternoon, evening };
}

/**
 * Analyze user patterns for suggestions
 */
export async function analyzeUserPatterns(
  userId: string
): Promise<{
  bestCompletionTime: string;
  averageTasksPerDay: number;
  mostProductiveDay: string;
  suggestions: string[];
}> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get completed tasks from last 30 days
  const completedTasks = await admin
    .firestore()
    .collection("tasks")
    .where("userId", "==", userId)
    .where("status", "==", "completed")
    .where("completedAt", ">=", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
    .get();

  const tasks = completedTasks.docs.map((doc) => doc.data());
  
  // Analyze completion times
  const completionHours = tasks
    .filter((t) => t.completedAt)
    .map((t) => {
      const date = (t.completedAt as admin.firestore.Timestamp).toDate();
      return date.getHours();
    });

  let bestCompletionTime = "morning";
  if (completionHours.length > 0) {
    const avgHour = completionHours.reduce((a, b) => a + b, 0) / completionHours.length;
    if (avgHour < 12) {
      bestCompletionTime = "morning";
    } else if (avgHour < 17) {
      bestCompletionTime = "afternoon";
    } else {
      bestCompletionTime = "evening";
    }
  }

  // Calculate average tasks per day
  const daysDiff = Math.ceil((now.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
  const averageTasksPerDay = tasks.length / Math.max(daysDiff, 1);

  // Analyze by day of week
  const dayCompletions: Record<number, number> = {};
  tasks.forEach((t) => {
    if (t.completedAt) {
      const date = (t.completedAt as admin.firestore.Timestamp).toDate();
      const day = date.getDay();
      dayCompletions[day] = (dayCompletions[day] || 0) + 1;
    }
  });

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let mostProductiveDay = "Monday";
  let maxCompletions = 0;
  Object.entries(dayCompletions).forEach(([day, count]) => {
    if (count > maxCompletions) {
      maxCompletions = count;
      mostProductiveDay = days[parseInt(day)];
    }
  });

  // Generate suggestions
  const suggestions: string[] = [];
  
  if (averageTasksPerDay < 2) {
    suggestions.push("Try to complete at least 2-3 tasks per day to build momentum!");
  }
  
  if (bestCompletionTime === "morning") {
    suggestions.push("You're most productive in the morning. Schedule important tasks early!");
  } else if (bestCompletionTime === "afternoon") {
    suggestions.push("Your peak productivity is in the afternoon. Plan accordingly!");
  }
  
  if (mostProductiveDay) {
    suggestions.push(`You're most productive on ${mostProductiveDay}s. Use this day for important tasks!`);
  }

  const pendingTasks = await admin
    .firestore()
    .collection("tasks")
    .where("userId", "==", userId)
    .where("status", "==", "pending")
    .get();

  if (pendingTasks.size > 10) {
    suggestions.push("You have many pending tasks. Consider breaking them into smaller tasks!");
  }

  return {
    bestCompletionTime,
    averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10,
    mostProductiveDay,
    suggestions,
  };
}

