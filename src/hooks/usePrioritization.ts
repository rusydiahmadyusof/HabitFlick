import { useState } from "react";
import { firestorePrioritizationAPI } from "@/lib/firestoreApi";
import type { Task } from "@/types";

export function usePrioritization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prioritizeTasks = async (taskIds?: string[], tasks?: Task[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firestorePrioritizationAPI.prioritizeTasks(taskIds, tasks);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to prioritize tasks");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestedOrder = async (tasks?: Task[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firestorePrioritizationAPI.getSuggestedOrder(tasks);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to get suggested order");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserInsights = async (tasks?: Task[]) => {
    setLoading(true);
    setError(null);
    try {
      const insights = await firestorePrioritizationAPI.getUserInsights(tasks);
      return insights;
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

