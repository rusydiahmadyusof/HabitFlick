import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const getTasks = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const { status, limit = 50 } = data;

  try {
    let query = admin.firestore().collection("tasks")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (status) {
      query = query.where("status", "==", status) as any;
    }

    const snapshot = await query.get();
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { tasks };
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Error fetching tasks",
      error.message
    );
  }
});

export const createTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const { title, description, priority, dueDate, tags } = data;

  if (!title) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Title is required"
    );
  }

  try {
    const taskData = {
      userId,
      title,
      description: description || "",
      priority: priority || "medium",
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(dueDate && { dueDate: admin.firestore.Timestamp.fromDate(new Date(dueDate)) }),
      ...(tags && { tags }),
    };

    const docRef = await admin.firestore().collection("tasks").add(taskData);
    const doc = await docRef.get();

    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      "Error creating task",
      error.message
    );
  }
});

export const updateTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const { taskId, updates } = data;

  if (!taskId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Task ID is required"
    );
  }

  try {
    const taskRef = admin.firestore().collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Task not found");
    }

    const taskData = taskDoc.data();
    if (taskData?.userId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Not authorized to update this task"
      );
    }

    const updateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (updates.dueDate) {
      updateData.dueDate = admin.firestore.Timestamp.fromDate(
        new Date(updates.dueDate)
      );
    }

    await taskRef.update(updateData);
    const updatedDoc = await taskRef.get();

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Error updating task",
      error.message
    );
  }
});

export const deleteTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const { taskId } = data;

  if (!taskId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Task ID is required"
    );
  }

  try {
    const taskRef = admin.firestore().collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Task not found");
    }

    const taskData = taskDoc.data();
    if (taskData?.userId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Not authorized to delete this task"
      );
    }

    await taskRef.delete();

    return { success: true };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Error deleting task",
      error.message
    );
  }
});

export const completeTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const userId = context.auth.uid;
  const { taskId } = data;

  if (!taskId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Task ID is required"
    );
  }

  try {
    const taskRef = admin.firestore().collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Task not found");
    }

    const taskData = taskDoc.data();
    if (taskData?.userId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Not authorized to complete this task"
      );
    }

    await taskRef.update({
      status: "completed",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await taskRef.get();

    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    };
  } catch (error: any) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "Error completing task",
      error.message
    );
  }
});

