"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInsights = exports.getSuggestedOrder = exports.prioritizeTasks = exports.completeHabit = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = exports.completeTask = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
// Configure functions region (us-central1 is default, but explicit is better)
const region = functions.region("us-central1");
// Export Task API functions
var tasks_1 = require("./api/tasks");
Object.defineProperty(exports, "getTasks", { enumerable: true, get: function () { return tasks_1.getTasks; } });
Object.defineProperty(exports, "createTask", { enumerable: true, get: function () { return tasks_1.createTask; } });
Object.defineProperty(exports, "updateTask", { enumerable: true, get: function () { return tasks_1.updateTask; } });
Object.defineProperty(exports, "deleteTask", { enumerable: true, get: function () { return tasks_1.deleteTask; } });
Object.defineProperty(exports, "completeTask", { enumerable: true, get: function () { return tasks_1.completeTask; } });
// Export Habit API functions
var habits_1 = require("./api/habits");
Object.defineProperty(exports, "getHabits", { enumerable: true, get: function () { return habits_1.getHabits; } });
Object.defineProperty(exports, "createHabit", { enumerable: true, get: function () { return habits_1.createHabit; } });
Object.defineProperty(exports, "updateHabit", { enumerable: true, get: function () { return habits_1.updateHabit; } });
Object.defineProperty(exports, "deleteHabit", { enumerable: true, get: function () { return habits_1.deleteHabit; } });
Object.defineProperty(exports, "completeHabit", { enumerable: true, get: function () { return habits_1.completeHabit; } });
// Export Prioritization API functions
var prioritization_1 = require("./api/prioritization");
Object.defineProperty(exports, "prioritizeTasks", { enumerable: true, get: function () { return prioritization_1.prioritizeTasks; } });
Object.defineProperty(exports, "getSuggestedOrder", { enumerable: true, get: function () { return prioritization_1.getSuggestedOrder; } });
Object.defineProperty(exports, "getUserInsights", { enumerable: true, get: function () { return prioritization_1.getUserInsights; } });
//# sourceMappingURL=index.js.map