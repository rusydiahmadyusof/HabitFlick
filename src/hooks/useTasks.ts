import { useEffect, useState } from "react";
import { taskAPI } from "@/lib/api";
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
      const result = await taskAPI.getTasks({ status, limit: 100 });
      const fetchedTasks = result.data.tasks.map((task) => ({
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt as any) : new Date(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt as any) : new Date(),
        dueDate: task.dueDate ? new Date(task.dueDate as any) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt as any) : undefined,
      })) as Task[];
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
      const result = await taskAPI.createTask({
        ...taskData,
        dueDate: taskData.dueDate?.toISOString(),
      });
      const newTask = {
        ...result.data,
        createdAt: new Date(result.data.createdAt as any),
        updatedAt: new Date(result.data.updatedAt as any),
        dueDate: result.data.dueDate ? new Date(result.data.dueDate as any) : undefined,
      } as Task;
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
      const result = await taskAPI.updateTask({
        taskId,
        updates: {
          ...updates,
          dueDate: updates.dueDate instanceof Date ? updates.dueDate.toISOString() : updates.dueDate,
        },
      });
      const updatedTask = {
        ...result.data,
        createdAt: new Date(result.data.createdAt as any),
        updatedAt: new Date(result.data.updatedAt as any),
        dueDate: result.data.dueDate ? new Date(result.data.dueDate as any) : undefined,
        completedAt: result.data.completedAt ? new Date(result.data.completedAt as any) : undefined,
      } as Task;
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
      await taskAPI.deleteTask({ taskId });
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
      const result = await taskAPI.completeTask({ taskId });
      const completedTask = {
        ...result.data,
        createdAt: new Date(result.data.createdAt as any),
        updatedAt: new Date(result.data.updatedAt as any),
        completedAt: new Date(result.data.completedAt as any),
        dueDate: result.data.dueDate ? new Date(result.data.dueDate as any) : undefined,
      } as Task;
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

