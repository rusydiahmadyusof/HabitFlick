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
exports.getUserInsights = exports.getSuggestedOrder = exports.prioritizeTasks = exports.completeHabit = exports.deleteHabit = exports.updateHabit = exports.createHabit = exports.getHabits = exports.completeTask = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
admin.initializeApp();
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