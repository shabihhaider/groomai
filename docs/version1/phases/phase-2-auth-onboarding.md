# Phase 2 — Auth & Onboarding

## Goal
Users can sign up, log in (Email, Google, Apple), and complete the 6-step onboarding wizard. By the end of this phase, a new user can go from the welcome screen all the way to the home tab with their profile populated. The trial subscription is activated automatically via the DB trigger.

## Complexity: Medium
## Estimated Time: 3–4 days

---

## Reference Docs
- `04-onboarding.md` — full onboarding flow, all 6 steps, data shapes
- `03-navigation.md` — screen map, auth guard, deep linking setup
- `15-api-services.md` — `authService`, `profileService`

---

## Step-by-Step Tasks

### 2.1 — Navigation Shell
- [ ] Create `app/_layout.tsx` — root Stack layout with `ErrorBoundary` + `QueryClientProvider` (see `17-environment-setup.md` Section 8)
- [ ] Create `app/(auth)/_layout.tsx`
- [ ] Create `app/(onboarding)/_layout.tsx`
- [ ] Create `app/(tabs)/_layout.tsx` — custom tab bar placeholder (5 tabs, icons can be placeholders)
- [ ] Create `components/ErrorBoundary.tsx` (see `17-environment-setup.md` Section 8)
- [ ] Add deep linking `scheme: "groomai"` to `app.json` (see `03-navigation.md`)
- [ ] Test: app routes to `(auth)/welcome` when no session exists, routes to `(tabs)/home` when session exists

### 2.2 — Auth Screens
- [ ] `app/(auth)/welcome.tsx`
  - [ ] Full-screen dark background `#0A0A0A`
  - [ ] Lottie logo animation (placeholder Lottie JSON for now)
  - [ ] "Your Daily Edge." headline, "Personalized grooming. Built for you." subtext
  - [ ] "Continue with Apple" button (iOS only — use `Platform.OS === 'ios'`)
  - [ ] "Continue with Google" button
  - [ ] "Continue with Email" button
  - [ ] "Already have an account? Sign In" link
- [ ] `app/(auth)/sign-in.tsx` — email/password + Google + Apple
- [ ] `app/(auth)/sign-up.tsx` — email/password + Google + Apple
- [ ] Implement `handleGoogleSignIn` (Supabase OAuth redirect to `groomai://sign-in`)
- [ ] Implement `handleAppleSignIn` using `expo-apple-authentication` + `supabase.auth.signInWithIdToken`
- [ ] Auth state listener in `_layout.tsx` → redirect on session change
- [ ] Test: sign up with email creates a profile row in Supabase

### 2.3 — Zustand User Store
- [ ] Implement `stores/user.store.ts` — `user`, `session`, `profile` state + setters
- [ ] Implement `stores/routine.store.ts` skeleton
- [ ] Implement `stores/subscription.store.ts` — `isPremium`, `checkStatus`

### 2.4 — Onboarding Steps
- [ ] `app/(onboarding)/step-1-basics.tsx` — "What should we call you?" → saves `full_name`
- [ ] `app/(onboarding)/step-2-face.tsx` — Face shape quiz OR selfie scan → saves `face_shape`
  - [ ] Implement `utils/faceShape.ts` — `detectFaceShape(landmarks)` logic (see `04-onboarding.md`)
  - [ ] Quiz path: 3 questions → derive face shape
  - [ ] Selfie path: Face shape detection (currently uses quiz fallback — ML Kit not integrated)
- [ ] `app/(onboarding)/step-3-skin.tsx` — skin type + concerns → saves `skin_type`
- [ ] `app/(onboarding)/step-4-hair.tsx` — hair type, thickness, beard → saves `hair_type`, `hair_thickness`, `has_beard`
- [ ] `app/(onboarding)/step-5-goals.tsx` — goals, time, budget → saves `grooming_goals`, `daily_time_available`, `budget_range`
- [ ] `app/(onboarding)/step-6-trial.tsx`
  - [ ] "Building your plan" animated screen (Lottie)
  - [ ] Shows user's detected face shape, skin type, etc. back to them
  - [ ] "Start your free 7-day premium trial" CTA
  - [ ] "Continue with free plan →" de-emphasized option
  - [ ] `startTrial()` — **only** updates `onboarding_completed: true, onboarding_step: 6` (DB trigger already set the trial)
  - [ ] On success → `router.replace('/(tabs)/home')`

### 2.5 — Onboarding Progress Bar
- [ ] `components/onboarding/ProgressBar.tsx` — animated gold bar using Reanimated 3 spring animation (see `04-onboarding.md`)
- [ ] Shared Zustand `onboardingState` — all step data lives here, written to Supabase only at step 6

### 2.6 — Auth Guard
- [ ] Implement `hooks/useSubscription.ts` — `isPremium`, `requirePremium()` (see `03-navigation.md`)
- [ ] Root layout checks `onboarding_completed` and routes accordingly:
  - No session → `(auth)`
  - Session + `onboarding_completed = false` → `(onboarding)`
  - Session + `onboarding_completed = true` → `(tabs)`

---

## Done When
- [ ] New user can sign up with email, complete all 6 onboarding steps, and land on home tab
- [ ] Google Sign-In works on Android
- [ ] Apple Sign-In works on iOS
- [ ] Profile row in Supabase is fully populated after onboarding step 6
- [ ] `subscription_status = 'trial'` and `trial_ends_at` is 7 days from signup (set by DB trigger, not code)
- [ ] Returning user skips onboarding and goes straight to tabs
- [ ] No auth state leaks — signing out routes back to welcome screen
