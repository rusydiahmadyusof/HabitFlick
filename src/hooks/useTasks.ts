import { useEffect, useState, useCallback } from "react";
import { firestoreTaskAPI } from "@/lib/firestoreApi";
import { useTaskStore } from "@/store/taskStore";
import { formatErrorForUser, logError } from "@/lib/errorHandler";
import type { Task, TaskStatus } from "@/types";

export function useTasks(status?: TaskStatus) {
  const { tasks, setTasks, addTask, updateTask, deleteTask: removeTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await firestoreTaskAPI.getTasks(status, 100);
      setTasks(fetchedTasks);
    } catch (err) {
      const errorMessage = formatErrorForUser(err);
      setError(errorMessage);
      logError(err, "useTasks.loadTasks");
    } finally {
      setLoading(false);
    }
  }, [status, setTasks]);

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
    } catch (err) {
      const errorMessage = formatErrorForUser(err);
      setError(errorMessage);
      logError(err, "useTasks.createTask");
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
    } catch (err) {
      const errorMessage = formatErrorForUser(err);
      setError(errorMessage);
      logError(err, "useTasks.updateTask");
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
    } catch (err) {
      const errorMessage = formatErrorForUser(err);
      setError(errorMessage);
      logError(err, "useTasks.deleteTask");
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
    } catch (err) {
      const errorMessage = formatErrorForUser(err);
      setError(errorMessage);
      logError(err, "useTasks.completeTask");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

