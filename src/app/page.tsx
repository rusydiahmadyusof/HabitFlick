"use client";

import Link from "next/link";
import { useTasks } from "@/hooks/useTasks";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DailyPlanCard from "@/components/features/DailyPlanCard";
import UserInsights from "@/components/features/UserInsights";

export default function Home() {
  const { completeTask, deleteTask } = useTasks();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to HabitFlick
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your productivity and habit tracking companion
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <DailyPlanCard
                onTaskComplete={completeTask}
                onTaskDelete={deleteTask}
              />
            </div>
            <div>
              <UserInsights />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card variant="elevated" className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Tasks
                </h2>
                <p className="text-gray-600 mb-4">
                  Organize and track your daily tasks with priorities and due
                  dates
                </p>
                <Link href="/tasks">
                  <Button>Manage Tasks</Button>
                </Link>
              </div>
            </Card>

            <Card variant="elevated" className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Habits
                </h2>
                <p className="text-gray-600 mb-4">
                  Build lasting habits with daily, weekly, or custom schedules
                  and track your streaks
                </p>
                <Link href="/habits">
                  <Button>Manage Habits</Button>
                </Link>
              </div>
            </Card>
          </div>

          <Card variant="outlined" className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get Started
            </h3>
            <p className="text-gray-600">
              Start by creating your first task or habit. Track your progress,
              build streaks, and achieve your goals!
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}

