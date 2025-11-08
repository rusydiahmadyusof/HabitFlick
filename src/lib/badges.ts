/**
 * Badge definitions and types
 */

export type BadgeType =
  | "task_completed" // Base badge for each task completion (5 points)
  | "first_task"
  | "first_habit"
  | "task_master_10"
  | "task_master_50"
  | "task_master_100"
  | "habit_warrior_7"
  | "habit_warrior_30"
  | "habit_warrior_100"
  | "streak_master_7"
  | "streak_master_30"
  | "streak_master_100"
  | "early_bird"
  | "night_owl"
  | "perfectionist"
  | "speed_demon"
  | "dedicated"
  | "week_warrior"
  | "month_champion";

export interface BadgeDefinition {
  id: BadgeType;
  name: string;
  description: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  task_completed: {
    id: "task_completed",
    name: "Task Completed",
    description: "Completed a task",
    emoji: "✅",
    rarity: "common",
    points: 5,
  },
  first_task: {
    id: "first_task",
    name: "First Step",
    description: "Completed your first task",
    emoji: "🎯",
    rarity: "common",
    points: 10,
  },
  first_habit: {
    id: "first_habit",
    name: "Habit Starter",
    description: "Created your first habit",
    emoji: "🌱",
    rarity: "common",
    points: 10,
  },
  task_master_10: {
    id: "task_master_10",
    name: "Task Apprentice",
    description: "Completed 10 tasks",
    emoji: "⭐",
    rarity: "common",
    points: 25,
  },
  task_master_50: {
    id: "task_master_50",
    name: "Task Master",
    description: "Completed 50 tasks",
    emoji: "🏆",
    rarity: "rare",
    points: 100,
  },
  task_master_100: {
    id: "task_master_100",
    name: "Task Legend",
    description: "Completed 100 tasks",
    emoji: "👑",
    rarity: "epic",
    points: 250,
  },
  habit_warrior_7: {
    id: "habit_warrior_7",
    name: "Week Warrior",
    description: "Completed a habit 7 days in a row",
    emoji: "🔥",
    rarity: "common",
    points: 30,
  },
  habit_warrior_30: {
    id: "habit_warrior_30",
    name: "Month Champion",
    description: "Completed a habit 30 days in a row",
    emoji: "💪",
    rarity: "rare",
    points: 150,
  },
  habit_warrior_100: {
    id: "habit_warrior_100",
    name: "Century Club",
    description: "Completed a habit 100 days in a row",
    emoji: "🌟",
    rarity: "legendary",
    points: 500,
  },
  streak_master_7: {
    id: "streak_master_7",
    name: "Streak Starter",
    description: "Maintained a 7-day streak",
    emoji: "⚡",
    rarity: "common",
    points: 25,
  },
  streak_master_30: {
    id: "streak_master_30",
    name: "Streak Master",
    description: "Maintained a 30-day streak",
    emoji: "🔥",
    rarity: "rare",
    points: 200,
  },
  streak_master_100: {
    id: "streak_master_100",
    name: "Streak Legend",
    description: "Maintained a 100-day streak",
    emoji: "👑",
    rarity: "legendary",
    points: 1000,
  },
  early_bird: {
    id: "early_bird",
    name: "Early Bird",
    description: "Completed 5 tasks before 9 AM",
    emoji: "🌅",
    rarity: "rare",
    points: 50,
  },
  night_owl: {
    id: "night_owl",
    name: "Night Owl",
    description: "Completed 5 tasks after 9 PM",
    emoji: "🦉",
    rarity: "rare",
    points: 50,
  },
  perfectionist: {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Completed 10 tasks in a single day",
    emoji: "✨",
    rarity: "epic",
    points: 150,
  },
  speed_demon: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Completed a task within 1 hour of creating it",
    emoji: "⚡",
    rarity: "rare",
    points: 75,
  },
  dedicated: {
    id: "dedicated",
    name: "Dedicated",
    description: "Logged in for 7 consecutive days",
    emoji: "💎",
    rarity: "rare",
    points: 100,
  },
  week_warrior: {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Completed all tasks for 7 days straight",
    emoji: "🗓️",
    rarity: "epic",
    points: 200,
  },
  month_champion: {
    id: "month_champion",
    name: "Month Champion",
    description: "Completed all tasks for 30 days straight",
    emoji: "🏅",
    rarity: "legendary",
    points: 500,
  },
};

/**
 * Get badge definition by type
 */
export function getBadgeDefinition(type: BadgeType): BadgeDefinition {
  return BADGE_DEFINITIONS[type];
}

/**
 * Get all badge definitions
 */
export function getAllBadgeDefinitions(): BadgeDefinition[] {
  return Object.values(BADGE_DEFINITIONS);
}

/**
 * Get badges by rarity
 */
export function getBadgesByRarity(rarity: BadgeDefinition["rarity"]): BadgeDefinition[] {
  return getAllBadgeDefinitions().filter((badge) => badge.rarity === rarity);
}

