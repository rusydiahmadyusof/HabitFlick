import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = "md",
  text,
  className,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={cn(
          "animate-spin rounded-full border-b-2 border-blue-600",
          sizeClasses[size],
          className
        )}
      />
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

