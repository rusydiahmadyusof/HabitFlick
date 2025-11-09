"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console or error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💥</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Critical Error
              </h1>
              <p className="text-gray-600 mb-6">
                A critical error occurred. Please refresh the page or contact
                support if the problem persists.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={reset} variant="primary">
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                >
                  Reload Page
                </Button>
              </div>
              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
                  <p className="text-sm font-semibold text-red-900 mb-2">
                    Error Details:
                  </p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}

