import { useEffect, useState } from "react";
import { firestoreTaskAPI } from "@/lib/firestoreApi";
import { useTaskStore } from "@/store/taskStore";
import type { Task, TaskStatus } from "@/types";

export function useTasks(status?: TaskStatus) {
  const { tasks, setTasks, addTask, updateTask, deleteTask: removeTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, [status]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await firestoreTaskAPI.getTasks(status, 100);
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: Date;
    tags?: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await firestoreTaskAPI.createTask(taskData);
      addTask(newTask);
      return newTask;
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskById = async (taskId: string, updates: Partial<Task>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await firestoreTaskAPI.updateTask(taskId, updates);
      updateTask(taskId, updatedTask);
      return updatedTask;
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreTaskAPI.deleteTask(taskId);
      removeTask(taskId);
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    setLoading(true);
    setError(null);
    try {
      const completedTask = await firestoreTaskAPI.completeTask(taskId);
      updateTask(taskId, completedTask);
      return completedTask;
    } catch (err: any) {
      setError(err.message || "Failed to complete task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask: updateTaskById,
    deleteTask,
    completeTask,
  };
}

