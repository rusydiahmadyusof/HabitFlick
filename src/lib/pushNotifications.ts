import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getFirebaseApp } from "./firebase";

let messaging: any = null;

export function getFirebaseMessaging() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!messaging) {
    try {
      const app = getFirebaseApp();
      const { getMessaging } = require("firebase/messaging");
      messaging = getMessaging(app);
    } catch (error) {
      console.error("Firebase Messaging initialization error:", error);
      return null;
    }
  }

  return messaging;
}

export async function requestPushNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Get FCM token
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("VAPID key not configured");
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

export function onMessageListener() {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return null;
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
}

