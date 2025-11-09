"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import NavigationBar from "@/components/layout/NavigationBar";
import AuthGuard from "@/components/auth/AuthGuard";
import BadgeNotificationProvider from "@/components/features/BadgeNotificationProvider";
import Onboarding from "@/components/features/Onboarding";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { registerServiceWorker } from "@/lib/pwa";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
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
  );
}

