/**
 * All features are now free - no limitations
 */
export const FREE_TIER_LIMITS = {
  maxTasks: Infinity,
  maxHabits: Infinity,
  analyticsEnabled: true,
  exportEnabled: true,
  advancedBadges: true,
  socialLeaderboard: true,
  customThemes: true,
};

/**
 * Check if user has reached free tier limit (always returns false - unlimited)
 */
export function checkFreeTierLimit(
  currentCount: number,
  limitType: "tasks" | "habits"
): boolean {
  return false; // No limits - all features free
}

/**
 * Get limit message for free tier (no longer needed)
 */
export function getLimitMessage(limitType: "tasks" | "habits"): string {
  return ""; // No limits
}

