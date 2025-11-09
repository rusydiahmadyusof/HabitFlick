"use client";

import { useEffect } from "react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-6">
            {error.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="primary">
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="secondary"
            >
              Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && error.digest && (
            <p className="mt-4 text-xs text-gray-500">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

