import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Export Task API functions
export {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} from "./api/tasks";

// Export Habit API functions
export {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  completeHabit,
} from "./api/habits";

