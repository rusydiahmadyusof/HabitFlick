import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator, enableIndexedDbPersistence } from "firebase/firestore";
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to initialize Firebase: ${errorMessage}`);
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
    // Auth persistence is enabled by default in Firebase v9+
  }
  return auth;
}

function getFirestoreDb(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    db = getFirestore(firebaseApp);
    
    // Enable offline persistence for better performance and offline support
    if (typeof window !== "undefined") {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === "failed-precondition") {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn("Firestore persistence already enabled in another tab");
        } else if (err.code === "unimplemented") {
          // Browser doesn't support persistence
          console.warn("Firestore persistence not supported in this browser");
        } else {
          console.error("Firestore persistence error:", err);
        }
      });
    }
  }
  return db;
}

function getFirebaseFunctions(): Functions {
  if (!functions) {
    const firebaseApp = getFirebaseApp();
    // Set region to match your Firestore region for best performance
    // Available regions: us-central1, us-east1, us-west1, europe-west1, 
    // asia-northeast1, asia-southeast1, etc.
    // Default: asia-southeast1 (Singapore) for Southeast Asian users
    const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || "asia-southeast1";
    functions = getFunctions(firebaseApp, region);
  }
  return functions;
}

// Initialize on client side
if (typeof window !== "undefined") {
  getFirebaseApp();
}

// Export getters only (true lazy initialization)
export { getFirebaseApp, getFirebaseAuth, getFirestoreDb, getFirebaseFunctions };
