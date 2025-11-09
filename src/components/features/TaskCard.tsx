import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { Task } from "@/types";
import { formatDate, cn } from "@/lib/utils";

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

  const priorityColorMap = {
    high: "border-l-error-500 bg-error-50/50 dark:bg-error-900/10",
    medium: "border-l-warning-500 bg-warning-50/50 dark:bg-warning-900/10",
    low: "border-l-success-500 bg-success-50/50 dark:bg-success-900/10",
  };

  return (
    <Card
      variant="outlined"
      className={cn(
        "border-l-4 transition-all duration-200 hover:shadow-md",
        priorityColorMap[task.priority],
        task.status === "completed" && "opacity-75"
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={`/tasks/${task.id}`}>
              <h3
                className={cn(
                  "font-semibold text-base sm:text-lg hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors break-words",
                  task.status === "completed" && "line-through text-neutral-500 dark:text-neutral-500"
                )}
              >
                {task.title}
              </h3>
            </Link>
            {task.description && (
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm mt-1.5 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <span
            className={cn(
              "px-2 sm:px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0",
              task.status === "completed"
                ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300"
                : task.status === "in-progress"
                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                : "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
            )}
          >
            {task.status}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-3">
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <span>📅</span>
              <span className="truncate">Due: {formatDate(task.dueDate)}</span>
            </span>
          )}
          <span className="capitalize flex items-center gap-1">
            <span>⚡</span>
            {task.priority} priority
          </span>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          {task.status !== "completed" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onComplete(task.id)}
              className="flex-1 sm:flex-initial min-w-[100px]"
            >
              Complete
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(task)}
              className="flex-1 sm:flex-initial min-w-[80px]"
            >
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting}
            isLoading={isDeleting}
            className="flex-1 sm:flex-initial min-w-[80px]"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

