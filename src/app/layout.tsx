"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import NavigationBar from "@/components/layout/NavigationBar";
import AuthGuard from "@/components/auth/AuthGuard";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth";

  return (
    <html lang="en">
      <body className={inter.className}>
        {!isAuthPage && <NavigationBar />}
        {isAuthPage ? children : <AuthGuard>{children}</AuthGuard>}
      </body>
    </html>
  );
}

