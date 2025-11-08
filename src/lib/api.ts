import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "./firebase";
import type { Task, Habit } from "@/types";

const functions = getFunctions();

// Task API
export const taskAPI = {
  getTasks: httpsCallable<{ status?: string; limit?: number }, { tasks: Task[] }>(
    functions,
    "getTasks"
  ),
  createTask: httpsCallable<
    {
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      tags?: string[];
    },
    Task
  >(functions, "createTask"),
  updateTask: httpsCallable<
    { taskId: string; updates: Partial<Task> },
    Task
  >(functions, "updateTask"),
  deleteTask: httpsCallable<{ taskId: string }, { success: boolean }>(
    functions,
    "deleteTask"
  ),
  completeTask: httpsCallable<{ taskId: string }, Task>(
    functions,
    "completeTask"
  ),
};

// Habit API
export const habitAPI = {
  getHabits: httpsCallable<{}, { habits: Habit[] }>(
    functions,
    "getHabits"
  ),
  createHabit: httpsCallable<
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
  >(functions, "createHabit"),
  updateHabit: httpsCallable<
    { habitId: string; updates: Partial<Habit> },
    Habit
  >(functions, "updateHabit"),
  deleteHabit: httpsCallable<{ habitId: string }, { success: boolean }>(
    functions,
    "deleteHabit"
  ),
  completeHabit: httpsCallable<
    { habitId: string; notes?: string },
    Habit
  >(functions, "completeHabit"),
};

