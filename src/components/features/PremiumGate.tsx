"use client";

import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface PremiumGateProps {
  feature: string;
  children?: React.ReactNode;
}

export default function PremiumGate({ feature, children }: PremiumGateProps) {
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Premium Feature
        </h3>
        <p className="text-gray-600 mb-4">
          {feature} is available for Premium users only.
        </p>
        <Link href="/premium">
          <Button>Upgrade to Premium</Button>
        </Link>
      </div>
      {children}
    </Card>
  );
}

