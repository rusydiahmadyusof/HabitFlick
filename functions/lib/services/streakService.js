"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStreak = calculateStreak;
exports.checkStreakBreak = checkStreakBreak;
const admin = __importStar(require("firebase-admin"));
/**
 * Calculate streak for a habit based on completion logs
 */
async function calculateStreak(habitId, userId) {
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
        const timestamp = doc.data().completedAt;
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
            }
            else {
                break;
            }
        }
    }
    else if (uniqueDates.includes(yesterdayTime)) {
        // Completed yesterday, check if streak continues
        currentStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const expectedDate = new Date(yesterday);
            expectedDate.setDate(expectedDate.getDate() - i);
            expectedDate.setHours(0, 0, 0, 0);
            const expectedTime = expectedDate.getTime();
            if (uniqueDates.includes(expectedTime)) {
                currentStreak++;
            }
            else {
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
        const daysDiff = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
            tempStreak++;
        }
        else {
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
async function checkStreakBreak(habitId) {
    const habitRef = admin.firestore().collection("habits").doc(habitId);
    const habitDoc = await habitRef.get();
    if (!habitDoc.exists) {
        return false;
    }
    const habitData = habitDoc.data();
    if (!habitData?.lastCompleted) {
        return false;
    }
    const lastCompleted = habitData.lastCompleted.toDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCompleted.setHours(0, 0, 0, 0);
    const daysSinceLastCompletion = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
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
//# sourceMappingURL=streakService.js.map