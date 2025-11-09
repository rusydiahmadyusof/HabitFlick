import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreDb, getFirebaseAuth } from "./firebase";
import type { Badge, Task, Habit } from "@/types";
import { BadgeType, BADGE_DEFINITIONS } from "./badges";

/**
 * Check and award badges based on user actions
 */

// Helper to get current user ID
function getUserId(): string {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }
  return auth.currentUser.uid;
}

// Helper to check if user already has a badge
// For "task_completed" badges, we check by taskId in metadata to allow multiple
async function hasBadge(userId: string, badgeType: BadgeType, taskId?: string): Promise<boolean> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, "badges"),
    where("userId", "==", userId),
    where("badgeType", "==", badgeType)
  );
  const snapshot = await getDocs(q);
  
  // For task_completed badges, check if this specific task already has a badge
  if (badgeType === "task_completed" && taskId) {
    const badges = snapshot.docs.map((doc) => doc.data());
    return badges.some((badge) => badge.metadata?.taskId === taskId);
  }
  
  return !snapshot.empty;
}

// Award a badge to the user
async function awardBadge(userId: string, badgeType: BadgeType, metadata?: Record<string, unknown>): Promise<Badge | null> {
  const db = getFirestoreDb();
  
  // For task_completed badges, check by taskId in metadata
  const taskId = metadata?.taskId as string | undefined;
  if (await hasBadge(userId, badgeType, taskId)) {
    return null; // Already earned, return null instead of throwing
  }

  const badgeData = {
    userId,
    badgeType,
    earnedAt: serverTimestamp(),
    metadata: metadata || {},
  };

  const docRef = await addDoc(collection(db, "badges"), badgeData);
  
  const badge = {
    id: docRef.id,
    userId,
    badgeType,
    earnedAt: new Date(),
    metadata,
  } as Badge;

  // Dispatch custom event for badge notification
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("badgeEarned", { detail: badge }));
  }

  return badge;
}

/**
 * Award base points for task completion
 */
export async function awardTaskCompletionPoints(task: Task): Promise<Badge | null> {
  const userId = getUserId();
  
  try {
    // Award base "task_completed" badge for each task completion (5 points)
    // This badge can be earned multiple times, so we create a unique badge for each task
    const badge = await awardBadge(userId, "task_completed", { taskId: task.id });
    return badge;
  } catch (error) {
    console.error("Error awarding task completion points:", error);
    return null;
  }
}

/**
 * Check badges when a task is completed
 */
export async function checkTaskCompletionBadges(task: Task): Promise<Badge[]> {
  const userId = getUserId();
  const awardedBadges: Badge[] = [];

  try {
    // Get all completed tasks
    const db = getFirestoreDb();
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      where("status", "==", "completed")
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const completedTasks = tasksSnapshot.docs.map((doc) => doc.data());

    const totalCompleted = completedTasks.length;

    // First task badge
    if (totalCompleted === 1 && !(await hasBadge(userId, "first_task"))) {
      const badge = await awardBadge(userId, "first_task");
      if (badge) awardedBadges.push(badge);
    }

    // Task master badges
    if (totalCompleted === 10 && !(await hasBadge(userId, "task_master_10"))) {
      const badge = await awardBadge(userId, "task_master_10");
      if (badge) awardedBadges.push(badge);
    }
    if (totalCompleted === 50 && !(await hasBadge(userId, "task_master_50"))) {
      const badge = await awardBadge(userId, "task_master_50");
      if (badge) awardedBadges.push(badge);
    }
    if (totalCompleted === 100 && !(await hasBadge(userId, "task_master_100"))) {
      const badge = await awardBadge(userId, "task_master_100");
      if (badge) awardedBadges.push(badge);
    }

    // Speed demon - completed within 1 hour of creation
    if (task.createdAt && task.completedAt) {
      const createdAt = task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt);
      const completedAt = task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
      const hoursDiff = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff <= 1 && !(await hasBadge(userId, "speed_demon"))) {
        const badge = await awardBadge(userId, "speed_demon", { taskId: task.id });
        if (badge) awardedBadges.push(badge);
      }
    }

    // Early bird / Night owl
    if (task.completedAt) {
      const completedAt = task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
      const hour = completedAt.getHours();

      if (hour < 9) {
        // Check for early bird
        const earlyTasks = completedTasks.filter((t) => {
          if (!t.completedAt) return false;
          const date = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
          return date.getHours() < 9;
        });

        if (earlyTasks.length >= 5 && !(await hasBadge(userId, "early_bird"))) {
          const badge = await awardBadge(userId, "early_bird");
          if (badge) awardedBadges.push(badge);
        }
      }

      if (hour >= 21) {
        // Check for night owl
        const nightTasks = completedTasks.filter((t) => {
          if (!t.completedAt) return false;
          const date = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
          return date.getHours() >= 21;
        });

        if (nightTasks.length >= 5 && !(await hasBadge(userId, "night_owl"))) {
          const badge = await awardBadge(userId, "night_owl");
          if (badge) awardedBadges.push(badge);
        }
      }
    }

    // Perfectionist - 10 tasks in a day
    if (task.completedAt) {
      const completedAt = task.completedAt instanceof Date ? task.completedAt : new Date(task.completedAt);
      const dayStart = new Date(completedAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(completedAt);
      dayEnd.setHours(23, 59, 59, 999);

      const dayTasks = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        const date = t.completedAt.toDate ? t.completedAt.toDate() : new Date(t.completedAt);
        return date >= dayStart && date <= dayEnd;
      });

      if (dayTasks.length >= 10 && !(await hasBadge(userId, "perfectionist"))) {
        const badge = await awardBadge(userId, "perfectionist", { date: completedAt.toISOString() });
        if (badge) awardedBadges.push(badge);
      }
    }
  } catch (error) {
    console.error("Error checking task badges:", error);
  }

  return awardedBadges;
}

