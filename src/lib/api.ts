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

// Habit API (will be implemented in next step)
export const habitAPI = {
  getHabits: httpsCallable<{}, { habits: Habit[] }>(
    functions,
    "getHabits"
  ),
  createHabit: httpsCallable<any, Habit>(functions, "createHabit"),
  updateHabit: httpsCallable<any, Habit>(functions, "updateHabit"),
  deleteHabit: httpsCallable<any, { success: boolean }>(
    functions,
    "deleteHabit"
  ),
  completeHabit: httpsCallable<any, Habit>(functions, "completeHabit"),
};

