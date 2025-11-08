"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import { getAnalyticsSummary } from "@/lib/analyticsService";

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalTasksCompleted: number;
    totalHabitsCompleted: number;
    averageProductivityScore: number;
    bestDay: { date: Date; score: number } | null;
    completionTrend: { date: string; tasks: number; habits: number }[];
  } | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const summary = await getAnalyticsSummary();
      setData(summary);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading analytics...</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">No analytics data available yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
          <p className="text-2xl font-bold text-gray-900">{data.totalTasksCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Habits Completed</p>
          <p className="text-2xl font-bold text-gray-900">{data.totalHabitsCompleted}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Productivity</p>
          <p className="text-2xl font-bold text-gray-900">{data.averageProductivityScore}%</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Best Day</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.bestDay ? data.bestDay.score : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.bestDay
              ? data.bestDay.date.toLocaleDateString()
              : "No data"}
          </p>
        </Card>
      </div>

      {/* Completion Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Completion Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.completionTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Tasks"
            />
            <Line
              type="monotone"
              dataKey="habits"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Habits"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Daily Completion Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Completion</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.completionTrend.slice(-7)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" />
            <Bar dataKey="habits" fill="#8b5cf6" name="Habits" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

