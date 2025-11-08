import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "./firebase";
import type { Task, Habit } from "@/types";

// Lazy initialization - get functions when needed
function getFunctions() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Functions can only be used in the browser");
  }
  return getFirebaseFunctions();
}

// Helper to create callable functions lazily
function createCallable<TRequest, TResponse>(
  name: string
): (data: TRequest) => Promise<{ data: TResponse }> {
  return (data: TRequest) => {
    const callable = httpsCallable<TRequest, TResponse>(getFunctions(), name);
    return callable(data);
  };
}

// Task API
export const taskAPI = {
  getTasks: createCallable<{ status?: string; limit?: number }, { tasks: Task[] }>("getTasks"),
  createTask: createCallable<
    {
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      tags?: string[];
    },
    Task
  >("createTask"),
  updateTask: createCallable<
    { taskId: string; updates: Partial<Task> },
    Task
  >("updateTask"),
  deleteTask: createCallable<{ taskId: string }, { success: boolean }>("deleteTask"),
  completeTask: createCallable<{ taskId: string }, Task>("completeTask"),
};

// Habit API
export const habitAPI = {
  getHabits: createCallable<{}, { habits: Habit[] }>("getHabits"),
  createHabit: createCallable<
    {
      title: string;
      description?: string;
      frequency: "daily" | "weekly" | "custom";
      customSchedule?: {
        daysOfWeek: number[];
        timesOfDay?: string[];
      };
    },
    Habit
  >("createHabit"),
  updateHabit: createCallable<
    { habitId: string; updates: Partial<Habit> },
    Habit
  >("updateHabit"),
  deleteHabit: createCallable<{ habitId: string }, { success: boolean }>("deleteHabit"),
  completeHabit: createCallable<
    { habitId: string; notes?: string },
    Habit
  >("completeHabit"),
};

// Prioritization API
export const prioritizationAPI = {
  prioritizeTasks: createCallable<
    { taskIds?: string[] },
    { tasks: Task[] }
  >("prioritizeTasks"),
  getSuggestedOrder: createCallable<
    {},
    { morning: Task[]; afternoon: Task[]; evening: Task[] }
  >("getSuggestedOrder"),
  getUserInsights: createCallable<
    {},
    {
      bestCompletionTime: string;
      averageTasksPerDay: number;
      mostProductiveDay: string;
      suggestions: string[];
    }
  >("getUserInsights"),
};

