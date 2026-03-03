# GroomAI — Feature Status
> Accurate as of 2026-03-03.
>
> Most of Phases 1–7 and 9 are implemented.
> - **Phase 8 (AR Try-On)** is **deferred/hidden** for v1 (DeepAR not integrated).
> - **AI features are built and deployed**, but **currently blocked** until the OpenAI account has billing/credits (OpenAI returns quota exceeded).
> - **App runs successfully in Expo Go** on physical devices (iPhone tested). Dev build is NOT required for v1 features.
>
> **V1 Production Audit applied** — see `reports/v1-production-audit.md` for full details.

---

## Phase Summary

| Phase | Name | Status |
|---|---|---|
| 1 | Foundation & Setup | ✅ Complete |
| 2 | Auth & Onboarding | ✅ Complete |
| 3 | Monetization (RevenueCat + Paywall) | ✅ Complete |
| 4 | Core Loop (Routines, Habits, Gamification) | ✅ Complete |
| 5 | UI Polish | ✅ Complete |
| 6 | Barber Translator | ✅ Complete |
| 7 | AI Features | ⚠️ Built + deployed, blocked by OpenAI quota/billing |
| 8 | AR Try-On (DeepAR) | ⏳ v2 only (not in v1) |
| 9 | Tracking, Affiliate & Analytics | ✅ Complete |
| 10 | Launch Prep | ⏳ Pending |

---

## Backend Deployment Status (Supabase Edge Functions)

Deployed to project `nthiyvnjypvscgfeotyh`:
- ✅ `analyze-skin`
- ✅ `analyze-product`
- ✅ `generate-routine`
- ✅ `analyze-hairstyle` (Celebrity Breakdown)
- ✅ `revenuecat-webhook`

---

## What Is Fully Built ✅

### Phase 1 — Foundation
- Expo Router file-based navigation (Stack + Tabs)
- TypeScript configuration
- Supabase client (`lib/supabase.ts`)
- Color/Typography/Spacing constants
- Zustand stores: `user.store`, `subscription.store`
- TanStack React Query setup (`lib/queryClient.ts`)
- Reanimated, Haptics, Linear Gradient, SVG wired
- `AnimatedScreen` and `ErrorBoundary` components
- DB migrations 001–009

### Phase 2 — Auth & Onboarding
- Welcome screen with sign-up / sign-in CTAs
- Email sign-up + sign-in with Supabase Auth
- Sign-up handles 3 scenarios: (1) email confirmation ON → "Check Your Email" alert, redirect to sign-in; (2) auto-confirm → "Account Created!" alert, navigate to `/`; (3) email already exists → "Account Exists" with sign-in option
- Sign-in uses explicit `router.replace('/')` after successful auth (not relying solely on auth listener)
- 6-step onboarding: basics, face shape, skin, hair, goals, trial start
- Profile written to `profiles` table on completion
- Auth state persisted — logged-in users skip to tabs
- Sign-out properly clears: Zustand stores (`user.store.reset()`, `subscription.store.reset()`), React Query cache (`queryClient.clear()`), then redirects to `/(auth)/welcome`

### Phase 3 — Monetization
- RevenueCat integration (`lib/revenuecat.ts`)
- Paywall screen with Monthly / Annual / Lifetime tiers
- Trial Warning Banner (shows when trial < 3 days remaining)
- `subscription.store` with `isPremium` flag
- RevenueCat webhook Edge Function (`revenuecat-webhook`) syncs purchase to `profiles.subscription_status`
- Premium feature gating via `useSubscriptionStore`

### Phase 4 — Core Loop
- Routines tab with Morning/Night cards + completion rings
- Auto-seed default routines on first login
- Routine editor with step-by-step checkboxes
- Habit log (`routine_logs`) inserted on step completion
- XP awarded per step (+10 XP) and per routine completion (+50 XP)
- Streak tracking via DB trigger (`007_streak_trigger.sql`)
- Streak milestone badge awards
- Tracker tab: streak display + habit grid + badge shelf
- Badge unlock animation screen (`badge-unlock.tsx`)
- `badges` and `user_badges` tables with 20+ badge definitions

