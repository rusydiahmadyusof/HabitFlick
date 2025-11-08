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
    checkStatus();
  }, []);

  const checkStatus = () => {
    // Check Firebase App
    try {
      const app = getFirebaseApp();
      setStatus((prev) => ({
        ...prev,
        firebase: app ? "✅ Initialized" : "❌ Not initialized",
      }));
    } catch (err: any) {
      setStatus((prev) => ({
        ...prev,
        firebase: `❌ Error: ${err.message}`,
      }));
    }

    // Check Auth
    try {
      const auth = getFirebaseAuth();
      setStatus((prev) => ({
        ...prev,
        auth: auth ? "✅ Initialized" : "❌ Not initialized",
      }));
    } catch (err: any) {
      setStatus((prev) => ({
        ...prev,
        auth: `❌ Error: ${err.message}`,
      }));
    }

    // Check Functions
    try {
      const functions = getFirebaseFunctions();
      setStatus((prev) => ({
        ...prev,
        functions: functions ? "✅ Initialized" : "❌ Not initialized",
      }));
    } catch (err: any) {
      setStatus((prev) => ({
        ...prev,
        functions: `❌ Error: ${err.message}`,
      }));
    }

    // Check Environment Variables
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

