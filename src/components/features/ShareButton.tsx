"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function ShareButton({
  title,
  text,
  url,
  variant = "secondary",
  size = "md",
}: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const shareData = {
        title,
        text,
        url: url || window.location.href,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${title}\n\n${text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard!");
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        // Fallback: copy to clipboard
        const shareText = `${title}\n\n${text}\n\n${url || window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard!");
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={sharing}
      variant={variant}
      size={size}
    >
      {sharing ? "Sharing..." : "Share"}
    </Button>
  );
}