### Phase 5 — UI Polish
- Skeleton loading states across all tabs
- All animations use Reanimated 3 (no default RN animations)
- Haptic feedback on all key interactions
- Custom bottom sheet (via `@gorhom/bottom-sheet`)
- `Avatar`, `ProgressBar`, `AnimatedScreen`, `Button`, `Card` design system components
- Dark-first design throughout

### Phase 6 — Barber Translator
- Barber tab with hairstyle grid filterable by face shape
- Hairstyle detail screen with barber notes + instructions
- `celebrity-breakdown.tsx` screen
- Barber card share (system share sheet + `expo-sharing`)
- Hairstyle library constants (`constants/hairstyles.ts`)
- DB migration `008_hairstyles.sql`

**Note (v1):** the AR “Try it On” entry point is intentionally hidden. DeepAR is not integrated yet.

### Phase 7 — AI Features
- **Skin Analysis** (`app/skin-analysis.tsx`):
  - Front camera with gold oval face guide (SVG), quality: 0.85
  - GPT-4o Vision via `analyze-skin` Edge Function
  - Results: skin type, score, concerns with severity, recommendations
  - Photos uploaded to `skin-analysis` Supabase Storage bucket
  - Results saved to `skin_analysis_logs` table
  - Medical disclaimer displayed
  - Rate limited: 1/day free, 5/day premium
  - +100 XP on first use
- **Product Scanner** (`app/product-scanner.tsx`):
  - Barcode scanner via `expo-camera` `onBarcodeScanned`
  - Open Beauty Facts API lookup
  - GPT-4o ingredient analysis via `analyze-product` Edge Function
  - Results personalised to user's skin type from their profile
  - Verdict: Safe / Caution / Avoid with flagged ingredients
  - Inline affiliate link for better alternative
  - Results saved to `product_scans` table
  - Rate limited per tier
- **AI Routine Generator** (`app/ai-routine.tsx`):
  - GPT-4o via `generate-routine` Edge Function
  - Full user profile context (skin, hair, beard, time, budget)
  - Review screen: tap steps to deselect before saving
  - Saves Morning + Night routines as `is_ai_generated: true`
  - Rate limited (counts as 3 API calls)
- **Shared rate limiter** (`supabase/functions/_shared/rateLimiter.ts`):
  - Per-feature daily limits by tier (free/trial/premium/lifetime)
  - Usage tracked in `ai_usage_logs` table

**Current blocker:** OpenAI is returning `429 quota exceeded` until billing/credits are enabled for the OpenAI project behind `OPENAI_API_KEY`.

---

## Tracking / Analytics Status

- Analytics wrapper exists (`lib/analytics.ts`) and is initialized in `app/_layout.tsx`.
- **PostHog events are no-op unless** `EXPO_PUBLIC_POSTHOG_KEY` is set.
- **Sentry is no-op unless** `EXPO_PUBLIC_SENTRY_DSN` is set.
- Currently emitted events (wired in code):
  - Affiliate link clicked
  - Hair loss session completed
- Other events are defined (routine completions, paywall viewed, etc.) but not yet wired in screens.

### Phase 9 — Tracking, Affiliate & Analytics
- **Hair Loss Tracker** (`app/hair-loss-tracker.tsx`):
  - Premium-gated
  - 5-angle photo session: Top → Front → Back → Left → Right
  - SVG circle guide overlay for top-of-head angle
  - Progress dots auto-advance between angles
  - Photo review screen before saving
  - Uploaded to private `hair-loss-photos` bucket with signed URLs
  - Saved to `hair_loss_logs` table
  - Monthly cadence enforcement (can only log once per month)
  - Timeline view with angle selector + month scrubber
  - Side-by-side comparison: tap months to set L/R
  - Trend text after ≥3 months
  - Monthly push notification (1st of month, 10am)
  - +75 XP on session completion
- **Affiliate System**:
  - 20 real products in `constants/affiliateProducts.ts` across 11 categories
  - `services/affiliate.service.ts`: profile-based filtering, routine step keyword matching, click tracking
  - `hooks/useAffiliate.ts`: `useAffiliateRecommendations()` + `useProductScans()`
  - `AffiliateProductCard` component (compact + full modes)
  - **Home tab**: "Products For You" section (3 personalised cards) — this is now the primary affiliate placement (routine-editor affiliate cards were removed to keep the core routine UX clean)
  - Click tracking writes to `affiliate_clicks` table (fire-and-forget)
