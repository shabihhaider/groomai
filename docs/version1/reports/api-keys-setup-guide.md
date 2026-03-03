# API Keys Setup Guide — GroomAI

> **Last Updated**: 2026-02-28
> **For**: GroomAI V1 Launch
> **File to edit**: `groomai/.env`

---

## Overview

You need 3 services configured before App Store submission:

| Service | Purpose | Env Variable | Priority |
|---|---|---|---|
| RevenueCat | In-app subscriptions | `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `_ANDROID_KEY` | **P0 — BLOCKER** |
| Sentry | Crash reporting | `EXPO_PUBLIC_SENTRY_DSN` | **P1 — HIGH** |
| PostHog | Analytics & events | `EXPO_PUBLIC_POSTHOG_KEY` | **P1 — HIGH** |

---

## Section 1: RevenueCat (In-App Purchases)

RevenueCat manages subscriptions across iOS and Android. Without it, the paywall is non-functional.

### Step 1: Create RevenueCat Account

1. Go to **https://www.revenuecat.com**
2. Click **"Get Started"** → sign up with email or GitHub
3. Free tier supports up to $2,500/month in tracked revenue (plenty for launch)

### Step 2: Create Your App in RevenueCat

1. In the RevenueCat dashboard, click **"+ New Project"**
2. Name it: `GroomAI`
3. Add **two apps** under this project:

#### iOS App
1. Click **"+ New App"** → select **Apple App Store**
2. Enter your **Bundle ID**: `com.groomai.app`
3. You'll need your **App Store Connect Shared Secret**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to your app → **App Information** → **App-Specific Shared Secret** (or General → Shared Secret)
   - Copy and paste it into RevenueCat
4. Save — RevenueCat gives you an **iOS API Key** starting with `appl_`

#### Android App
1. Click **"+ New App"** → select **Google Play Store**
2. Enter your **Package Name**: `com.groomai.app`
3. Upload your **Google Play Service Account JSON** key:
   - Go to [Google Play Console](https://play.google.com/console)
   - **Setup** → **API Access** → **Create Service Account**
   - Follow Google's guide to create a service account in Google Cloud Console
   - Grant it **Financial Data** access in Play Console
   - Download the JSON key file
   - Upload it to RevenueCat
4. Save — RevenueCat gives you an **Android API Key** starting with `goog_`

### Step 3: Create Products in App Stores

#### In App Store Connect:
1. Go to **App Store Connect** → Your App → **Subscriptions**
2. Create a **Subscription Group**: `GroomAI Premium`
3. Add 3 products:

| Product ID | Type | Price | Duration |
|---|---|---|---|
| `groomai_monthly` | Auto-Renewable | $7.99 | 1 month |
| `groomai_annual` | Auto-Renewable | $49.99 | 1 year |
| `groomai_lifetime` | Non-Consumable | $129.99 | Lifetime |

4. Fill in localization (display name, description) for each
5. Submit for review (can be done alongside app review)

#### In Google Play Console:
1. Go to **Google Play Console** → Your App → **Monetize** → **Subscriptions**
2. Create matching products with the **same Product IDs** as iOS
3. Set prices (Google auto-converts to local currencies)

### Step 4: Configure Products in RevenueCat

1. In RevenueCat dashboard → **Products** → add all 3 product IDs
2. Create an **Entitlement**: `premium`
3. Attach all 3 products to the `premium` entitlement
4. Create an **Offering**: `default`
5. Add all 3 products as **Packages** in the offering:
   - `$rc_monthly` → `groomai_monthly`
   - `$rc_annual` → `groomai_annual`
   - `$rc_lifetime` → `groomai_lifetime`

### Step 5: Set API Keys in .env

Open `groomai/.env` and replace the placeholder values:

```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_XXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_XXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 6: Set Webhook Secret in Supabase

RevenueCat can notify your backend about subscription changes:

1. In RevenueCat → **Integrations** → **Webhooks**
2. Set the webhook URL to your Supabase Edge Function:
   ```
   https://nthiyvnjypvscgfeotyh.supabase.co/functions/v1/revenuecat-webhook
   ```
3. Copy the **Webhook Signing Secret**
4. Set it in Supabase:
   ```bash
   supabase secrets set REVENUECAT_WEBHOOK_SECRET=whsec_XXXXXX
   ```

### Step 7: Test Purchase Flow

