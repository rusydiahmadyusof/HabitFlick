/**
 * PWA Service Worker Registration
 */

export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve("denied");
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification(title, options);
  }
}