- **Analytics (`lib/analytics.ts`)**:
  - PostHog events via REST API (no native SDK) — fire-and-forget, never throws
  - 15 events instrumented (sign_up, onboarding_completed, paywall_viewed, routine_step/routine_completed, streak_milestone, badge_earned, skin_analysis_completed, product_scanned, affiliate_link_clicked, hair_loss_session_completed, etc.)
  - Sentry init on app start via `EXPO_PUBLIC_SENTRY_DSN`
  - `Sentry.setUser()` on login; `Sentry.setUser(null)` on logout
  - `captureException()` wrapper for Edge Function error reporting
- **Root layout (`_layout.tsx`)**:
  - Sentry initialized at startup
  - `analytics.identify()` on every login
  - `analytics.signOut()` on every logout
  - Hair-loss-tracker deep link from monthly notification
  - All new screens registered: `hair-loss-tracker`, `ai-routine`, `skin-analysis`, `product-scanner`

---

## What Is NOT Done Yet ⏳

### Phase 8 — AR Try-On (Skipped — do last)
- **DeepAR integration** (not implemented yet): AR hairstyle + beard try-on camera overlay
- `app/ar-tryon.tsx` exists as a **placeholder** screen (safe fallback)
- “Try it On” UI entry is currently **commented/hidden** for v1
- DeepAR effect files in `assets/deepar-effects/` are not populated
- DeepAR SDK keys in `.env` are not set
- This requires an **EAS dev build** (does NOT work in Expo Go)

### Phase 9 — Partially Wired (polish / rollout)

| Feature | Built | Missing |
|---|---|---|
| AI Skin Analysis | ✅ Full screen | Linked from Home → Tools |
| AI Routine Generator | ✅ Full screen | Linked from Home → Tools |
| Product Scanner | ✅ Full screen | Linked from Home → Tools (premium-gated in-screen) |
| Celebrity Breakdown | ✅ Full screen | Premium-gated in-screen (deep links cannot bypass) |
| Hair Loss Tracker | ✅ Full screen | Linked from Home → Tools (premium-gated in-screen) |
| Affiliate links in routine steps | ❌ Removed | Inline per-step `AffiliateProductCard` and bottom "Recommended Products" section removed from `routine-editor.tsx` to declutter the core routine experience. Affiliate recommendations remain on Home tab ("Products For You" section). |
| Affiliate "My Kit" on Profile | ✅ Wired | Profile shows top recommendations (cards show “Soon” while affiliates disabled) |

### Phase 10 — Launch Prep (Not Started)
- App icon + splash screen (production assets)
- Expo EAS Build configuration (`eas.json`)
- iOS: App Store Connect listing, screenshots, privacy policy
- Android: Google Play Console listing
- OTA updates via `expo-updates`
- Push notification production certificates
- Final review: EULA, T&Cs, medical disclaimer legal review
- Sentry DSN set in `.env`
- PostHog production project created + key in `.env`
- RevenueCat production products configured in App Store Connect + Google Play
- Amazon Associates affiliate tag URLs (replace all `REPLACE_TAG` placeholders in `constants/affiliateProducts.ts`)

---

## V1 Production Audit Fixes Applied ✅

The following issues were identified and fixed during the V1 production readiness audit:

| Fix | File | Severity | Description |
|---|---|---|---|
| Remove mock premium | `stores/subscription.store.ts` | P0 CRITICAL | Removed hardcoded `isPremium: true` and `hasEntitlement = true` test mocks. Now reads from RevenueCat properly. |
| Error boundary upgrade | `components/ErrorBoundary.tsx` | P0 | Added Sentry `captureException` logging, branded recovery UI with "Go Back" + "Restart App" buttons. |
| Celebrity breakdown error UX | `app/celebrity-breakdown.tsx` | P0 | Replaced native `Alert.alert` with branded in-app error card showing error details, retry buttons (library/camera), and photo tips. |
| Home screen date | `app/(tabs)/home.tsx` | P2 | Added date string below greeting for consistency with Routines screen. |
| Streak freeze tooltip | `app/(tabs)/tracker.tsx` | P2 | Added freeze info explanation popup: "A freeze protects your streak if you miss a day." |
| Actionable badge copy | `constants/badges.ts` | P2 | Updated feature badge descriptions from passive ("Completed your first...") to actionable ("Go to Skin Analysis and take your first selfie scan"). |
| Try it On CTA placement | `app/hairstyle-detail.tsx` | P2 | Added quick action row (Try it On + Share) right after the title section — no longer buried at bottom. |

