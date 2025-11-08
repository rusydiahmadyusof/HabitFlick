import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { getFirestoreDb, getFirebaseAuth } from "./firebase";
import type { Task, Habit, Analytics } from "@/types";

// Helper to get current user ID
function getUserId(): string {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) {
    throw new Error("User must be authenticated");
  }
  return auth.currentUser.uid;
}

// Helper to convert Firestore timestamp to Date
function timestampToDate(timestamp: any): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
}

/**
 * Record daily analytics
 */
export async function recordDailyAnalytics(): Promise<Analytics> {
  const db = getFirestoreDb();
  const userId = getUserId();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tasks for today
  const tasksQuery = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );
  const tasksSnapshot = await getDocs(tasksQuery);
  const allTasks = (tasksSnapshot?.docs || []).map((doc) => ({
    id: doc.id,
    ...doc.data(),
    completedAt: timestampToDate(doc.data().completedAt),
  }));

  const todayTasks = (allTasks || []).filter((task) => {
    if (!task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });

  // Get habits completed today
  const habitsQuery = query(
    collection(db, "habits"),
    where("userId", "==", userId)
  );
  const habitsSnapshot = await getDocs(habitsQuery);
  const allHabits = (habitsSnapshot?.docs || []).map((doc) => doc.data());

  const todayHabits = (allHabits || []).filter((habit) => {
    if (!habit.lastCompleted) return false;
    const lastCompleted = timestampToDate(habit.lastCompleted);
    if (!lastCompleted) return false;
    const completedDate = new Date(lastCompleted);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });

  // Calculate productivity score (0-100)
  const totalTasks = (allTasks || []).filter((t) => t.status !== "archived").length;
  const completedTasks = (allTasks || []).filter((t) => t.status === "completed").length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalHabits = (allHabits || []).length;
  const activeHabits = (allHabits || []).filter((h) => !h.archived).length;
  const habitCompletionRate = activeHabits > 0 ? (todayHabits.length / activeHabits) * 100 : 0;

  const productivityScore = Math.round((taskCompletionRate * 0.6 + habitCompletionRate * 0.4));

  const analyticsData = {
    userId,
    date: Timestamp.fromDate(today),
    tasksCompleted: todayTasks.length,
    tasksTotal: totalTasks,
    habitsCompleted: todayHabits.length,
    habitsTotal: activeHabits,
    productivityScore,
  };

  // Check if analytics already exists for today
  const existingQuery = query(
    collection(db, "analytics"),
    where("userId", "==", userId),
    where("date", ">=", Timestamp.fromDate(new Date(today.getTime() - 1000))),
    where("date", "<=", Timestamp.fromDate(new Date(today.getTime() + 86400000))),
    limit(1)
  );
  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    // Return existing analytics for today
    const doc = existingSnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: timestampToDate(data.date) || today,
    } as Analytics;
  } else {
    // Create new
    const docRef = await addDoc(collection(db, "analytics"), analyticsData);
    return {
      id: docRef.id,
      ...analyticsData,
      date: today,
    } as Analytics;
  }
}

/**
 * Get analytics for a date range
 */
export async function getAnalytics(
  startDate: Date,
  endDate: Date
): Promise<Analytics[]> {
  const db = getFirestoreDb();
  const userId = getUserId();

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "analytics"),
    where("userId", "==", userId),
    where("date", ">=", Timestamp.fromDate(start)),
    where("date", "<=", Timestamp.fromDate(end)),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: timestampToDate(doc.data().date) || new Date(),
  })) as Analytics[];
}

/**
 * Get analytics summary (last 30 days)
 */
export async function getAnalyticsSummary(): Promise<{
  totalTasksCompleted: number;
  totalHabitsCompleted: number;
  averageProductivityScore: number;
  bestDay: { date: Date; score: number } | null;
  completionTrend: { date: string; tasks: number; habits: number }[];
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const analytics = await getAnalytics(startDate, endDate);

  const totalTasksCompleted = analytics.reduce((sum, a) => sum + a.tasksCompleted, 0);
  const totalHabitsCompleted = analytics.reduce((sum, a) => sum + a.habitsCompleted, 0);
  const averageProductivityScore =
    analytics.length > 0
      ? Math.round(
          analytics.reduce((sum, a) => sum + (a.productivityScore || 0), 0) /
            analytics.length
        )
      : 0;

  let bestDay: { date: Date; score: number } | null = null;
  analytics.forEach((a) => {
    const score = a.productivityScore || 0;
    if (!bestDay || score > bestDay.score) {
      bestDay = {
        date: a.date instanceof Date ? a.date : new Date(a.date),
        score,
      };
    }
  });

  const completionTrend = analytics.map((a) => ({
    date: (a.date instanceof Date ? a.date : new Date(a.date)).toLocaleDateString(),
    tasks: a.tasksCompleted,
    habits: a.habitsCompleted,
  }));

  return {
    totalTasksCompleted,
    totalHabitsCompleted,
    averageProductivityScore,
    bestDay,
    completionTrend,
  };
}

