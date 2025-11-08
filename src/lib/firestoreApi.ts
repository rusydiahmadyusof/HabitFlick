import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirestoreDb, getFirebaseAuth } from "./firebase";
import type { Task, Habit, HabitLog } from "@/types";
import { calculatePriorityScore, sortTasksByPriority } from "./prioritization";

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

// Task API
export const firestoreTaskAPI = {
  async getTasks(status?: string, limitCount: number = 100): Promise<Task[]> {
    const db = getFirestoreDb();
    const userId = getUserId();
    
    let q = query(
      collection(db, "tasks"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    if (status) {
      q = query(
        collection(db, "tasks"),
        where("userId", "==", userId),
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      ) as any;
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt) || new Date(),
      updatedAt: timestampToDate(doc.data().updatedAt) || new Date(),
      dueDate: timestampToDate(doc.data().dueDate),
      completedAt: timestampToDate(doc.data().completedAt),
    })) as Task[];
  },

  async createTask(taskData: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: Date;
    tags?: string[];
  }): Promise<Task> {
    const db = getFirestoreDb();
    const userId = getUserId();

    const taskDoc = {
      userId,
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(taskData.dueDate && { dueDate: Timestamp.fromDate(taskData.dueDate) }),
      ...(taskData.tags && { tags: taskData.tags }),
    };

    const docRef = await addDoc(collection(db, "tasks"), taskDoc);
    const docSnap = await getDoc(docRef);
    
    return {
      id: docRef.id,
      ...docSnap.data(),
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: taskData.dueDate,
    } as Task;
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const db = getFirestoreDb();
    const userId = getUserId();

    const taskRef = doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    const taskData = taskDoc.data();
    if (taskData.userId !== userId) {
      throw new Error("Not authorized to update this task");
    }

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.dueDate instanceof Date) {
      updateData.dueDate = Timestamp.fromDate(updates.dueDate);
    }

    await updateDoc(taskRef, updateData);
    const updatedDoc = await getDoc(taskRef);

    const data = updatedDoc.data();
    if (!data) {
      throw new Error("Task data not found");
    }
    
    return {
      id: updatedDoc.id,
      ...data,
      createdAt: timestampToDate(data.createdAt) || new Date(),
      updatedAt: new Date(),
      dueDate: timestampToDate(data.dueDate),
      completedAt: timestampToDate(data.completedAt),
    } as Task;
  },

  async deleteTask(taskId: string): Promise<void> {
    const db = getFirestoreDb();
    const userId = getUserId();

    const taskRef = doc(db, "tasks", taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) {
      throw new Error("Task not found");
    }

    if (taskDoc.data().userId !== userId) {
      throw new Error("Not authorized to delete this task");
    }

    await deleteDoc(taskRef);
  },

  async completeTask(taskId: string): Promise<Task> {
    const completedTask = await this.updateTask(taskId, {
      status: "completed",
      completedAt: new Date(),
    } as any);
    
    // Award base points for task completion (async, don't wait)
    import("./gamificationService").then(({ awardTaskCompletionPoints }) => {
      awardTaskCompletionPoints(completedTask).catch(console.error);
    });
    
    // Check for badges (async, don't wait)
    import("./gamificationService").then(({ checkTaskCompletionBadges }) => {
      checkTaskCompletionBadges(completedTask).catch(console.error);
    });
    
    return completedTask;
  },
};

