"use client";

import { useEffect, useState } from "react";
import type { Badge } from "@/types";
import BadgeNotification from "./BadgeNotification";

export default function BadgeNotificationProvider() {
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const handleBadgeEarned = (event: CustomEvent<Badge>) => {
      setNewBadges((prev) => [...prev, event.detail]);
    };

    window.addEventListener("badgeEarned" as any, handleBadgeEarned as EventListener);

    return () => {
      window.removeEventListener("badgeEarned" as any, handleBadgeEarned as EventListener);
    };
  }, []);

  const removeBadge = (badgeId: string) => {
    setNewBadges((prev) => prev.filter((b) => b.id !== badgeId));
  };

  return (
    <>
      {newBadges.map((badge, index) => (
        <BadgeNotification
          key={badge.id}
          badge={badge}
          onClose={() => removeBadge(badge.id)}
        />
      ))}
    </>
  );
}

