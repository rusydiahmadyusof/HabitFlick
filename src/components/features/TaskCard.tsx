import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Task } from "@/types";
import { formatDate } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
}

export default function TaskCard({
  task,
  onComplete,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-yellow-500",
    low: "border-l-green-500",
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card
      variant="outlined"
      className={`border-l-4 ${priorityColors[task.priority]} ${
        task.status === "completed" ? "opacity-60" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Link href={`/tasks/${task.id}`}>
              <h3
                className={`font-semibold text-lg hover:text-blue-600 cursor-pointer ${
                  task.status === "completed" ? "line-through" : ""
                }`}
              >
                {task.title}
              </h3>
            </Link>
            {task.description && (
              <p className="text-gray-600 text-sm mt-1">{task.description}</p>
            )}
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              task.status === "completed"
                ? "bg-green-100 text-green-800"
                : task.status === "in-progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {task.status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          {task.dueDate && (
            <span>
              Due: {formatDate(task.dueDate)}
            </span>
          )}
          <span className="capitalize">Priority: {task.priority}</span>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {task.status !== "completed" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onComplete(task.id)}
            >
              Complete
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