/**
 * Check badges when a habit is created
 */
export async function checkHabitCreationBadges(): Promise<Badge[]> {
  const userId = getUserId();
  const awardedBadges: Badge[] = [];

  try {
    const db = getFirestoreDb();
    const habitsQuery = query(
      collection(db, "habits"),
      where("userId", "==", userId)
    );
    const habitsSnapshot = await getDocs(habitsQuery);
    const totalHabits = habitsSnapshot.docs.length;

    // First habit badge
    if (totalHabits === 1 && !(await hasBadge(userId, "first_habit"))) {
      const badge = await awardBadge(userId, "first_habit");
      if (badge) awardedBadges.push(badge);
    }
  } catch (error) {
    console.error("Error checking habit creation badges:", error);
  }

  return awardedBadges;
}

/**
 * Check badges when a habit is completed (streak-based)
 */
export async function checkHabitStreakBadges(habit: Habit): Promise<Badge[]> {
  const userId = getUserId();
  const awardedBadges: Badge[] = [];

  try {
    // Handle both 'streak' and 'currentStreak' field names
    const currentStreak = (habit as any).currentStreak || habit.streak || 0;
    const longestStreak = habit.longestStreak || 0;
    const streakToCheck = Math.max(currentStreak, longestStreak);

    // Streak badges
    if (streakToCheck >= 7 && !(await hasBadge(userId, "streak_master_7"))) {
      const badge = await awardBadge(userId, "streak_master_7", { habitId: habit.id, streak: streakToCheck });
      if (badge) awardedBadges.push(badge);
    }
    if (streakToCheck >= 30 && !(await hasBadge(userId, "streak_master_30"))) {
      const badge = await awardBadge(userId, "streak_master_30", { habitId: habit.id, streak: streakToCheck });
      if (badge) awardedBadges.push(badge);
    }
    if (streakToCheck >= 100 && !(await hasBadge(userId, "streak_master_100"))) {
      const badge = await awardBadge(userId, "streak_master_100", { habitId: habit.id, streak: streakToCheck });
      if (badge) awardedBadges.push(badge);
    }

    // Habit warrior badges (based on longest streak)
    if (longestStreak >= 7 && !(await hasBadge(userId, "habit_warrior_7"))) {
      const badge = await awardBadge(userId, "habit_warrior_7", { habitId: habit.id });
      if (badge) awardedBadges.push(badge);
    }
    if (longestStreak >= 30 && !(await hasBadge(userId, "habit_warrior_30"))) {
      const badge = await awardBadge(userId, "habit_warrior_30", { habitId: habit.id });
      if (badge) awardedBadges.push(badge);
    }
    if (longestStreak >= 100 && !(await hasBadge(userId, "habit_warrior_100"))) {
      const badge = await awardBadge(userId, "habit_warrior_100", { habitId: habit.id });
      if (badge) awardedBadges.push(badge);
    }
  } catch (error) {
    console.error("Error checking habit streak badges:", error);
  }

  return awardedBadges;
}

/**
 * Get all badges for the current user
 */
export async function getUserBadges(): Promise<Badge[]> {
  const userId = getUserId();
  const db = getFirestoreDb();

  const q = query(
    collection(db, "badges"),
    where("userId", "==", userId),
    orderBy("earnedAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      earnedAt: data.earnedAt?.toDate ? data.earnedAt.toDate() : (data.earnedAt ? new Date(data.earnedAt) : new Date()),
    };
  }) as Badge[];
}

/**
 * Calculate user level based on total points
 */
export function calculateLevel(totalPoints: number): { level: number; pointsToNext: number; currentLevelPoints: number; nextLevelPoints: number } {
  // Level formula: level = floor(sqrt(points / 100)) + 1
  // Points needed for level N: (N-1)^2 * 100
  const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;
  const currentLevelPoints = Math.pow(level - 1, 2) * 100;
  const nextLevelPoints = Math.pow(level, 2) * 100;
  const pointsToNext = nextLevelPoints - totalPoints;

  return { level, pointsToNext, currentLevelPoints, nextLevelPoints };
}

