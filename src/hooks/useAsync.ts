import { useState, useCallback } from "react";

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncReturn<T, P extends any[] = []> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: P) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Reusable hook for async operations with loading and error states
 */
export function useAsync<T, P extends any[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  immediate = false
): UseAsyncReturn<T, P> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: P): Promise<T | undefined> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const data = await asyncFunction(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        throw err;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

