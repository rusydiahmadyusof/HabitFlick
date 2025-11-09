"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import NavigationBar from "@/components/layout/NavigationBar";
import AuthGuard from "@/components/auth/AuthGuard";
import BadgeNotificationProvider from "@/components/features/BadgeNotificationProvider";
import Onboarding from "@/components/features/Onboarding";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { registerServiceWorker } from "@/lib/pwa";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();

    // Initialize dark mode from localStorage
    const darkMode = localStorage.getItem("darkMode") === "true" ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HabitFlick" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {!isAuthPage && <NavigationBar />}
          {isAuthPage ? children : (
            <AuthGuard>
              <BadgeNotificationProvider />
              <Onboarding />
              {children}
            </AuthGuard>
          )}
        </ErrorBoundary>
      </body>
    </html>
  );
}

