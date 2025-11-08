"use client";

import { BadgeDefinition, getBadgeDefinition } from "@/lib/badges";
import type { Badge } from "@/types";
import Card from "@/components/ui/Card";

interface BadgeDisplayProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export default function BadgeDisplay({
  badge,
  size = "md",
  showDescription = true,
}: BadgeDisplayProps) {
  const definition = getBadgeDefinition(badge.badgeType as any);

  const sizeClasses = {
    sm: "w-12 h-12 text-2xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-24 h-24 text-5xl",
  };

  const rarityColors = {
    common: "bg-gray-100 border-gray-300",
    rare: "bg-blue-100 border-blue-300",
    epic: "bg-purple-100 border-purple-300",
    legendary: "bg-yellow-100 border-yellow-400",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-2 ${rarityColors[definition.rarity]} flex items-center justify-center shadow-md`}
        title={definition.name}
      >
        {definition.emoji}
      </div>
      {showDescription && (
        <div className="mt-2 text-center">
          <p className="text-sm font-semibold text-gray-900">{definition.name}</p>
          <p className="text-xs text-gray-600">{definition.description}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

interface BadgeGridProps {
  badges: Badge[];
  showDescription?: boolean;
}

export function BadgeGrid({ badges, showDescription = true }: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">No badges earned yet. Keep going!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {badges.map((badge) => (
        <BadgeDisplay key={badge.id} badge={badge} showDescription={showDescription} />
      ))}
    </div>
  );
}

