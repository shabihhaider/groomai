# Phase 3 — Monetization Gate

## Goal
RevenueCat is initialized and the paywall screen is built. Every premium feature route is protected. The RevenueCat webhook is deployed and verified. This phase must be completed **before** any premium features are built — the gate must exist before the content behind it.

## Complexity: Medium
## Estimated Time: 2–3 days

---

## Reference Docs
- `12-monetization.md` — full RevenueCat setup, paywall screen, trial warning, webhook
- `03-navigation.md` — `requirePremium()` guard pattern

---

## Step-by-Step Tasks

### 3.1 — RevenueCat App Store Configuration
- [ ] In App Store Connect: create 3 in-app purchase products:
  - `groomai.monthly` — Auto-renewable subscription
  - `groomai.annual` — Auto-renewable subscription
  - `groomai.lifetime` — Non-consumable (one-time)
- [ ] In Google Play Console: create matching subscription + one-time products with identical IDs
- [ ] In RevenueCat Dashboard: add both App Store and Play Store apps, link the product IDs
- [ ] In RevenueCat Dashboard: create an Entitlement named `premium`, attach all 3 products to it
- [ ] In RevenueCat Dashboard: create an Offering named `default`, add all 3 products as packages

### 3.2 — RevenueCat SDK Initialization
- [ ] Create `lib/revenuecat.ts` — initialize with `Platform.select({ ios: EXPO_PUBLIC_REVENUECAT_IOS_KEY, android: EXPO_PUBLIC_REVENUECAT_ANDROID_KEY })`
- [ ] Call initialization in `app/_layout.tsx` on app start
- [ ] On successful Supabase auth, call `Purchases.logIn(userId)` to identify the user
- [ ] On sign-out, call `Purchases.logOut()`

### 3.3 — Paywall Screen
- [ ] `app/paywall.tsx` — presented as a bottom sheet modal (see `12-monetization.md`)
- [ ] Shows all 3 pricing options (monthly, annual, lifetime)
- [ ] Annual plan visually highlighted as "Best Value" with savings callout
- [ ] "Most Popular" badge on annual plan
- [ ] Feature list: 5 bullets showing what premium unlocks
- [ ] Dynamic pricing text — load from RevenueCat `Offerings`, do NOT hardcode "$7.99"
- [ ] **Do NOT hardcode user count or star rating** — see `12-monetization.md` for App Store compliance note
- [ ] `handlePurchase(package)` — calls `Purchases.purchasePackage()`, handles success + error
- [ ] "Restore Purchases" button (required by App Store guidelines)
- [ ] "Continue with free plan" dismiss option
- [ ] On successful purchase: update `profile.subscription_status` in Zustand + navigate away

### 3.4 — Subscription State Management
- [ ] Implement `stores/subscription.store.ts` — `isPremium`, `subscriptionStatus`, `entitlements`
- [ ] On app launch: call `Purchases.getCustomerInfo()` and sync to store
- [ ] Update `hooks/useSubscription.ts` with full logic (see `12-monetization.md`):
  - `isPremium`: true if status is `premium`, `lifetime`, or active `trial`
  - `isTrialing`: status is `trial`
  - `trialDaysLeft`: calculated from `trial_ends_at`
  - `requirePremium(callback)`: calls callback or pushes to `/paywall`

### 3.5 — Trial Warning Banner
- [ ] `components/paywall/TrialWarningBanner.tsx` — shown as a modal on app open when `trialDaysLeft <= 2`
- [ ] "Your free trial ends in X day(s)" with upgrade CTA
- [ ] "Remind me later" option (dismiss for 24h using AsyncStorage timestamp)

### 3.6 — RevenueCat Webhook
- [ ] Deploy `supabase/functions/revenuecat-webhook/index.ts` (full code in `12-monetization.md`)
- [ ] Deploy: `supabase functions deploy revenuecat-webhook`
- [ ] In RevenueCat Dashboard → Project Settings → Webhooks: add the Edge Function URL
- [ ] Set the webhook secret in RevenueCat to match `REVENUECAT_WEBHOOK_SECRET` in Supabase Secrets
- [ ] Test webhook: trigger a sandbox purchase, verify `profiles.subscription_status` updates to `premium`
- [ ] Test idempotency: send the same webhook event twice, confirm second returns 200 without duplicating DB writes

### 3.7 — Premium Gate on All Feature Routes
Apply `requirePremium()` gate to these screens (all navigations to them should go through the hook):
- [ ] `ar-tryon.tsx`
- [ ] `skin-analysis.tsx`
- [ ] `product-scanner.tsx`
- [ ] `hair-loss-tracker.tsx`
- [ ] Custom routine creation (in routines tab)
- [ ] AI routine generator button

---

## Done When
- [ ] Paywall screen shows correct dynamic prices from RevenueCat
- [ ] Sandbox purchase on iOS upgrades the user to premium (status visible in Supabase)
- [ ] Sandbox purchase on Android upgrades the user to premium
- [ ] Webhook processes events and updates `profiles.subscription_status` correctly
- [ ] Duplicate webhook event is silently deduplicated (idempotency works)
- [ ] Free user pressing any premium feature sees the paywall, not a crash
- [ ] Trial warning banner appears when ≤ 2 days remain
- [ ] "Restore Purchases" button works for returning customers
