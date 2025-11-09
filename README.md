# HabitFlick

A mobile-first, responsive web app for productivity and habit tracking with gamification, analytics, social features, and PWA support.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS with dark mode support
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Firebase Auth)
- **Charts**: Recharts
- **PWA**: Service Worker, Web App Manifest

## Features

### ✅ Core Features
- Task & Habit Tracking
- Streak Tracking
- Gamification & Badges (18 badge types)
- Level Progression System
- Analytics Dashboard with Charts
- Rule-based Task Prioritization
- Daily & Weekly Plans
- User Insights & Suggestions

### ✅ Social & Sharing
- Social Leaderboard
- Share Achievements
- Share Progress

### ✅ PWA & Notifications
- Progressive Web App (PWA)
- Offline Support
- Push Notifications (Firebase Cloud Messaging)
- Install Prompt

### ✅ Additional Features
- Export Data (JSON, CSV)
- Dark Mode
- Onboarding Flow
- Task & Habit Detail Pages
- Settings Page

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
cp env.example .env.local
```

3. Add your Firebase configuration to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key (optional, for push notifications)
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
├── public/           # Static assets (PWA icons, manifest)
└── functions/        # Firebase Cloud Functions (deprecated)
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Backend (Firebase)
1. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

2. Deploy Firestore indexes:
```bash
firebase deploy --only firestore:indexes
```

## PWA Setup

The app includes:
- Web App Manifest (`/public/manifest.json`)
- Service Worker (`/public/sw.js`)
- PWA icons (192x192 and 512x512) - Generated automatically with `npm run generate-icons`

To enable full PWA features:
1. **Generate app icons** by running:
   ```bash
   npm run generate-icons
   ```
   This creates `/public/icon-192.png` and `/public/icon-512.png` with HabitFlick branding (required for PWA install prompt)
2. Update manifest.json with your app details (if needed)
3. Deploy to HTTPS (required for service workers)

## Push Notifications

To enable push notifications:
1. Generate a VAPID key in Firebase Console
2. Add `NEXT_PUBLIC_FIREBASE_VAPID_KEY` to `.env.local`
3. Users can enable notifications in Settings

## License

MIT
