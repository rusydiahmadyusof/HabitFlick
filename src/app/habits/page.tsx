"use client";

import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import HabitCard from "@/components/features/HabitCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import type { Habit } from "@/types";

export default function HabitsPage() {
  const { habits, loading, error, createHabit, deleteHabit, completeHabit } =
    useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "daily" as "daily" | "weekly" | "custom",
    customDays: [] as number[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await createHabit({
        title: formData.title,
        description: formData.description || undefined,
        frequency: formData.frequency,
        customSchedule:
          formData.frequency === "custom" && formData.customDays.length > 0
            ? { daysOfWeek: formData.customDays }
            : undefined,
      });
      setFormData({
        title: "",
        description: "",
        frequency: "daily",
        customDays: [],
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error creating habit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCustomDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter((d) => d !== day)
        : [...prev.customDays, day],
    }));
  };

  if (loading && habits.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading habits...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">Habits</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full sm:w-auto">
          {showAddForm ? "Cancel" : "Add Habit"}
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter habit title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="Enter habit description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target.value as "daily" | "weekly" | "custom",
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom Schedule</option>
              </select>
            </div>
            {formData.frequency === "custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleCustomDay(day.value)}
                      className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                        formData.customDays.includes(day.value)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {formData.customDays.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Please select at least one day
                  </p>
                )}
              </div>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || (formData.frequency === "custom" && formData.customDays.length === 0)}
            >
              {isSubmitting ? "Creating..." : "Create Habit"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onComplete={completeHabit}
            onDelete={deleteHabit}
          />
        ))}

        {habits.length === 0 && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No habits yet. Create your first habit!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

