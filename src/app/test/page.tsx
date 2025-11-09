"use client";

import { useEffect, useState } from "react";
import { getFirebaseApp, getFirebaseAuth, getFirebaseFunctions } from "@/lib/firebase";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function TestPage() {
  const [status, setStatus] = useState<{
    firebase: string;
    auth: string;
    functions: string;
    env: string;
  }>({
    firebase: "Checking...",
    auth: "Checking...",
    functions: "Checking...",
    env: "Checking...",
  });

  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      checkStatus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const checkStatus = () => {
    console.log("Checking Firebase status...");

    // Check Environment Variables first
    const envVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    ];
    const missing = envVars.filter((key) => !process.env[key]);
    setStatus((prev) => ({
      ...prev,
      env:
        missing.length === 0
          ? "✅ All configured"
          : `❌ Missing: ${missing.join(", ")}`,
    }));

    // Check Firebase App
    try {
      console.log("Checking Firebase App...");
      const app = getFirebaseApp();
      console.log("Firebase App:", app);
      setStatus((prev) => ({
        ...prev,
        firebase: app ? "✅ Initialized" : "❌ Not initialized",
      }));
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Firebase App Error:", error);
      setStatus((prev) => ({
        ...prev,
        firebase: `❌ Error: ${error.message}`,
      }));
    }

    // Check Auth
    try {
      console.log("Checking Firebase Auth...");
      const auth = getFirebaseAuth();
      console.log("Firebase Auth:", auth);
      setStatus((prev) => ({
        ...prev,
        auth: auth ? "✅ Initialized" : "❌ Not initialized",
      }));
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Firebase Auth Error:", error);
      setStatus((prev) => ({
        ...prev,
        auth: `❌ Error: ${error.message}`,
      }));
    }

    // Check Functions
    try {
      console.log("Checking Firebase Functions...");
      const functions = getFirebaseFunctions();
      console.log("Firebase Functions:", functions);
      setStatus((prev) => ({
        ...prev,
        functions: functions ? "✅ Initialized" : "❌ Not initialized",
      }));
    } catch (err: any) {
      console.error("Firebase Functions Error:", err);
      setStatus((prev) => ({
        ...prev,
        functions: `❌ Error: ${err.message}`,
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">System Status Test</h1>

      <div className="space-y-4 max-w-2xl">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Firebase Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Firebase App:</span>
              <span>{status.firebase}</span>
            </div>
            <div className="flex justify-between">
              <span>Firebase Auth:</span>
              <span>{status.auth}</span>
            </div>
            <div className="flex justify-between">
              <span>Firebase Functions:</span>
              <span>{status.functions}</span>
            </div>
            <div className="flex justify-between">
              <span>Environment Variables:</span>
              <span>{status.env}</span>
            </div>
          </div>
          <Button onClick={checkStatus} className="mt-4">
            Refresh Status
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>
              API Key:{" "}
              {process.env.NEXT_PUBLIC_FIREBASE_API_KEY
                ? `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...`
                : "❌ Not set"}
            </div>
            <div>
              Project ID:{" "}
              {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "❌ Not set"}
            </div>
            <div>
              Auth Domain:{" "}
              {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "❌ Not set"}
            </div>
          </div>
        </Card>

        {status.env.includes("❌") && (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">
              ⚠️ Setup Required
            </h2>
            <div className="space-y-2 text-sm text-yellow-700">
              <p className="font-semibold">To fix this, create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in the project root with:</p>
              <pre className="bg-yellow-100 p-3 rounded overflow-x-auto text-xs">
{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id`}
              </pre>
              <p className="mt-2">Get these values from your Firebase Console → Project Settings → General → Your apps</p>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/" className="block text-blue-600 hover:underline">
              → Home Page
            </a>
            <a href="/tasks" className="block text-blue-600 hover:underline">
              → Tasks Page
            </a>
            <a href="/habits" className="block text-blue-600 hover:underline">
              → Habits Page
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

