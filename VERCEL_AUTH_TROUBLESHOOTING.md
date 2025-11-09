# Vercel Authentication Error Troubleshooting

## Common Causes of "Authentication failed. Please try again."

### 1. ✅ Firebase Authorized Domains Not Configured

**Problem**: Firebase blocks authentication from unauthorized domains.

**Solution**:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel domain(s):
   - `your-app.vercel.app` (default Vercel domain)
   - `your-custom-domain.com` (if you have one)
   - `localhost` (should already be there for development)

**Note**: Firebase automatically adds `localhost` and your Firebase project domain, but you must manually add Vercel domains.

---

### 2. ✅ Environment Variables Not Set in Vercel

**Problem**: Firebase configuration is missing or incorrect in Vercel.

**Solution**:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify all these variables are set:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   ```
4. Make sure they match your Firebase project settings
5. **Redeploy** after adding/changing environment variables

**How to get Firebase config**:

- Firebase Console → Project Settings → General → Your apps → Web app config

---

### 3. ✅ Google OAuth Not Configured (if using Google Sign-In)

**Problem**: Google OAuth redirect URIs not configured.

**Solution**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com`
6. Add **Authorized redirect URIs**:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com`

---

### 4. ✅ Firebase Auth Domain Mismatch

**Problem**: The `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` doesn't match your Firebase project.

**Solution**:

- Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is set to: `your-project-id.firebaseapp.com`
- This should match what's in Firebase Console → Project Settings

---

### 5. ✅ Email/Password Provider Not Enabled

**Problem**: Email/Password authentication is not enabled in Firebase.

**Solution**:

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Click **Save**

---

### 6. ✅ Google Sign-In Provider Not Enabled

**Problem**: Google authentication is not enabled in Firebase.

**Solution**:

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add your project's support email
4. Click **Save**

---

## Quick Checklist

- [ ] Vercel domain added to Firebase Authorized Domains
- [ ] All environment variables set in Vercel
- [ ] Environment variables match Firebase project config
- [ ] Email/Password provider enabled in Firebase
- [ ] Google provider enabled (if using Google sign-in)
- [ ] OAuth redirect URIs configured (if using Google sign-in)
- [ ] Project redeployed after environment variable changes

---

## Testing Steps

1. **Check Browser Console**:

   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for Firebase errors when trying to authenticate

2. **Check Network Tab**:

   - Look for failed requests to Firebase Auth endpoints
   - Check error responses

3. **Test Locally First**:

   - Make sure authentication works locally with `.env.local`
   - This confirms Firebase config is correct

4. **Verify Vercel Build Logs**:
   - Check Vercel deployment logs
   - Look for any Firebase initialization errors

---

## Common Error Codes

- `auth/unauthorized-domain` → Add domain to Firebase Authorized Domains
- `auth/api-key-not-valid` → Check `NEXT_PUBLIC_FIREBASE_API_KEY` in Vercel
- `auth/operation-not-allowed` → Enable the auth provider in Firebase Console
- `auth/network-request-failed` → Check network connectivity or CORS issues

---

## Still Having Issues?

1. Check Vercel deployment logs for specific errors
2. Check browser console for detailed error messages
3. Verify Firebase project is active and billing is enabled (if required)
4. Try creating a new test user to rule out account-specific issues