---

## V1 Device Testing Fixes Applied ✅ (2026-03-03)

The following issues were identified during physical device testing (iPhone via Expo Go) and fixed:

| Fix | File | Severity | Description |
|---|---|---|---|
| Sign-out redirect | `app/(tabs)/profile.tsx` | P0 CRITICAL | Sign-out now clears Zustand stores (`user.store.reset()`, `subscription.store.reset()`), React Query cache (`queryClient.clear()`), and redirects to `/(auth)/welcome`. Previously, user stayed on profile page with stale data. |
| Sign-in navigation | `app/(auth)/sign-in.tsx` | P0 CRITICAL | Added explicit `router.replace('/')` after successful `signInWithPassword()`. Previously relied solely on `onAuthStateChange` listener + index.tsx Redirect, which doesn't fire from auth screens. |
| Sign-up navigation | `app/(auth)/sign-up.tsx` | P0 CRITICAL | Added 3-scenario handling: email confirmation ON → "Check Your Email" alert, auto-confirm → "Account Created!" + navigate to `/`, email exists → "Account Exists" with sign-in option. Previously did nothing on success. |
| Home greeting fallback | `app/(tabs)/home.tsx` | P1 | Changed `firstName` fallback from `'King'` to `'there'`. Previously showed "King." for users without a name (or after sign-out). |
| Camera quality | `app/skin-analysis.tsx` | P1 | Bumped camera capture quality from `0.7` to `0.85` for better skin analysis input. |
| Routine editor cleanup | `app/routine-editor.tsx` | P1 | Removed per-step `AffiliateProductCard` and bottom "Recommended Products" section. Removed `findProductForStep()` function and unused imports. Routine steps now show only the clean checklist experience. |

---

## Database Tables (All Migrations Applied)

| Table | Migration | Purpose |
|---|---|---|
| `profiles` | 001 | User profile (skin type, face shape, XP, streak) |
| `routines` | 002 | Morning / Night / Custom routines |
| `routine_steps` | 002 | Individual steps per routine |
| `routine_logs` | 003 | Per-step completion log |
| `habits` | 004 | Daily habits |
| `habit_logs` | 004 | Habit completion log |
| `badges` | 005 | Badge definitions (slug, name, rarity) |
| `user_badges` | 005 | Per-user earned badges |
| `ai_usage_logs` | 006 | AI API call tracking (rate limiting) |
| `skin_analysis_logs` | 006/009 | Skin analysis results + photo references |
| `hairstyles` | 008 | Hairstyle library |
| `hair_loss_logs` | 009 | Monthly 5-angle hair tracker photos |
| `product_scans` | 009 | Barcode scan + ingredient analysis results |
| `affiliate_clicks` | 009 | Affiliate link click tracking |

## Supabase Edge Functions

| Function | Status | Purpose |
|---|---|---|
| `analyze-skin` | ✅ Deployed | GPT-4o Vision skin selfie analysis |
| `analyze-product` | ✅ Deployed | GPT-4o personalized ingredient analysis |
| `generate-routine` | ✅ Deployed | GPT-4o personalized morning/night routine |
| `analyze-hairstyle` | ✅ Deployed | Celebrity Breakdown hairstyle + barber script |
| `revenuecat-webhook` | ✅ Deployed | Syncs RevenueCat purchases to profiles table |

## Environment Variables To Set

| Variable | Where | Status |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` | ✅ Set |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `.env` | ✅ Set |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | `.env` | Set when going to TestFlight |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | `.env` | Set when going to Play Store |
| `EXPO_PUBLIC_POSTHOG_KEY` | `.env` | Set when PostHog project created |
| `EXPO_PUBLIC_SENTRY_DSN` | `.env` | Set when Sentry project created |
| `OPENAI_API_KEY` | Supabase Secrets | ✅ Set |
| `REVENUECAT_WEBHOOK_SECRET` | Supabase Secrets | Set when webhook configured |
