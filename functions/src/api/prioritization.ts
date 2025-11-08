import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {
  sortTasksByPriority,
  generateSuggestedOrder,
  analyzeUserPatterns,
} from "../services/prioritizationService";

// Use us-central1 region explicitly
const region = functions.region("us-central1");

export const prioritizeTasks = region.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const { taskIds } = data;

  try {
    let query = admin.firestore().collection("tasks")
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "in-progress"]);

    if (taskIds && taskIds.length > 0) {
      // If specific task IDs provided, filter by them
      const tasks = await query.get();
      const filteredTasks = tasks.docs
        .filter((doc) => taskIds.includes(doc.id))
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      const prioritized = sortTasksByPriority(filteredTasks);
      return { tasks: prioritized };
    } else {
      // Prioritize all pending/in-progress tasks
      const snapshot = await query.get();
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const prioritized = sortTasksByPriority(tasks);
      return { tasks: prioritized };
    }
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Error prioritizing tasks",
      error.message
    );
  }
});

export const getSuggestedOrder = region.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;

  try {
    const snapshot = await admin.firestore().collection("tasks")
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "in-progress"])
      .get();

    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const suggestedOrder = generateSuggestedOrder(tasks);
    return suggestedOrder;
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Error generating suggested order",
      error.message
    );
  }
});

export const getUserInsights = region.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;

  try {
    const insights = await analyzeUserPatterns(userId);
    return insights;
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Error analyzing user patterns",
      error.message
    );
  }
});

