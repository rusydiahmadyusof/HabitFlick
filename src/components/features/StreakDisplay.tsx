import Card from "@/components/ui/Card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  habitTitle?: string;
}

export default function StreakDisplay({
  currentStreak,
  longestStreak,
  habitTitle,
}: StreakDisplayProps) {
  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return "🔥🔥🔥";
    if (streak >= 50) return "🔥🔥";
    if (streak >= 30) return "🔥";
    if (streak >= 7) return "⭐";
    if (streak >= 3) return "✨";
    return "";
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 100) return "Incredible!";
    if (streak >= 50) return "Amazing!";
    if (streak >= 30) return "Outstanding!";
    if (streak >= 7) return "Great job!";
    if (streak >= 3) return "Keep it up!";
    if (streak >= 1) return "Getting started!";
    return "Start your streak!";
  };

  return (
    <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="p-6">
        {habitTitle && (
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            {habitTitle}
          </h3>
        )}
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Current Streak</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-blue-600">
                {currentStreak}
              </span>
              <span className="text-2xl">{getStreakEmoji(currentStreak)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getStreakMessage(currentStreak)}
            </p>
          </div>
          <div className="w-px h-16 bg-gray-300"></div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Longest Streak</p>
            <p className="text-4xl font-bold text-gray-700">{longestStreak}</p>
            {longestStreak > currentStreak && (
              <p className="text-xs text-gray-500 mt-1">Personal best!</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

