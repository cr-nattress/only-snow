# Epic 007: Authentication with Google

## Summary

Add user authentication using Google OAuth. Users can sign in with their Google account to save preferences, sync across devices, and enable personalized notifications.

## Current State

No authentication exists. User preferences are stored in React state and lost on refresh. The "CN" initials in the header are hardcoded.

## Goal

1. Implement Google OAuth sign-in flow
2. Display user's Google profile (name, avatar) in header
3. Persist authentication state
4. Show sign-in prompt for unauthenticated users
5. Protect certain routes/features for authenticated users only

---

## User Stories

### 1. Google sign-in button

**As a** new user,
**I want** to sign in with my Google account,
**so that** I can save my preferences and access them on any device.

#### Acceptance Criteria
- "Sign in with Google" button on home/onboarding page
- Standard Google OAuth flow
- Redirects back to app after successful sign-in
- Error handling for failed sign-in

---

### 2. Display authenticated user in header

**As a** signed-in user,
**I want** to see my profile picture and name in the header,
**so that** I know I'm logged in.

#### Acceptance Criteria
- Show Google profile picture instead of "CN" initials
- Fallback to initials if no profile picture
- Clicking opens dropdown or goes to settings

---

### 3. Sign-out functionality

**As a** signed-in user,
**I want** to sign out of my account,
**so that** I can switch accounts or use the app anonymously.

#### Acceptance Criteria
- Sign out button in settings
- Clears session and redirects to home
- Confirmation before signing out (optional)

---

### 4. Session persistence

**As a** returning user,
**I want** to stay signed in when I return to the app,
**so that** I don't have to sign in every time.

#### Acceptance Criteria
- Session persists across browser refreshes
- Session persists across browser restarts (within reasonable time)
- Secure cookie/token storage

---

### 5. Unauthenticated experience

**As a** user who hasn't signed in,
**I want** to still use basic features of the app,
**so that** I can evaluate it before creating an account.

#### Acceptance Criteria
- App works without sign-in (current behavior)
- Gentle prompts to sign in for full experience
- No blocking modals or forced sign-in

---

### 6. Protected settings

**As a** signed-in user,
**I want** my settings to be associated with my account,
**so that** they sync across devices.

#### Acceptance Criteria
- Settings page shows account info when signed in
- "Sign in to save settings" prompt when not signed in
- Future: settings persist to database (out of scope for POC)

---

## Implementation Notes

- Use NextAuth.js (Auth.js) for authentication
- Google OAuth provider configuration
- Environment variables for client ID/secret
- Session provider wrapper in layout
- For POC: session stored in cookies (no database)

## Files to Create/Modify

- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth API route
- `src/components/Providers.tsx` — Add SessionProvider
- `src/components/Header.tsx` — Show user profile
- `src/app/settings/page.tsx` — Account section with sign-out
- `.env.local` — Google OAuth credentials (not committed)
- `package.json` — Add next-auth dependency

## Environment Variables Needed

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=random-secret-string
NEXTAUTH_URL=http://localhost:3000
```

## Verification

- Click "Sign in with Google" → redirects to Google
- Complete OAuth → returns to app signed in
- Header shows profile picture
- Sign out works
- Session persists on refresh
- `npm run build` passes
