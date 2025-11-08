import { useState } from "react";
import { firestorePrioritizationAPI } from "@/lib/firestoreApi";
import type { Task } from "@/types";

export function usePrioritization() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prioritizeTasks = async (taskIds?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const tasks = await firestorePrioritizationAPI.prioritizeTasks(taskIds);
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
      const result = await firestorePrioritizationAPI.getSuggestedOrder();
      return result;
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
      const insights = await firestorePrioritizationAPI.getUserInsights();
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

