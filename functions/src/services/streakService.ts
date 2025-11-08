import * as admin from "firebase-admin";

/**
 * Calculate streak for a habit based on completion logs
 */
export async function calculateStreak(
  habitId: string,
  userId: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  const habitRef = admin.firestore().collection("habits").doc(habitId);
  const habitDoc = await habitRef.get();

  if (!habitDoc.exists) {
    throw new Error("Habit not found");
  }

  const habitData = habitDoc.data();
  if (habitData?.userId !== userId) {
    throw new Error("Not authorized");
  }

  // Get all completion logs for this habit
  const logsSnapshot = await admin
    .firestore()
    .collection("habitLogs")
    .where("habitId", "==", habitId)
    .where("userId", "==", userId)
    .orderBy("completedAt", "desc")
    .get();

  if (logsSnapshot.empty) {
    return { currentStreak: 0, longestStreak: habitData?.longestStreak || 0 };
  }

  // Convert logs to dates and sort
  const completionDates = logsSnapshot.docs.map((doc) => {
    const timestamp = doc.data().completedAt as admin.firestore.Timestamp;
    const date = timestamp.toDate();
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  // Remove duplicates and sort descending
  const uniqueDates = Array.from(new Set(completionDates)).sort((a, b) => b - a);

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // Check if completed today or yesterday (for grace period)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTime = yesterday.getTime();

  if (uniqueDates.includes(todayTime)) {
    // Completed today, start counting from today
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      const expectedTime = expectedDate.getTime();

      if (uniqueDates.includes(expectedTime)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (uniqueDates.includes(yesterdayTime)) {
    // Completed yesterday, check if streak continues
    currentStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const expectedDate = new Date(yesterday);
      expectedDate.setDate(expectedDate.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);
      const expectedTime = expectedDate.getTime();

      if (uniqueDates.includes(expectedTime)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const nextDate = new Date(uniqueDates[i + 1]);
    const daysDiff = Math.floor(
      (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Update habit with new streak values
  await habitRef.update({
    streak: currentStreak,
    longestStreak: Math.max(longestStreak, habitData?.longestStreak || 0),
  });

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, habitData?.longestStreak || 0),
  };
}

/**
 * Check if habit should have streak broken (missed completion)
 */
export async function checkStreakBreak(habitId: string): Promise<boolean> {
  const habitRef = admin.firestore().collection("habits").doc(habitId);
  const habitDoc = await habitRef.get();

  if (!habitDoc.exists) {
    return false;
  }

  const habitData = habitDoc.data();
  if (!habitData?.lastCompleted) {
    return false;
  }

  const lastCompleted = (habitData.lastCompleted as admin.firestore.Timestamp).toDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastCompleted.setHours(0, 0, 0, 0);

  const daysSinceLastCompletion = Math.floor(
    (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If more than 1 day has passed and habit is daily, streak is broken
  if (habitData.frequency === "daily" && daysSinceLastCompletion > 1) {
    return true;
  }

  // For weekly habits, check if a week has passed
  if (habitData.frequency === "weekly" && daysSinceLastCompletion > 7) {
    return true;
  }

  // For custom, need to check specific days
  // This is more complex and would require checking the schedule
  return false;
}

