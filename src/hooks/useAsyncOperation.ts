import { useState, useCallback } from "react";
import { formatErrorForUser, logError } from "@/lib/errorHandler";

interface UseAsyncOperationState {
  loading: boolean;
  error: string | null;
}

interface UseAsyncOperationReturn<T> {
  loading: boolean;
  error: string | null;
  execute: (operation: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Reusable hook for async operations with consistent error handling
 */
export function useAsyncOperation<T>(): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<UseAsyncOperationState>({
    loading: false,
    error: null,
  });

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | undefined> => {
    setState({ loading: true, error: null });
    try {
      const result = await operation();
      setState({ loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = formatErrorForUser(error);
      logError(error, "useAsyncOperation");
      setState({ loading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

