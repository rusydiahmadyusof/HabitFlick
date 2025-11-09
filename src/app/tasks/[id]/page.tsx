"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import type { Task } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { updateTask, deleteTask, completeTask } = useTasks();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const db = getFirestoreDb();
      const taskDoc = await getDoc(doc(db, "tasks", taskId));
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        const loadedTask = {
          id: taskDoc.id,
          ...taskData,
          createdAt: taskData.createdAt?.toDate?.() || new Date(taskData.createdAt),
          updatedAt: taskData.updatedAt?.toDate?.() || new Date(taskData.updatedAt),
          dueDate: taskData.dueDate?.toDate?.() || (taskData.dueDate ? new Date(taskData.dueDate) : undefined),
          completedAt: taskData.completedAt?.toDate?.() || (taskData.completedAt ? new Date(taskData.completedAt) : undefined),
        } as Task;
        setTask(loadedTask);
        setFormData({
          title: loadedTask.title,
          description: loadedTask.description || "",
          priority: loadedTask.priority,
          dueDate: loadedTask.dueDate ? new Date(loadedTask.dueDate).toISOString().split("T")[0] : "",
        });
      }
    } catch (error) {
      console.error("Error loading task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!task) return;
    try {
      await updateTask(task.id, {
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });
      setEditing(false);
      loadTask();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(task.id);
      router.push("/tasks");
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    await completeTask(task.id);
    loadTask();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">Task not found</p>
          <Button onClick={() => router.push("/tasks")}>Back to Tasks</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/tasks")}>
            ← Back
          </Button>
          <div className="flex gap-2">
            {!editing && (
              <>
                {task.status !== "completed" && (
                  <Button onClick={handleComplete} variant="primary">
                    Mark Complete
                  </Button>
                )}
                <Button onClick={() => setEditing(true)} variant="secondary">
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="ghost">
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
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
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate}>Save</Button>
                <Button onClick={() => setEditing(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                {task.description && (
                  <p className="text-gray-600 mt-2">{task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <p className="font-semibold text-gray-900 capitalize">{task.priority}</p>
                </div>
                {task.dueDate && (
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(task.dueDate)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold text-gray-900">{formatDate(task.createdAt)}</p>
                </div>
                {task.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="font-semibold text-gray-900">{formatDate(task.completedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

