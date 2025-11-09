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
    <Card variant="elevated" className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="p-4 sm:p-6">
        {habitTitle && (
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
            {habitTitle}
          </h3>
        )}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="text-center flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                {currentStreak}
              </span>
              <span className="text-xl sm:text-2xl">{getStreakEmoji(currentStreak)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getStreakMessage(currentStreak)}
            </p>
          </div>
          <div className="w-px h-12 sm:h-16 bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
          <div className="text-center flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-700 dark:text-gray-300">{longestStreak}</p>
            {longestStreak > currentStreak && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Personal best!</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

