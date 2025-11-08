export type TaskStatus = "pending" | "in-progress" | "completed" | "archived";
export type TaskPriority = "low" | "medium" | "high";
export type HabitFrequency = "daily" | "weekly" | "custom";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date | string;
  completedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags?: string[];
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  customSchedule?: {
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    timesOfDay?: string[];
  };
  streak: number;
  longestStreak: number;
  lastCompleted?: Date | string;
  createdAt: Date | string;
  archived: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date | string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date | string;
  premium: boolean;
  premiumExpiresAt?: Date | string;
  stripeCustomerId?: string;
  leaderboardOptIn: boolean;
  preferences: {
    theme: "light" | "dark" | "auto";
    notifications: boolean;
    defaultView: "dashboard" | "tasks" | "habits";
  };
  stats: {
    totalTasksCompleted: number;
    totalHabitsCompleted: number;
    currentStreak: number;
    totalPoints?: number;
  };
}

export interface Badge {
  id: string;
  userId: string;
  badgeType: string;
  earnedAt: Date | string;
  metadata?: Record<string, unknown>;
}

export interface Analytics {
  id: string;
  userId: string;
  date: Date | string;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  focusTime?: number; // minutes
  productivityScore?: number; // 0-100
}

