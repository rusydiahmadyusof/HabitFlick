"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface OnboardingStep {
  title: string;
  description: string;
  image?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to HabitFlick!",
    description: "Your productivity and habit tracking companion. Let's get you started!",
  },
  {
    title: "Track Your Tasks",
    description: "Create tasks with priorities and due dates. Complete them to earn points and level up!",
  },
  {
    title: "Build Habits",
    description: "Create daily, weekly, or custom habits. Track your streaks and watch them grow!",
  },
  {
    title: "Earn Badges",
    description: "Complete tasks and habits to earn badges and unlock achievements. Gamify your productivity!",
  },
  {
    title: "View Analytics",
    description: "See your productivity trends, completion rates, and insights to improve your habits.",
  },
  {
    title: "You're All Set!",
    description: "Start by creating your first task or habit. Good luck on your productivity journey!",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem("hasCompletedOnboarding", "true");
    setShowOnboarding(false);
  };

  if (!showOnboarding) {
    return null;
  }

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">
            {currentStep === 0 && "👋"}
            {currentStep === 1 && "📝"}
            {currentStep === 2 && "🔄"}
            {currentStep === 3 && "🏆"}
            {currentStep === 4 && "📊"}
            {currentStep === 5 && "🎉"}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
          <p className="text-gray-600">{step.description}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index <= currentStep ? "bg-blue-600 w-8" : "bg-gray-300 w-2"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            className="flex-1"
          >
            {isLastStep ? "Get Started" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

