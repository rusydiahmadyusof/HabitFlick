"use client";

import Card from "@/components/ui/Card";

export default function PremiumPage() {

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              All Features Free!
            </h1>
            <p className="text-xl text-gray-600">
              Enjoy unlimited access to all HabitFlick features
            </p>
          </div>

          <Card className="p-8 mb-12 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Everything is Free
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We&apos;ve removed all limitations. Enjoy unlimited access to all features!
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8 text-left">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Core Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Unlimited tasks
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Unlimited habits
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      All badges & achievements
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Additional Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Streak tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Daily plans & insights
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Task prioritization
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Level progression
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </main>
  );
}

