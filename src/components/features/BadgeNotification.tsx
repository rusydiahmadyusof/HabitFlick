"use client";

import { useEffect, useState } from "react";
import { getBadgeDefinition } from "@/lib/badges";
import type { Badge } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const definition = getBadgeDefinition(badge.badgeType as any);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityColors = {
    common: "bg-gray-50 border-gray-200",
    rare: "bg-blue-50 border-blue-200",
    epic: "bg-purple-50 border-purple-200",
    legendary: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
    >
      <Card className={`p-4 ${rarityColors[definition.rarity]} border-2 shadow-lg max-w-sm`}>
        <div className="flex items-start gap-4">
          <div className="text-5xl">{definition.emoji}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">Badge Earned!</h3>
            <p className="font-semibold text-gray-800 mt-1">{definition.name}</p>
            <p className="text-sm text-gray-600 mt-1">{definition.description}</p>
            <p className="text-xs text-gray-500 mt-2">
              +{definition.points} points
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="ml-2"
          >
            ✕
          </Button>
        </div>
      </Card>
    </div>
  );
}