// Habit API
export const firestoreHabitAPI = {
  async getHabits(): Promise<Habit[]> {
    const db = getFirestoreDb();
    const userId = getUserId();

    const q = query(
      collection(db, "habits"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToDate(doc.data().createdAt) || new Date(),
      lastCompleted: timestampToDate(doc.data().lastCompleted),
    })) as Habit[];
  },

  async createHabit(habitData: {
    title: string;
    description?: string;
    frequency: "daily" | "weekly" | "custom";
    customSchedule?: {
      daysOfWeek: number[];
      timesOfDay?: string[];
    };
  }): Promise<Habit> {
    const db = getFirestoreDb();
    const userId = getUserId();

    const habitDoc = {
      userId,
      title: habitData.title,
      description: habitData.description || "",
      frequency: habitData.frequency,
      ...(habitData.customSchedule && { customSchedule: habitData.customSchedule }),
      currentStreak: 0,
      longestStreak: 0,
      createdAt: serverTimestamp(),
      lastCompleted: null,
    };

    const docRef = await addDoc(collection(db, "habits"), habitDoc);
    const docSnap = await getDoc(docRef);

    const createdHabitData = docSnap.data();
    if (!createdHabitData) {
      throw new Error("Habit data not found");
    }
    
    const newHabit = {
      id: docRef.id,
      userId: createdHabitData.userId as string,
      title: createdHabitData.title as string,
      description: (createdHabitData.description || "") as string,
      frequency: createdHabitData.frequency as "daily" | "weekly" | "custom",
      customSchedule: createdHabitData.customSchedule,
      createdAt: new Date(),
      currentStreak: 0,
      longestStreak: 0,
      streak: 0,
      archived: (createdHabitData.archived || false) as boolean,
      lastCompleted: createdHabitData.lastCompleted ? timestampToDate(createdHabitData.lastCompleted) : undefined,
    } as Habit;
    
    // Check for badges (async, don't wait)
    import("./gamificationService").then(({ checkHabitCreationBadges }) => {
      checkHabitCreationBadges().catch(console.error);
    });
    
    return newHabit;
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const db = getFirestoreDb();
    const userId = getUserId();

    const habitRef = doc(db, "habits", habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) {
      throw new Error("Habit not found");
    }

    if (habitDoc.data().userId !== userId) {
      throw new Error("Not authorized to update this habit");
    }

    const updateData: any = { ...updates };
    if (updates.lastCompleted instanceof Date) {
      updateData.lastCompleted = Timestamp.fromDate(updates.lastCompleted);
    }

    await updateDoc(habitRef, updateData);
    const updatedDoc = await getDoc(habitRef);
    const updatedHabitData = updatedDoc.data();
    
    if (!updatedHabitData) {
      throw new Error("Habit data not found");
    }

    return {
      id: updatedDoc.id,
      userId: updatedHabitData.userId as string,
      title: updatedHabitData.title as string,
      description: (updatedHabitData.description || "") as string,
      frequency: updatedHabitData.frequency as "daily" | "weekly" | "custom",
      customSchedule: updatedHabitData.customSchedule,
      createdAt: timestampToDate(updatedHabitData.createdAt) || new Date(),
      lastCompleted: timestampToDate(updatedHabitData.lastCompleted),
      streak: (updatedHabitData.streak || updatedHabitData.currentStreak || 0) as number,
      longestStreak: (updatedHabitData.longestStreak || 0) as number,
      archived: (updatedHabitData.archived || false) as boolean,
    } as Habit;
  },

  async deleteHabit(habitId: string): Promise<void> {
    const db = getFirestoreDb();
    const userId = getUserId();

    const habitRef = doc(db, "habits", habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) {
      throw new Error("Habit not found");
    }

    if (habitDoc.data().userId !== userId) {
      throw new Error("Not authorized to delete this habit");
    }

    await deleteDoc(habitRef);
  },

  async completeHabit(habitId: string, notes?: string): Promise<Habit> {
    const db = getFirestoreDb();
    const userId = getUserId();

    // Get habit
    const habitRef = doc(db, "habits", habitId);
    const habitDoc = await getDoc(habitRef);

    if (!habitDoc.exists()) {
      throw new Error("Habit not found");
    }

    const existingHabitData = habitDoc.data();
    if (!existingHabitData || existingHabitData.userId !== userId) {
      throw new Error("Not authorized to complete this habit");
    }

    // Log completion
    await addDoc(collection(db, "habitLogs"), {
      habitId,
      userId,
      completedAt: serverTimestamp(),
      notes: notes || "",
    });

    // Calculate streak
    const lastCompleted = timestampToDate(existingHabitData.lastCompleted);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = (existingHabitData.currentStreak || 0) as number;
    let longestStreak = (existingHabitData.longestStreak || 0) as number;

    if (lastCompleted) {
      const lastDate = new Date(lastCompleted);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak = (currentStreak || 0) + 1;
      } else if (daysDiff === 0) {
        // Already completed today, don't increment
      } else {
        // Streak broken
        currentStreak = 1;
      }
    } else {
      // First completion
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    // Update habit
    await updateDoc(habitRef, {
      lastCompleted: Timestamp.fromDate(today),
      currentStreak,
      longestStreak,
    });

    const updatedDoc = await getDoc(habitRef);
    const completedHabitData = updatedDoc.data();
    if (!completedHabitData) {
      throw new Error("Habit data not found");
    }
    
    const updatedHabit = {
      id: updatedDoc.id,
      userId: completedHabitData.userId as string,
      title: completedHabitData.title as string,
      description: (completedHabitData.description || "") as string,
      frequency: completedHabitData.frequency as "daily" | "weekly" | "custom",
      customSchedule: completedHabitData.customSchedule,
      createdAt: timestampToDate(completedHabitData.createdAt) || new Date(),
      lastCompleted: today,
      currentStreak,
      longestStreak,
      streak: currentStreak,
      archived: (completedHabitData.archived || false) as boolean,
    } as Habit;
    
    // Check for badges (async, don't wait)
    import("./gamificationService").then(({ checkHabitStreakBadges }) => {
      checkHabitStreakBadges(updatedHabit).catch(console.error);
    });
    
    return updatedHabit;
  },
};

