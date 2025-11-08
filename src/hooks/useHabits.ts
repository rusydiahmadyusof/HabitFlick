import { useEffect, useState } from "react";
import { habitAPI } from "@/lib/api";
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
      const result = await habitAPI.getHabits({});
      const fetchedHabits = result.data.habits.map((habit) => ({
        ...habit,
        createdAt: habit.createdAt ? new Date(habit.createdAt as any) : new Date(),
        lastCompleted: habit.lastCompleted ? new Date(habit.lastCompleted as any) : undefined,
      })) as Habit[];
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
      const result = await habitAPI.createHabit(habitData);
      const newHabit = {
        ...result.data,
        createdAt: new Date(result.data.createdAt as any),
        lastCompleted: result.data.lastCompleted ? new Date(result.data.lastCompleted as any) : undefined,
      } as Habit;
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
      const result = await habitAPI.updateHabit({ habitId, updates });
      const updatedHabit = {
        ...result.data,
        createdAt: new Date(result.data.createdAt as any),
        lastCompleted: result.data.lastCompleted ? new Date(result.data.lastCompleted as any) : undefined,
      } as Habit;
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
      await habitAPI.deleteHabit({ habitId });
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
      const result = await habitAPI.completeHabit({ habitId, notes });
      const completedHabit = {
        ...result.data,
        createdAt: new Date(result.data.createdAt as any),
        lastCompleted: new Date(result.data.lastCompleted as any),
      } as Habit;
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

