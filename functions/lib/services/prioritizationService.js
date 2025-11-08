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
exports.calculatePriorityScore = calculatePriorityScore;
exports.sortTasksByPriority = sortTasksByPriority;
exports.generateSuggestedOrder = generateSuggestedOrder;
exports.analyzeUserPatterns = analyzeUserPatterns;
const admin = __importStar(require("firebase-admin"));
/**
 * Calculate priority score for a task
 * Higher score = higher priority
 */
function calculatePriorityScore(task) {
    let score = 0;
    const now = new Date();
    // User-set priority weights
    const priorityWeights = {
        high: 100,
        medium: 50,
        low: 10,
    };
    score += priorityWeights[task.priority] || 0;
    // Due date urgency
    if (task.dueDate) {
        const dueDate = task.dueDate.toDate();
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0) {
            // Overdue - highest priority
            score += 200;
        }
        else if (daysUntilDue === 0) {
            // Due today
            score += 150;
        }
        else if (daysUntilDue <= 1) {
            // Due tomorrow
            score += 120;
        }
        else if (daysUntilDue <= 3) {
            // Due within 3 days
            score += 100 - daysUntilDue * 10;
        }
        else if (daysUntilDue <= 7) {
            // Due within a week
            score += 50 - daysUntilDue * 5;
        }
    }
    // Status weighting
    if (task.status === "in-progress") {
        score += 20; // Boost in-progress tasks
    }
    else if (task.status === "completed") {
        score -= 1000; // Completed tasks go to bottom
    }
    // Age factor (older tasks get slight boost if not completed)
    if (task.createdAt && task.status !== "completed") {
        const createdAt = task.createdAt.toDate();
        const daysOld = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysOld > 7) {
            score += 5; // Slight boost for older tasks
        }
    }
    return score;
}
/**
 * Sort tasks by priority
 */
function sortTasksByPriority(tasks) {
    return [...tasks].sort((a, b) => {
        const scoreA = calculatePriorityScore(a);
        const scoreB = calculatePriorityScore(b);
        return scoreB - scoreA; // Higher score first
    });
}
/**
 * Generate suggested task order for today
 */
function generateSuggestedOrder(tasks) {
    const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in-progress");
    const sorted = sortTasksByPriority(pendingTasks);
    // Split into time blocks based on priority
    const morning = [];
    const afternoon = [];
    const evening = [];
    sorted.forEach((task, index) => {
        const score = calculatePriorityScore(task);
        if (score >= 150) {
            // High priority - morning
            morning.push(task);
        }
        else if (score >= 80) {
            // Medium-high priority - afternoon
            afternoon.push(task);
        }
        else {
            // Lower priority - evening
            evening.push(task);
        }
    });
    return { morning, afternoon, evening };
}
/**
 * Analyze user patterns for suggestions
 */
async function analyzeUserPatterns(userId) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Get completed tasks from last 30 days
    const completedTasks = await admin
        .firestore()
        .collection("tasks")
        .where("userId", "==", userId)
        .where("status", "==", "completed")
        .where("completedAt", ">=", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
        .get();
    const tasks = completedTasks.docs.map((doc) => doc.data());
    // Analyze completion times
    const completionHours = tasks
        .filter((t) => t.completedAt)
        .map((t) => {
        const date = t.completedAt.toDate();
        return date.getHours();
    });
    let bestCompletionTime = "morning";
    if (completionHours.length > 0) {
        const avgHour = completionHours.reduce((a, b) => a + b, 0) / completionHours.length;
        if (avgHour < 12) {
            bestCompletionTime = "morning";
        }
        else if (avgHour < 17) {
            bestCompletionTime = "afternoon";
        }
        else {
            bestCompletionTime = "evening";
        }
    }
    // Calculate average tasks per day
    const daysDiff = Math.ceil((now.getTime() - thirtyDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
    const averageTasksPerDay = tasks.length / Math.max(daysDiff, 1);
    // Analyze by day of week
    const dayCompletions = {};
    tasks.forEach((t) => {
        if (t.completedAt) {
            const date = t.completedAt.toDate();
            const day = date.getDay();
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
    // Generate suggestions
    const suggestions = [];
    if (averageTasksPerDay < 2) {
        suggestions.push("Try to complete at least 2-3 tasks per day to build momentum!");
    }
    if (bestCompletionTime === "morning") {
        suggestions.push("You're most productive in the morning. Schedule important tasks early!");
    }
    else if (bestCompletionTime === "afternoon") {
        suggestions.push("Your peak productivity is in the afternoon. Plan accordingly!");
    }
    if (mostProductiveDay) {
        suggestions.push(`You're most productive on ${mostProductiveDay}s. Use this day for important tasks!`);
    }
    const pendingTasks = await admin
        .firestore()
        .collection("tasks")
        .where("userId", "==", userId)
        .where("status", "==", "pending")
        .get();
    if (pendingTasks.size > 10) {
        suggestions.push("You have many pending tasks. Consider breaking them into smaller tasks!");
    }
    return {
        bestCompletionTime,
        averageTasksPerDay: Math.round(averageTasksPerDay * 10) / 10,
        mostProductiveDay,
        suggestions,
    };
}
//# sourceMappingURL=prioritizationService.js.map