1. **iOS**: Create a [Sandbox Test Account](https://appstoreconnect.apple.com/access/testers) in App Store Connect
2. **Android**: Add your email as a [License Tester](https://play.google.com/console) in Play Console → Setup → License Testing
3. Build a preview/development build
4. Test: Open paywall → Select plan → Complete purchase → Verify premium features unlock
5. Test **Restore Purchases** button on a different device

---

## Section 2: Sentry (Crash Reporting)

Sentry captures runtime errors and crashes. The app's `ErrorBoundary` already calls `Sentry.captureException()` — it just needs a DSN to send data to.

### Step 1: Create Sentry Account

1. Go to **https://sentry.io**
2. Click **"Start for Free"**
3. Sign up with email or GitHub
4. Free tier: 5,000 errors/month (sufficient for launch)

### Step 2: Create a Project

1. In the Sentry dashboard, click **"Create Project"**
2. Platform: select **React Native**
3. Project name: `groomai`
4. Team: Create or select your team
5. Click **"Create Project"**

### Step 3: Get Your DSN

1. After project creation, Sentry shows your **DSN** in the setup wizard
2. It looks like:
   ```
   https://abc123def456@o123456.ingest.us.sentry.io/7890123
   ```
3. You can also find it later at: **Settings → Projects → groomai → Client Keys (DSN)**

### Step 4: Set DSN in .env

```env
EXPO_PUBLIC_SENTRY_DSN=https://abc123def456@o123456.ingest.us.sentry.io/7890123
```

### Step 5: Verify

1. Run the app in development
2. Trigger an error (e.g., navigate to a screen that throws)
3. Check the Sentry dashboard — the error should appear within 30 seconds
4. Alternatively, add a temporary test:
   ```typescript
   import * as Sentry from '@sentry/react-native'
   Sentry.captureMessage('Test from GroomAI - delete me')
   ```

### Optional: Source Maps for EAS Builds

For readable stack traces in production builds, add to your EAS build:

```json
// In eas.json, under production build:
{
  "build": {
    "production": {
      "env": {
        "SENTRY_ORG": "your-sentry-org",
        "SENTRY_PROJECT": "groomai"
      }
    }
  }
}
```

And configure `@sentry/react-native/expo` plugin in `app.json` (already added).

---

## Section 3: PostHog (Analytics)

PostHog tracks user events (sign-up, paywall views, feature usage, etc.). The app already has 15+ events wired up in `lib/analytics.ts` — they just need a destination.

### Step 1: Create PostHog Account

1. Go to **https://posthog.com**
2. Click **"Get Started Free"**
3. Sign up with email or GitHub
4. Choose **PostHog Cloud** (recommended) or self-hosted
5. Select region:
   - **US** (`https://us.i.posthog.com`) — recommended for most users
   - **EU** (`https://eu.i.posthog.com`) — if you need EU data residency
6. Free tier: **1 million events/month** (very generous for launch)

### Step 2: Get Your Project API Key

1. In the PostHog dashboard, go to **Settings** (gear icon)
2. Under **Project** → **Project API Key**
3. Copy the key — it looks like: `phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
4. Note your **Host URL** (shown on the same page):
   - US: `https://us.i.posthog.com`
   - EU: `https://eu.i.posthog.com`

### Step 3: Set Keys in .env

```env
EXPO_PUBLIC_POSTHOG_KEY=phc_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Step 4: Verify

1. Run the app in development
2. Complete the sign-up flow or navigate to a tracked screen
3. In PostHog dashboard → **Events** → you should see events appearing in real-time
4. Key events to check:
   - `sign_up` — after creating an account
   - `paywall_viewed` — after opening the paywall
   - `routine_completed` — after completing a routine

### Optional: Feature Flags

PostHog also supports feature flags for A/B testing paywall copy:

1. In PostHog → **Feature Flags** → Create flag
2. e.g., `paywall-copy-v2` with 50/50 rollout
3. Read in code: `posthog.isFeatureEnabled('paywall-copy-v2')`

---

## Section 4: Summary Checklist

### Must-Do Before Launch
- [ ] RevenueCat account created
- [ ] iOS app added with App Store shared secret
- [ ] Android app added with service account JSON
- [ ] 3 subscription products created in App Store Connect
- [ ] 3 subscription products created in Google Play Console
- [ ] Products configured in RevenueCat (entitlement + offering)
- [ ] `EXPO_PUBLIC_REVENUECAT_IOS_KEY` set in `.env`
- [ ] `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` set in `.env`
- [ ] Sentry project created
- [ ] `EXPO_PUBLIC_SENTRY_DSN` set in `.env`
- [ ] PostHog project created
- [ ] `EXPO_PUBLIC_POSTHOG_KEY` set in `.env`
- [ ] `EXPO_PUBLIC_POSTHOG_HOST` set in `.env`
- [ ] RevenueCat webhook secret set in Supabase secrets
- [ ] Test purchase flow on iOS sandbox
- [ ] Test purchase flow on Android license testing
- [ ] Verify Sentry receives a test error
- [ ] Verify PostHog receives a test event

### After First Production Build
- [ ] Upload Sentry source maps (automatic with EAS + @sentry/react-native/expo plugin)
- [ ] Set up PostHog feature flags for paywall A/B testing
- [ ] Configure RevenueCat Charts for revenue tracking
- [ ] Set up Sentry alerts for high error rates
