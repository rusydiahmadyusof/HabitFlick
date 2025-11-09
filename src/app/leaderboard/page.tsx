"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import Card from "@/components/ui/Card";
import { useBadges } from "@/hooks/useBadges";
import { calculateLevel } from "@/lib/gamificationService";
import { getBadgeDefinition } from "@/lib/badges";

interface LeaderboardUser {
  userId: string;
  email: string;
  totalPoints: number;
  level: number;
  totalTasks: number;
  totalHabits: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "week" | "month">("all");
  const { getTotalPoints, getLevelInfo } = useBadges();

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // For now, we'll calculate leaderboard from badges
      // In a real app, you'd have a separate leaderboard collection
      const db = getFirestoreDb();
      const badgesQuery = query(
        collection(db, "badges"),
        orderBy("earnedAt", "desc"),
        limit(1000)
      );
      const badgesSnapshot = await getDocs(badgesQuery);

      // Group badges by user and calculate points
      const userMap = new Map<string, LeaderboardUser>();
      
      badgesSnapshot.docs.forEach((doc) => {
        const badge = doc.data();
        const userId = badge.userId;
        
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            email: `user-${userId.slice(0, 8)}`, // Placeholder
            totalPoints: 0,
            level: 1,
            totalTasks: 0,
            totalHabits: 0,
          });
        }
        
        const user = userMap.get(userId)!;
        // Calculate actual points from badge definition
        try {
          const definition = getBadgeDefinition(badge.badgeType);
          user.totalPoints += definition.points;
        } catch {
          // Fallback to 5 points if badge type not found
          user.totalPoints += 5;
        }
      });

      // Calculate levels for each user based on their points
      userMap.forEach((user) => {
        const levelInfo = calculateLevel(user.totalPoints);
        user.level = levelInfo.level;
      });

      // Sort by points and get top 50
      const sortedUsers = Array.from(userMap.values())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 50);

      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeframe === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe("week")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeframe === "week"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                timeframe === "month"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {users.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No leaderboard data yet. Be the first to earn points!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <Card
                key={user.userId}
                className={`p-4 ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                    : index < 3
                    ? "bg-gradient-to-r from-blue-50 to-purple-50"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-600">
                        Level {user.level} • {user.totalPoints} points
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-2xl">👑</span>
                  )}
                  {index === 1 && (
                    <span className="text-2xl">🥈</span>
                  )}
                  {index === 2 && (
                    <span className="text-2xl">🥉</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

