"use client";

import { useState, useEffect } from "react";
import { getUserBadges, calculateLevel } from "@/lib/gamificationService";
import { getAllBadgeDefinitions } from "@/lib/badges";
import { BadgeGrid } from "@/components/features/BadgeDisplay";
import ShareButton from "@/components/features/ShareButton";
import Card from "@/components/ui/Card";
import type { Badge } from "@/types";
import { getBadgeDefinition } from "@/lib/badges";

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const userBadges = await getUserBadges();
      setBadges(userBadges);

      // Calculate total points
      const points = userBadges.reduce((sum, badge) => {
        const definition = getBadgeDefinition(badge.badgeType as any);
        return sum + definition.points;
      }, 0);
      setTotalPoints(points);
    } catch (error) {
      console.error("Error loading badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const earnedBadgeTypes = new Set(badges.map((b) => b.badgeType));
  const allBadges = getAllBadgeDefinitions();
  const earnedBadges = badges.sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );

  const { level, pointsToNext } = calculateLevel(totalPoints);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading badges...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">Your Achievements</h1>

        {/* Level and Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Your Level</h2>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">Level {level}</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{totalPoints} total points</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, ((totalPoints % 100) / 100) * 100)}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {pointsToNext} points to next level
              </p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">Progress</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Badges Earned</span>
                <span className="font-semibold text-sm sm:text-base">
                  {badges.length} / {allBadges.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${(badges.length / allBadges.length) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Total Points</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm sm:text-base">{totalPoints}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Earned Badges */}
        <Card className="p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-50">Earned Badges ({badges.length})</h2>
            <ShareButton
              title="Check out my HabitFlick achievements!"
              text={`I've earned ${badges.length} badges and reached Level ${level} with ${totalPoints} points! 🏆`}
              variant="secondary"
              size="sm"
            />
          </div>
          <BadgeGrid badges={earnedBadges} showDescription={true} />
        </Card>

        {/* All Available Badges */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
            All Badges ({allBadges.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBadges.map((badgeDef) => {
              const earned = earnedBadgeTypes.has(badgeDef.id);
              return (
                <div
                  key={badgeDef.id}
                  className={`p-4 rounded-lg border-2 ${
                    earned
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{badgeDef.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{badgeDef.name}</h3>
                        {earned && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Earned
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{badgeDef.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            badgeDef.rarity === "common"
                              ? "bg-gray-100 text-gray-700"
                              : badgeDef.rarity === "rare"
                              ? "bg-blue-100 text-blue-700"
                              : badgeDef.rarity === "epic"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {badgeDef.rarity}
                        </span>
                        <span className="text-xs text-gray-500">
                          +{badgeDef.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

