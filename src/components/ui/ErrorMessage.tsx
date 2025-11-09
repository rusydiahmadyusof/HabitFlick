import { formatErrorForUser } from "@/lib/errorHandler";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error: unknown;
  className?: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({
  error,
  className,
  onDismiss,
}: ErrorMessageProps) {
  if (!error) return null;

  const message = formatErrorForUser(error);

  return (
    <div
      className={cn(
        "p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm",
        className
      )}
      role="alert"
    >
      <div className="flex items-start justify-between gap-2">
        <span>{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-700 hover:text-red-900 font-bold"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