// Prioritization API (client-side)
// Accepts optional tasks parameter to avoid redundant queries
export const firestorePrioritizationAPI = {
  async prioritizeTasks(taskIds?: string[], tasks?: Task[]): Promise<Task[]> {
    let taskList = tasks;
    if (!taskList || !Array.isArray(taskList)) {
      taskList = await firestoreTaskAPI.getTasks();
    }
    if (!Array.isArray(taskList)) {
      taskList = [];
    }
    let filteredTasks = taskList.filter((t) => t.status === "pending" || t.status === "in-progress");

    if (taskIds && taskIds.length > 0) {
      filteredTasks = filteredTasks.filter((t) => taskIds.includes(t.id));
    }

    return sortTasksByPriority(filteredTasks);
  },

  async getSuggestedOrder(tasks?: Task[]): Promise<{
    morning: Task[];
    afternoon: Task[];
    evening: Task[];
  }> {
    let taskList = tasks;
    if (!taskList || !Array.isArray(taskList)) {
      taskList = await firestoreTaskAPI.getTasks();
    }
    if (!Array.isArray(taskList)) {
      taskList = [];
    }
    const pendingTasks = taskList.filter((t) => t.status === "pending" || t.status === "in-progress");
    const sorted = sortTasksByPriority(pendingTasks);

    const morning: Task[] = [];
    const afternoon: Task[] = [];
    const evening: Task[] = [];

    sorted.forEach((task) => {
      const score = calculatePriorityScore(task);
      if (score >= 150) {
        morning.push(task);
      } else if (score >= 80) {
        afternoon.push(task);
      } else {
        evening.push(task);
      }
    });

    return { morning, afternoon, evening };
  },

  async getUserInsights(tasks?: Task[]): Promise<{
    bestCompletionTime: string;
    averageTasksPerDay: number;
    mostProductiveDay: string;
    suggestions: string[];
  }> {
    let taskList = tasks;
    if (!taskList || !Array.isArray(taskList)) {
      taskList = await firestoreTaskAPI.getTasks();
    }
    if (!Array.isArray(taskList)) {
      taskList = [];
    }
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completedTasks = taskList.filter(
      (t) => t.status === "completed" && t.completedAt && t.completedAt >= thirtyDaysAgo
    );

    // Analyze completion times
    const completionHours = completedTasks
      .filter((t) => t.completedAt)
      .map((t) => new Date(t.completedAt!).getHours());

    let bestCompletionTime = "morning";
    if (completionHours.length > 0) {
      const avgHour = completionHours.reduce((a, b) => a + b, 0) / completionHours.length;
      if (avgHour < 12) {
        bestCompletionTime = "morning";
      } else if (avgHour < 17) {
        bestCompletionTime = "afternoon";
      } else {
        bestCompletionTime = "evening";
      }
    }

    const daysDiff = Math.ceil((now.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
    const averageTasksPerDay = completedTasks.length / Math.max(daysDiff, 1);

    // Analyze by day of week
    const dayCompletions: Record<number, number> = {};
    completedTasks.forEach((t) => {
      if (t.completedAt) {
        const day = new Date(t.completedAt).getDay();
        dayCompletions[day] = (dayCompletions[day] || 0) + 1;
      }
    });

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let mostProductiveDay = "Monday";
    let maxCompletions = 0;
    Object.entries(dayCompletions).forEach(([day, count]) => {
      if (count > maxCompletions) {
        maxCompletions = count;
        mostProductiveDay = days[parseInt(day)];
      }
    });

    const suggestions: string[] = [];
    if (averageTasksPerDay < 2) {
      suggestions.push("Try to complete at least 2-3 tasks per day to build momentum!");
    }
    if (bestCompletionTime === "morning") {
      suggestions.push("You're most productive in the morning. Schedule important tasks early!");
    } else if (bestCompletionTime === "afternoon") {
      suggestions.push("Your peak productivity is in the afternoon. Plan accordingly!");
    }
    if (mostProductiveDay) {
      suggestions.push(`You're most productive on ${mostProductiveDay}s. Use this day for important tasks!`);
    }

    const pendingTasks = taskList.filter((t) => t.status === "pending");
    if (pendingTasks.length > 10) {
      suggestions.push("You have many pending tasks. Consider breaking them into smaller tasks!");
    }

    return {
      bestCompletionTime,
      averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10,
      mostProductiveDay,
      suggestions,
    };
  },
};

