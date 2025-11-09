"use client";

import WeeklyPlanCard from "@/components/features/WeeklyPlanCard";

export default function WeeklyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Weekly Plan</h1>
        <WeeklyPlanCard />
      </div>
    </div>
  );
}

