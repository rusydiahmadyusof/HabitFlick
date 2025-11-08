# Testing Guide for HabitFlick

## Current Status

The app is set up with:
- ✅ Navigation bar
- ✅ Home page with daily plan and insights
- ✅ Tasks page (full CRUD)
- ✅ Habits page (full CRUD with streaks)
- ✅ Firebase integration
- ✅ API client setup

## Prerequisites for Testing

### 1. Firebase Configuration

You need a `.env.local` file with your Firebase credentials. Create it from the example:

```bash
# Copy your Firebase config from Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Cloud Functions

The API endpoints need to be deployed to Firebase:

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### 3. Authentication

Currently, the app requires authentication but doesn't have a login UI yet. You'll need to:
- Set up Firebase Authentication in Firebase Console
- Enable Email/Password and/or Google sign-in
- Add authentication UI (or use Firebase Console to create test users)

## Testing Checklist

### Basic Navigation
- [ ] Home page loads
- [ ] Navigation bar appears
- [ ] Can navigate to Tasks page
- [ ] Can navigate to Habits page

### Tasks (Requires Auth + Functions)
- [ ] Can view tasks list
- [ ] Can create a new task
- [ ] Can complete a task
- [ ] Can delete a task
- [ ] Tasks are sorted by priority

### Habits (Requires Auth + Functions)
- [ ] Can view habits list
- [ ] Can create a new habit (daily/weekly/custom)
- [ ] Can complete a habit
- [ ] Streak counter updates
- [ ] Can delete a habit

### Smart Features (Requires Auth + Functions)
- [ ] Daily plan generates on home page
- [ ] User insights display
- [ ] Task prioritization works

## Known Limitations

1. **No Authentication UI**: You need to implement login/signup pages or use Firebase Console
2. **Functions Not Deployed**: API calls will fail until functions are deployed
3. **No Error Handling UI**: Errors may show in console but not always in UI

## Quick Test Without Functions

To test the UI without backend:
1. Mock the API responses in the hooks
2. Use local state only
3. Skip Firebase calls

## Next Steps

1. Add authentication UI (login/signup pages)
2. Deploy Firebase Functions
3. Test end-to-end workflows
4. Add error handling and loading states

