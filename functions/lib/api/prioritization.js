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
exports.getUserInsights = exports.getSuggestedOrder = exports.prioritizeTasks = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const prioritizationService_1 = require("../services/prioritizationService");
// Use us-central1 region explicitly
const region = functions.region("us-central1");
exports.prioritizeTasks = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
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
            const prioritized = (0, prioritizationService_1.sortTasksByPriority)(filteredTasks);
            return { tasks: prioritized };
        }
        else {
            // Prioritize all pending/in-progress tasks
            const snapshot = await query.get();
            const tasks = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const prioritized = (0, prioritizationService_1.sortTasksByPriority)(tasks);
            return { tasks: prioritized };
        }
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", "Error prioritizing tasks", error.message);
    }
});
exports.getSuggestedOrder = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
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
        const suggestedOrder = (0, prioritizationService_1.generateSuggestedOrder)(tasks);
        return suggestedOrder;
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", "Error generating suggested order", error.message);
    }
});
exports.getUserInsights = region.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const userId = context.auth.uid;
    try {
        const insights = await (0, prioritizationService_1.analyzeUserPatterns)(userId);
        return insights;
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", "Error analyzing user patterns", error.message);
    }
});
//# sourceMappingURL=prioritization.js.map