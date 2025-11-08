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
exports.completeTask = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Use us-central1 region explicitly
const region = functions.region("us-central1");
exports.getTasks = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { status, limit = 50 } = data;
    try {
        let query = admin.firestore().collection("tasks")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(limit);
        if (status) {
            query = query.where("status", "==", status);
        }
        const snapshot = await query.get();
        const tasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return { tasks };
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", "Error fetching tasks", error.message);
    }
});
exports.createTask = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { title, description, priority, dueDate, tags } = data;
    if (!title) {
        throw new functions.https.HttpsError("invalid-argument", "Title is required");
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
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", "Error creating task", error.message);
    }
});
exports.updateTask = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { taskId, updates } = data;
    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Task ID is required");
    }
    try {
        const taskRef = admin.firestore().collection("tasks").doc(taskId);
        const taskDoc = await taskRef.get();
        if (!taskDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Task not found");
        }
        const taskData = taskDoc.data();
        if (taskData?.userId !== userId) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized to update this task");
        }
        const updateData = {
            ...updates,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (updates.dueDate) {
            updateData.dueDate = admin.firestore.Timestamp.fromDate(new Date(updates.dueDate));
        }
        await taskRef.update(updateData);
        const updatedDoc = await taskRef.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data(),
        };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error updating task", error.message);
    }
});
exports.deleteTask = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { taskId } = data;
    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Task ID is required");
    }
    try {
        const taskRef = admin.firestore().collection("tasks").doc(taskId);
        const taskDoc = await taskRef.get();
        if (!taskDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Task not found");
        }
        const taskData = taskDoc.data();
        if (taskData?.userId !== userId) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized to delete this task");
        }
        await taskRef.delete();
        return { success: true };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error deleting task", error.message);
    }
});
exports.completeTask = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    const { taskId } = data;
    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Task ID is required");
    }
    try {
        const taskRef = admin.firestore().collection("tasks").doc(taskId);
        const taskDoc = await taskRef.get();
        if (!taskDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Task not found");
        }
        const taskData = taskDoc.data();
        if (taskData?.userId !== userId) {
            throw new functions.https.HttpsError("permission-denied", "Not authorized to complete this task");
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
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Error completing task", error.message);
    }
});
//# sourceMappingURL=tasks.js.map