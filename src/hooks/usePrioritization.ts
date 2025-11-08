import { useState } from "react";
import { prioritizationAPI } from "@/lib/api";
import type { Task } from "@/types";

export function usePrioritization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prioritizeTasks = async (taskIds?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await prioritizationAPI.prioritizeTasks({ taskIds });
      const tasks = result.data.tasks.map((task) => ({
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt as any) : new Date(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt as any) : new Date(),
        dueDate: task.dueDate ? new Date(task.dueDate as any) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt as any) : undefined,
      })) as Task[];
      return tasks;
    } catch (err: any) {
      setError(err.message || "Failed to prioritize tasks");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await prioritizationAPI.getSuggestedOrder({});
      const formatTasks = (tasks: any[]) =>
        tasks.map((task) => ({
          ...task,
          createdAt: task.createdAt ? new Date(task.createdAt as any) : new Date(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt as any) : new Date(),
          dueDate: task.dueDate ? new Date(task.dueDate as any) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt as any) : undefined,
        })) as Task[];

      return {
        morning: formatTasks(result.data.morning),
        afternoon: formatTasks(result.data.afternoon),
        evening: formatTasks(result.data.evening),
      };
    } catch (err: any) {
      setError(err.message || "Failed to get suggested order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await prioritizationAPI.getUserInsights({});
      return result.data;
    } catch (err: any) {
      setError(err.message || "Failed to get user insights");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    prioritizeTasks,
    getSuggestedOrder,
    getUserInsights,
  };
}

