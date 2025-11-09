"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useHabits } from "@/hooks/useHabits";
import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import StreakDisplay from "@/components/features/StreakDisplay";
import type { Habit } from "@/types";
import { formatDate } from "@/lib/utils";

export default function HabitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const habitId = params.id as string;
  const { updateHabit, deleteHabit, completeHabit } = useHabits();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "daily" as "daily" | "weekly" | "custom",
  });

  useEffect(() => {
    loadHabit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitId]);

  const loadHabit = async () => {
    setLoading(true);
    try {
      const db = getFirestoreDb();
      const habitDoc = await getDoc(doc(db, "habits", habitId));
      if (habitDoc.exists()) {
        const habitData = habitDoc.data();
        const loadedHabit = {
          id: habitDoc.id,
          ...habitData,
          createdAt: habitData.createdAt?.toDate?.() || new Date(habitData.createdAt),
          lastCompleted: habitData.lastCompleted?.toDate?.() || (habitData.lastCompleted ? new Date(habitData.lastCompleted) : undefined),
        } as Habit;
        setHabit(loadedHabit);
        setFormData({
          title: loadedHabit.title,
          description: loadedHabit.description || "",
          frequency: loadedHabit.frequency,
        });
      }
    } catch (error) {
      console.error("Error loading habit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!habit) return;
    try {
      await updateHabit(habit.id, {
        title: formData.title,
        description: formData.description || undefined,
        frequency: formData.frequency,
      });
      setEditing(false);
      loadHabit();
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const handleDelete = async () => {
    if (!habit) return;
    if (confirm("Are you sure you want to delete this habit?")) {
      await deleteHabit(habit.id);
      router.push("/habits");
    }
  };

  const handleComplete = async () => {
    if (!habit) return;
    await completeHabit(habit.id);
    loadHabit();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading habit...</p>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">Habit not found</p>
          <Button onClick={() => router.push("/habits")}>Back to Habits</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/habits")}>
            ← Back
          </Button>
          <div className="flex gap-2">
            {!editing && (
              <>
                <Button onClick={handleComplete} variant="primary">
                  Mark Complete
                </Button>
                <Button onClick={() => setEditing(true)} variant="secondary">
                  Edit
                </Button>
                <Button onClick={handleDelete} variant="ghost">
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="p-6">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate}>Save</Button>
                <Button onClick={() => setEditing(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{habit.title}</h1>
                {habit.description && (
                  <p className="text-gray-600">{habit.description}</p>
                )}
              </div>

              <StreakDisplay
                currentStreak={habit.streak || 0}
                longestStreak={habit.longestStreak || 0}
              />

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Frequency</p>
                  <p className="font-semibold text-gray-900 capitalize">{habit.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold text-gray-900">{formatDate(habit.createdAt)}</p>
                </div>
                {habit.lastCompleted && (
                  <div>
                    <p className="text-sm text-gray-600">Last Completed</p>
                    <p className="font-semibold text-gray-900">{formatDate(habit.lastCompleted)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

