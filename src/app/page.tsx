"use client";

import Link from "next/link";
import { useTasks } from "@/hooks/useTasks";
import { useBadges } from "@/hooks/useBadges";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DailyPlanCard from "@/components/features/DailyPlanCard";
import UserInsights from "@/components/features/UserInsights";

export default function Home() {
  const { completeTask, deleteTask, loading: tasksLoading } = useTasks();
  const { getTotalPoints, getLevelInfo, loading: badgesLoading } = useBadges();
  
  // Show loading state while data is being fetched
  if (badgesLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }
  
  const levelInfo = getLevelInfo();
  const totalPoints = getTotalPoints();

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Welcome to HabitFlick
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto px-4">
              Your productivity and habit tracking companion
            </p>
            <Card className="p-6 sm:p-8 max-w-2xl mx-auto animate-slide-up" variant="elevated">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800/30">
                  <p className="text-caption text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Level</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">{levelInfo.level}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 border border-secondary-200 dark:border-secondary-800/30">
                  <p className="text-caption text-neutral-600 dark:text-neutral-400 mb-1 font-medium">Total Points</p>
                  <p className="text-3xl sm:text-4xl font-bold text-secondary-600 dark:text-secondary-400">{totalPoints}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Progress to Level {levelInfo.level + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    {levelInfo.pointsToNext} points needed
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 overflow-hidden shadow-inner">
                  {(() => {
                    // Calculate progress: how many points we have in the current level vs total points needed for the level
                    const pointsInCurrentLevel = totalPoints - levelInfo.currentLevelPoints;
                    const pointsNeededForLevel = levelInfo.nextLevelPoints - levelInfo.currentLevelPoints;
                    const progressPercent = Math.min(100, Math.max(0, (pointsInCurrentLevel / pointsNeededForLevel) * 100));
                    
                    return (
                      <div
                        className="bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2 shadow-sm"
                        style={{ 
                          width: `${progressPercent}%`,
                          backgroundSize: "200% 100%",
                        }}
                      >
                        {progressPercent > 20 && (
                          <span className="text-xs font-bold text-white drop-shadow-sm">
                            {Math.round(progressPercent)}%
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-1 sm:gap-0">
                  <span className="truncate">Level {levelInfo.level} start: {levelInfo.currentLevelPoints} pts</span>
                  <span className="truncate">Level {levelInfo.level + 1} start: {levelInfo.nextLevelPoints} pts</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card variant="interactive" className="p-4 sm:p-6 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400"
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
                <h2 className="text-heading-3 text-neutral-900 dark:text-neutral-50 mb-2">
                  Tasks
                </h2>
                <p className="text-body-small text-neutral-600 dark:text-neutral-400 mb-4">
                  Organize and track your daily tasks with priorities and due
                  dates
                </p>
                <Link href="/tasks">
                  <Button>Manage Tasks</Button>
                </Link>
              </div>
            </Card>

            <Card variant="interactive" className="p-4 sm:p-6 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900/30 dark:to-secondary-800/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <svg
                    className="w-7 h-7 sm:w-8 sm:h-8 text-secondary-600 dark:text-secondary-400"
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
                <h2 className="text-heading-3 text-neutral-900 dark:text-neutral-50 mb-2">
                  Habits
                </h2>
                <p className="text-body-small text-neutral-600 dark:text-neutral-400 mb-4">
                  Build lasting habits with daily, weekly, or custom schedules
                  and track your streaks
                </p>
                <Link href="/habits">
                  <Button>Manage Habits</Button>
                </Link>
              </div>
            </Card>
          </div>

          <Card variant="outlined" className="p-4 sm:p-6 bg-gradient-to-r from-primary-50 via-secondary-50 to-primary-50 dark:from-primary-900/10 dark:via-secondary-900/10 dark:to-primary-900/10 border-primary-200 dark:border-primary-800">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
              Get Started
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Start by creating your first task or habit. Track your progress,
              build streaks, and achieve your goals!
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}

