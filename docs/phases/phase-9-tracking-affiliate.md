# Phase 9 — Tracking, Affiliate & Analytics

## Goal
The hair loss photo tracker is live. The affiliate product recommendation system is wired up throughout the app. PostHog analytics events are firing on every key user action. Sentry is capturing errors in production. The app now has its passive revenue layer (affiliate commissions) running alongside the subscription revenue.

## Complexity: Medium
## Estimated Time: 3–4 days

---

## Reference Docs
- `11-hair-loss-tracker.md` — monthly photo sessions, 5 angles, comparison view, retention hook
- `16-affiliate-system.md` — product database, recommendation engine, click tracking
- `01-project-overview.md` — PostHog + Sentry setup

---

## Step-by-Step Tasks

### 9.1 — Hair Loss Photo Tracker
- [ ] `app/hair-loss-tracker.tsx` — premium-gated
- [ ] **5-angle session flow** (auto-advances through each angle):
  - Top → Front → Back → Left → Right
  - Each angle shows an illustrated guide overlay (silhouette showing correct camera position)
  - User captures each photo in sequence
  - Progress indicator: "Angle 2 of 5 — Front"
- [ ] Each photo:
  - [ ] Captured with `expo-camera` in portrait mode
  - [ ] Uploaded to `hair-loss-photos/{userId}/{YYYY-MM}/{angle}.jpg` in Supabase Storage (private bucket)
  - [ ] Saved to `hair_loss_logs` table with `photo_angle`, `logged_date`
- [ ] Award "+75 XP" on completing a full 5-angle session
- [ ] **Monthly cadence enforcement**: check if a session already exists for current month — if yes, show previous session photos and a "Next session: [date]" message instead of the camera

### 9.2 — Hair Loss Timeline Comparison
- [ ] Timeline screen: grid of monthly sessions by date
- [ ] Tap any month → shows all 5 angles side by side for that month
- [ ] **Before/After comparison view**: select two months → split-screen slider (Reanimated gesture handler) comparing same angle across two dates
- [ ] "Trend" indicator: simple text analysis ("Your photos from the last 3 months look consistent — no significant change detected")
- [ ] All photos loaded from Supabase Storage signed URLs (private bucket — must use `createSignedUrl()`)

### 9.3 — Monthly Retention Notification
- [ ] On the 1st of each month: push notification fires "Time for your monthly hair check-in 📸"
- [ ] Schedule via `expo-notifications` with a monthly trigger
- [ ] Deep link: `groomai://hair-loss-tracker`

### 9.4 — Affiliate Product System
- [ ] Create `constants/affiliateProducts.ts` — full product database (see `16-affiliate-system.md`):
  - Products for each skin type: cleanser, moisturizer, serum, sunscreen, etc.
  - Each entry: `id`, `name`, `brand`, `category`, `suitableFor[]`, `notSuitableFor[]`, `amazonUrl`, `price`, `rating`, `reviewCount`, `affiliateProgram`
- [ ] Implement `services/affiliate.service.ts`:
  - `getRecommendationsForProfile(profile)` — filters by skin type, hair type, budget range
  - `trackClick(userId, productId, source)` — inserts to `affiliate_clicks` table (fire-and-forget)
- [ ] React Query hook: `useAffiliateRecommendations()`

### 9.5 — Wire Affiliate Links Throughout App
Add personalized product recommendations in:
- [ ] **Routine steps** — each step that mentions a product type shows a "Recommended: [Product Name] →" affiliate link (see `05-routine-builder.md` RoutineCard affiliate link note)
- [ ] **Skin analysis results** — recommendations section includes product links matching the user's skin concerns
- [ ] **Home tab** — "Products For You" section with 3 rotating affiliate recommendations
- [ ] **Profile tab** — "My Recommendations" section (full list)
- [ ] Every affiliate link tap: call `affiliateService.trackClick()` before opening the URL

### 9.6 — PostHog Analytics Events
Instrument these key events (see `01-project-overview.md` for PostHog setup):
- [ ] `sign_up` — `{ method: 'email' | 'google' | 'apple' }`
- [ ] `onboarding_completed` — `{ face_shape, skin_type, hair_type }`
- [ ] `trial_started`
- [ ] `paywall_viewed` — `{ trigger: 'feature_gate' | 'trial_expired' | 'manual' }`
- [ ] `purchase_completed` — `{ product_id, price, platform }`
- [ ] `routine_step_completed` — `{ step_id, routine_type }`
- [ ] `routine_completed` — `{ routine_type, steps_count }`
- [ ] `streak_milestone` — `{ days }`
- [ ] `badge_earned` — `{ badge_slug, rarity }`
- [ ] `skin_analysis_completed`
- [ ] `product_scanned` — `{ recommendation }`
- [ ] `ar_tryon_used` — `{ hairstyle_id }`
- [ ] `barber_card_shared` — `{ hairstyle_id }`
- [ ] `affiliate_link_clicked` — `{ product_id, source }`
- [ ] `hair_loss_session_completed`

### 9.7 — Sentry Error Monitoring
- [ ] Initialize Sentry in `app/_layout.tsx` using `EXPO_PUBLIC_SENTRY_DSN`
- [ ] Update `ErrorBoundary.componentDidCatch` to call `Sentry.captureException(error)`
- [ ] Wrap all Edge Function calls in try/catch with `Sentry.captureException` on error
- [ ] Set Sentry user context on login: `Sentry.setUser({ id: userId })`
- [ ] Clear Sentry user on logout: `Sentry.setUser(null)`
- [ ] Test: trigger a deliberate error, confirm it appears in Sentry dashboard

---

## Done When
- [ ] User can complete a full 5-angle hair photo session and see photos saved to Storage
- [ ] Two sessions can be compared side by side with a swipe/slider
- [ ] Monthly reminder notification fires on the 1st
- [ ] Affiliate links appear in routine steps filtered to the user's skin type
- [ ] Every affiliate link click is recorded in `affiliate_clicks` table
- [ ] PostHog dashboard shows events firing on key user actions
- [ ] A deliberate crash appears in Sentry within 60 seconds
