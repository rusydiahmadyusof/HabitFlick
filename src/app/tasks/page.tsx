"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/components/features/TaskCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import type { Task } from "@/types";

export default function TasksPage() {
  const { tasks, loading, error, createTask, deleteTask, completeTask } =
    useTasks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });
      setFormData({ title: "", description: "", priority: "medium", dueDate: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingTasks = (tasks || []).filter((t) => t.status === "pending");
  const inProgressTasks = (tasks || []).filter((t) => t.status === "in-progress");
  const completedTasks = (tasks || []).filter((t) => t.status === "completed");

  if (loading && (!tasks || tasks.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Cancel" : "Add Task"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter task title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as "low" | "medium" | "high",
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-6">
        {pendingTasks.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Pending ({pendingTasks.length})
            </h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </section>
        )}

        {inProgressTasks.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              In Progress ({inProgressTasks.length})
            </h2>
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </section>
        )}

        {completedTasks.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </section>
        )}

        {tasks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No tasks yet. Create your first task!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

