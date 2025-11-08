# HabitFlick

A mobile-first, responsive web app for productivity and habit tracking with gamification, analytics, premium features, and social leaderboard.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Cloud Functions, Firebase Auth)
- **Charts**: Recharts
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

3. Add your Firebase configuration to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
habitflick/
├── src/              # Next.js app source
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and configs
│   ├── hooks/        # Custom React hooks
│   ├── store/        # Zustand stores
│   └── types/        # TypeScript types
├── functions/        # Firebase Cloud Functions
└── public/           # Static assets
```

## Features

- ✅ Task & Habit Tracking
- ✅ Streak Tracking
- ✅ Gamification & Badges
- ✅ Analytics Dashboard
- ✅ Rule-based Prioritization
- 🚧 Premium Features (in progress)
- 🚧 Social Leaderboard (in progress)
- 🚧 PWA Support (Phase 6)

## License

MIT

