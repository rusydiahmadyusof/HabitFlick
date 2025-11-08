import { useEffect, useState } from "react";
import { firestoreHabitAPI } from "@/lib/firestoreApi";
import { useHabitStore } from "@/store/habitStore";
import type { Habit } from "@/types";

export function useHabits() {
  const { habits, setHabits, addHabit, updateHabit, deleteHabit: removeHabit } = useHabitStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedHabits = await firestoreHabitAPI.getHabits();
      setHabits(fetchedHabits);
    } catch (err: any) {
      setError(err.message || "Failed to load habits");
      console.error("Error loading habits:", err);
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habitData: {
    title: string;
    description?: string;
    frequency: "daily" | "weekly" | "custom";
    customSchedule?: {
      daysOfWeek: number[];
      timesOfDay?: string[];
    };
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newHabit = await firestoreHabitAPI.createHabit(habitData);
      addHabit(newHabit);
      return newHabit;
    } catch (err: any) {
      setError(err.message || "Failed to create habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHabitById = async (habitId: string, updates: Partial<Habit>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedHabit = await firestoreHabitAPI.updateHabit(habitId, updates);
      updateHabit(habitId, updatedHabit);
      return updatedHabit;
    } catch (err: any) {
      setError(err.message || "Failed to update habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreHabitAPI.deleteHabit(habitId);
      removeHabit(habitId);
    } catch (err: any) {
      setError(err.message || "Failed to delete habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeHabit = async (habitId: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const completedHabit = await firestoreHabitAPI.completeHabit(habitId, notes);
      updateHabit(habitId, completedHabit);
      return completedHabit;
    } catch (err: any) {
      setError(err.message || "Failed to complete habit");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    habits,
    loading,
    error,
    loadHabits,
    createHabit,
    updateHabit: updateHabitById,
    deleteHabit,
    completeHabit,
  };
}

