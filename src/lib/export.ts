import type { Task, Habit, Analytics } from "@/types";

/**
 * Export data as JSON
 */
export function exportAsJSON(data: {
  tasks: Task[];
  habits: Habit[];
  analytics?: Analytics[];
}): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Export tasks as CSV
 */
export function exportTasksAsCSV(tasks: Task[]): string {
  const headers = ["Title", "Status", "Priority", "Due Date", "Created At"];
  const rows = tasks.map((task) => [
    task.title,
    task.status,
    task.priority,
    task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
    new Date(task.createdAt).toLocaleDateString(),
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

/**
 * Export habits as CSV
 */
export function exportHabitsAsCSV(habits: Habit[]): string {
  const headers = ["Title", "Frequency", "Streak", "Longest Streak", "Created At"];
  const rows = habits.map((habit) => [
    habit.title,
    habit.frequency,
    habit.streak.toString(),
    habit.longestStreak.toString(),
    new Date(habit.createdAt).toLocaleDateString(),
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

