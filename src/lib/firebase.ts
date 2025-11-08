import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getFunctions, Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let functions: Functions | undefined;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser");
  }

  // Check if config is valid
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      "Firebase configuration is missing. Please check your .env.local file."
    );
  }

  if (!app) {
    if (!getApps().length) {
      try {
        app = initializeApp(firebaseConfig);
      } catch (error: any) {
        throw new Error(`Failed to initialize Firebase: ${error.message}`);
      }
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    auth = getAuth(firebaseApp);
  }
  return auth;
}

function getFirestoreDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    db = getFirestore(firebaseApp);
  }
  return db;
}

function getFirebaseFunctions(): Functions {
  if (!functions) {
    const firebaseApp = getFirebaseApp();
    // Explicitly set region to match backend (us-central1)
    functions = getFunctions(firebaseApp, "us-central1");
  }
  return functions;
}

// Initialize on client side
if (typeof window !== "undefined") {
  getFirebaseApp();
}

// Export getters only (true lazy initialization)
export { getFirebaseApp, getFirebaseAuth, getFirestoreDb, getFirebaseFunctions };

