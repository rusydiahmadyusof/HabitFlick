"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeHabit = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Use us-central1 region explicitly
const region = functions.region("us-central1");
exports.getHabits = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    try {
        const snapshot = await admin.firestore()
            .collection("habits")
            .where("userId", "==", userId)
            .where("archived", "==", false)
            .orderBy("createdAt", "desc")
            .get();
        const habits = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { habits };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", "Error fetching habits", error.message);
    }
});
exports.createHabit = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { title, description, frequency, customSchedule } = data;
    if (!title) {
        throw new functions.https.HttpsError("invalid-argument", "Title is required");
    }
    if (!frequency || !["daily", "weekly", "custom"].includes(frequency)) {
        throw new functions.https.HttpsError("invalid-argument", "Valid frequency is required (daily, weekly, or custom)");
    }
    try {
        const habitData = {
            userId,
            title,
            description: description || "",
            frequency,
            streak: 0,
            longestStreak: 0,
            archived: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            ...(frequency === "custom" && customSchedule && { customSchedule }),
        };
        const docRef = await admin.firestore().collection("habits").add(habitData);
        const doc = await docRef.get();
        return {
            id: doc.id,
            ...doc.data(),
        };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", "Error creating habit", error.message);
    }
});
exports.updateHabit = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { habitId, updates } = data;
    if (!habitId) {
        throw new functions.https.HttpsError("invalid-argument", "Habit ID is required");
    }
    try {
        const habitRef = admin.firestore().collection("habits").doc(habitId);
        const habitDoc = await habitRef.get();
        if (!habitDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Habit not found");
        }
        const habitData = habitDoc.data();
        if (habitData?.userId !== userId) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized to update this habit");
        }
        await habitRef.update(updates);
        const updatedDoc = await habitRef.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data(),
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error updating habit", error.message);
    }
});
exports.deleteHabit = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { habitId } = data;
    if (!habitId) {
        throw new functions.https.HttpsError("invalid-argument", "Habit ID is required");
    }
    try {
        const habitRef = admin.firestore().collection("habits").doc(habitId);
        const habitDoc = await habitRef.get();
        if (!habitDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Habit not found");
        }
        const habitData = habitDoc.data();
        if (habitData?.userId !== userId) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized to delete this habit");
        }
        // Soft delete by archiving
        await habitRef.update({ archived: true });
        return { success: true };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error deleting habit", error.message);
    }
});
exports.completeHabit = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { habitId, notes } = data;
    if (!habitId) {
        throw new functions.https.HttpsError("invalid-argument", "Habit ID is required");
    }
    try {
        const habitRef = admin.firestore().collection("habits").doc(habitId);
        const habitDoc = await habitRef.get();
        if (!habitDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Habit not found");
        }
        const habitData = habitDoc.data();
        if (habitData?.userId !== userId) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized to complete this habit");
        }
        const now = admin.firestore.Timestamp.now();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = admin.firestore.Timestamp.fromDate(today);
        // Log the completion
        await admin.firestore().collection("habitLogs").add({
            habitId,
            userId,
            completedAt: now,
            notes: notes || "",
        });
        // Update streak logic
        const lastCompleted = habitData.lastCompleted
            ? habitData.lastCompleted.toDate()
            : null;
        const lastCompletedDate = lastCompleted
            ? new Date(lastCompleted.setHours(0, 0, 0, 0))
            : null;
        const todayDate = new Date(today);
        let newStreak = habitData.streak || 0;
        if (!lastCompletedDate) {
            // First completion
            newStreak = 1;
        }
        else {
            const daysDiff = Math.floor((todayDate.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 0) {
                // Already completed today
                newStreak = habitData.streak || 0;
            }
            else if (daysDiff === 1) {
                // Consecutive day
                newStreak = (habitData.streak || 0) + 1;
            }
            else {
                // Streak broken
                newStreak = 1;
            }
        }
        const longestStreak = Math.max(habitData.longestStreak || 0, newStreak);
        await habitRef.update({
            streak: newStreak,
            longestStreak,
            lastCompleted: now,
        });
        const updatedDoc = await habitRef.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data(),
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error completing habit", error.message);
    }
});
//# sourceMappingURL=habits.js.map