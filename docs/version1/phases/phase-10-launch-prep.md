# Phase 10 — Launch Prep & App Store Submission

## Goal
The app is ready for public release. All legal pages exist, App Store and Google Play submissions are complete, EAS build is configured, performance is verified on real devices, and the app passes App Store review on the first submission attempt.

## Complexity: Medium (mostly checklists and configuration)
## Estimated Time: 3–5 days

---

## Reference Docs
- `17-environment-setup.md` — Section 5 (Privacy & Legal), Section 6 (App Store Checklist)
- `12-monetization.md` — subscription compliance, Apple/Google in-app purchase rules

---

## Step-by-Step Tasks

### 10.1 — Legal Pages
- [ ] **Privacy Policy** — generated via [privacypolicies.com](https://privacypolicies.com) or [iubenda.com](https://iubenda.com)
  - Must disclose: face photo collection, AI analysis (OpenAI), DeepAR on-device AR processing, PostHog analytics, Sentry crash reporting
  - Must disclose that skin analysis photos are sent to OpenAI's API
  - Must state user data deletion is available
  - Host at a public URL (e.g. `groomai.app/privacy`)
- [ ] **Terms of Service** — required for subscription apps
  - Host at `groomai.app/terms`
- [ ] **EULA** — required for App Store subscription apps
- [ ] Add links in the app: Profile → Settings → "Privacy Policy" and "Terms of Service"
- [ ] Add links to App Store Connect listing and Play Console listing

### 10.2 — Delete Account Feature
- [ ] Deploy `supabase/functions/delete-account/index.ts` (full spec in `17-environment-setup.md` Section 5)
  - Verifies user JWT
  - Deletes Storage files from all 3 private buckets (best-effort)
  - Deletes `profiles` row (CASCADE handles all child tables)
  - Deletes `auth.users` row
- [ ] "Delete Account" button in Profile → Settings → Account
- [ ] Confirmation dialog: "This permanently deletes your account and all data. This cannot be undone."
- [ ] On success: sign out and route to welcome screen

### 10.3 — app.json Final Configuration
- [ ] Set `bundleIdentifier: "com.groomai.app"` (iOS)
- [ ] Set `package: "com.groomai.app"` (Android)
- [ ] Set correct `version` and `buildNumber` / `versionCode`
- [ ] Add all iOS permissions to `ios.infoPlist`:
  ```json
  NSCameraUsageDescription, NSPhotoLibraryUsageDescription,
  NSPhotoLibraryAddUsageDescription, NSFaceIDUsageDescription,
  NSUserNotificationsUsageDescription
  ```
- [ ] Add Android permissions to `android.permissions`: `CAMERA`, `READ_MEDIA_IMAGES`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`, `SCHEDULE_EXACT_ALARM`
- [ ] Set `android.targetSdkVersion: 34` (required by Google Play 2024+)
- [ ] Add `expo-router` plugin to `plugins` array in `app.json`
- [ ] Set deep link scheme: `scheme: "groomai"`

### 10.4 — EAS Build Setup
```bash
npm install -g eas-cli
eas login
eas build:configure
```
- [ ] Create `eas.json` with `development`, `preview`, and `production` profiles
- [ ] Add `EXPO_PUBLIC_*` env vars to EAS Secrets (not the server-only ones — those stay in Supabase only)
- [ ] Test build: `eas build --platform ios --profile preview`
- [ ] Test build: `eas build --platform android --profile preview`
- [ ] Confirm both builds install and launch correctly on physical devices

### 10.5 — Production Build & Submission
**iOS:**
- [ ] `eas build --platform ios --profile production`
- [ ] Submit to App Store: `eas submit --platform ios`
- [ ] In App Store Connect:
  - [ ] Privacy policy URL added
  - [ ] Age rating: 4+
  - [ ] Category: Health & Fitness
  - [ ] Screenshots: iPhone 6.9" (required), iPhone 6.5" (required), iPad Pro 12.9" (if iPad supported)
  - [ ] App preview video (optional but recommended)
  - [ ] Privacy nutrition labels filled out (camera, photos, usage data)
  - [ ] RevenueCat in-app purchases linked and approved

**Android:**
- [ ] `eas build --platform android --profile production`
- [ ] `eas submit --platform android`
- [ ] In Play Console:
  - [ ] Data safety form completed
  - [ ] Privacy policy URL added
  - [ ] Content rating questionnaire completed
  - [ ] Target audience: 18+
  - [ ] RevenueCat subscriptions published and linked

### 10.6 — Performance Audit
Test on the following real devices (not simulators):
- [ ] iPhone 15 (latest) — smooth, no jank
- [ ] iPhone 12 (older, A14 chip) — AR try-on acceptable framerate
- [ ] Samsung Galaxy S23 (Android flagship) — smooth
- [ ] Samsung Galaxy A32 or similar mid-range Android — all features work, AR may be slower
- [ ] Checklist for each device:
  - [ ] Launch time < 3 seconds
  - [ ] No memory warning during AR try-on session
  - [ ] Routine completion animation is smooth (60fps)
  - [ ] Camera opens without lag for skin analysis and product scanner
  - [ ] Push notifications deliver reliably

### 10.7 — Offline Behavior Verification
Verify each offline scenario from `17-environment-setup.md` Section 9:
- [ ] No internet on launch → cached data shown, "You're offline" banner visible
- [ ] Complete routine step offline → saved to local queue, syncs when reconnected
- [ ] AR try-on offline → works (effects are bundled locally)
- [ ] Barber translator offline → works (data is in `constants/hairstyles.ts`)
- [ ] Skin analysis offline → shows friendly error
- [ ] Product scanner offline → shows friendly error

### 10.8 — Final Pre-Submission Checks
- [ ] No hardcoded user counts, star ratings, or fake social proof anywhere in the UI
- [ ] No `console.log` statements in production code (use Sentry for error logging)
- [ ] All TypeScript errors resolved — `tsc --noEmit` passes with zero errors
- [ ] Medical disclaimer visible on skin analysis results screen
- [ ] "Restore Purchases" button functional
- [ ] All deep links tested: `groomai://sign-in`, `groomai://paywall`, `groomai://barber`
- [ ] App does not crash on first launch with a fresh install (no leftover local state)
- [ ] RevenueCat sandbox subscription tested end-to-end: purchase → webhook fires → profile updates → premium access granted

---

## Done When
- [ ] Privacy policy and Terms of Service are live at public URLs
- [ ] "Delete Account" is functional and wipes all user data
- [ ] App builds successfully for both iOS and Android via EAS
- [ ] Both builds are submitted to App Store Connect and Google Play Console
- [ ] No TypeScript errors, no hardcoded fake data, no `console.log` in production
- [ ] App passes App Store review (first submission — avoid rejections by following all checklist items above)

---

## Post-Launch (Not Blocking)

After the app is live, prioritize these in order:
1. Monitor Sentry for crash spikes in the first 48 hours
2. Watch PostHog funnel: signup → onboarding → trial → purchase conversion rate
3. Add more DeepAR effect files based on which hairstyles users request most
4. Expand the `affiliateProducts` catalog based on which product categories drive the most clicks
5. A/B test paywall copy and pricing using PostHog feature flags
