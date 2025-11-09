"use client";

import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useHabits } from "@/hooks/useHabits";
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/store/userStore";
import {
  exportAsJSON,
  exportTasksAsCSV,
  exportHabitsAsCSV,
  downloadFile,
} from "@/lib/export";
import { requestPushNotificationPermission, getFirebaseMessaging } from "@/lib/pushNotifications";
import { registerServiceWorker } from "@/lib/pwa";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function SettingsPage() {
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { user } = useAuth();
  const { user: userStore } = useUserStore();
  const [exporting, setExporting] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Check notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check dark mode preference
    const isDark = localStorage.getItem("darkMode") === "true" || 
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleExportJSON = () => {
    setExporting(true);
    try {
      const data = {
        tasks: tasks || [],
        habits: habits || [],
        user: userStore,
      };
      const json = exportAsJSON(data as any);
      downloadFile(json, `habitflick-export-${new Date().toISOString().split("T")[0]}.json`, "application/json");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleExportTasksCSV = () => {
    setExporting(true);
    try {
      const csv = exportTasksAsCSV(tasks || []);
      downloadFile(csv, `tasks-${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export tasks");
    } finally {
      setExporting(false);
    }
  };

  const handleExportHabitsCSV = () => {
    setExporting(true);
    try {
      const csv = exportHabitsAsCSV(habits || []);
      downloadFile(csv, `habits-${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export habits");
    } finally {
      setExporting(false);
    }
  };

  const handleRequestNotifications = async () => {
    try {
      const token = await requestPushNotificationPermission();
      if (token) {
        setNotificationPermission("granted");
        alert("Push notifications enabled!");
      } else {
        setNotificationPermission("denied");
        alert("Push notifications denied. Please enable in browser settings.");
      }
    } catch (error) {
      console.error("Error requesting notifications:", error);
    }
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Export Data Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Export Data
            </h2>
            <p className="text-gray-600 mb-4">
              Download your data in various formats for backup or analysis.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExportJSON}
                disabled={exporting}
                variant="secondary"
              >
                {exporting ? "Exporting..." : "Export as JSON"}
              </Button>
              <Button
                onClick={handleExportTasksCSV}
                disabled={exporting}
                variant="secondary"
              >
                {exporting ? "Exporting..." : "Export Tasks (CSV)"}
              </Button>
              <Button
                onClick={handleExportHabitsCSV}
                disabled={exporting}
                variant="secondary"
              >
                {exporting ? "Exporting..." : "Export Habits (CSV)"}
              </Button>
            </div>
          </Card>

          {/* Notifications Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Notifications
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Push Notifications: {notificationPermission}
                </p>
                {notificationPermission !== "granted" && (
                  <Button
                    onClick={handleRequestNotifications}
                    variant="secondary"
                  >
                    Enable Push Notifications
                  </Button>
                )}
                {notificationPermission === "granted" && (
                  <p className="text-sm text-green-600">✓ Notifications enabled</p>
                )}
              </div>
            </div>
          </Card>

          {/* Appearance Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Appearance
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-600">Toggle dark theme</p>
              </div>
              <button
                onClick={handleToggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* Account Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{user?.email || "Not signed in"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-gray-900 font-mono text-sm">{user?.uid || "N/A"}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

