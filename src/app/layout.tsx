import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavigationBar from "@/components/layout/NavigationBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HabitFlick - Productivity & Habit Tracker",
  description: "Track your tasks and habits with gamification, analytics, and social features",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationBar />
        {children}
      </body>
    </html>
  );
}

