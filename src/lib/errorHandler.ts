/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  timestamp: Date;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

/**
 * Extract error code from various error types
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) {
    return error.code;
  }
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }
  return undefined;
}

/**
 * Check if error is a Firebase auth error
 */
export function isAuthError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code?.startsWith("auth/") ?? false;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  const code = getErrorCode(error);
  return code === "network-error" || error instanceof TypeError;
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  if (isAuthError(error)) {
    const code = getErrorCode(error);
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/email-already-in-use":
        return "This email is already registered";
      case "auth/weak-password":
        return "Password is too weak";
      case "auth/invalid-email":
        return "Invalid email address";
      default:
        return "Authentication failed. Please try again.";
    }
  }

  if (isNetworkError(error)) {
    return "Network error. Please check your connection and try again.";
  }

  return getErrorMessage(error);
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const errorInfo: ErrorInfo = {
    message,
    code,
    timestamp: new Date(),
  };

  if (context) {
    console.error(`[${context}]`, errorInfo, error);
  } else {
    console.error(errorInfo, error);
  }

  // In production, you might want to send to error tracking service
  // e.g., Sentry, LogRocket, etc.
}

