import { useState, useEffect, useCallback } from "react";
import { getUserBadges, calculateLevel } from "@/lib/gamificationService";
import type { Badge } from "@/types";
import { getBadgeDefinition } from "@/lib/badges";

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  const loadBadges = async () => {
    setLoading(true);
    setError(null);
    try {
      const userBadges = await getUserBadges();
      setBadges(userBadges);
    } catch (err: any) {
      setError(err.message || "Failed to load badges");
    } finally {
      setLoading(false);
    }
  };

  const addNewBadge = useCallback((badge: Badge) => {
    setNewBadges((prev) => [...prev, badge]);
    setBadges((prev) => {
      // Check if badge already exists to avoid duplicates
      if (prev.some((b) => b.id === badge.id)) {
        return prev;
      }
      return [...prev, badge];
    });
  }, []);

  const removeNewBadge = (badgeId: string) => {
    setNewBadges((prev) => prev.filter((b) => b.id !== badgeId));
  };

  const getTotalPoints = (): number => {
    return badges.reduce((sum, badge) => {
      const definition = getBadgeDefinition(badge.badgeType as any);
      return sum + definition.points;
    }, 0);
  };

  const getLevelInfo = () => {
    const totalPoints = getTotalPoints();
    return calculateLevel(totalPoints);
  };

  useEffect(() => {
    loadBadges();
  }, []);

  // Listen for badge earned events to update badges list in real-time
  useEffect(() => {
    const handleBadgeEarned = (event: CustomEvent<Badge>) => {
      const newBadge = event.detail;
      // Add badge to local state immediately for instant UI update
      addNewBadge(newBadge);
    };

    window.addEventListener("badgeEarned" as any, handleBadgeEarned as EventListener);

    return () => {
      window.removeEventListener("badgeEarned" as any, handleBadgeEarned as EventListener);
    };
  }, [addNewBadge]);

  return {
    badges,
    loading,
    error,
    newBadges,
    loadBadges,
    addNewBadge,
    removeNewBadge,
    getTotalPoints,
    getLevelInfo,
  };
}

