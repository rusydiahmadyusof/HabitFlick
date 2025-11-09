"use client";

import AnalyticsDashboard from "@/components/features/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">Analytics Dashboard</h1>
        <AnalyticsDashboard />
      </div>
    </div>
  );
}

