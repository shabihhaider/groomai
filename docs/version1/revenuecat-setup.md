# RevenueCat Test Product Setup Guide

> **Goal**: Make the paywall show real prices instead of dashes in development.
> The dashes appear because no test products exist in App Store Connect / Google Play yet —
> RevenueCat has nothing to fetch. This is a configuration issue, not a code bug.

---

## 1. Create RevenueCat Account (Free)

1. Go to [app.revenuecat.com](https://app.revenuecat.com) → Sign up
2. Create a new project → Name it **GroomAI**
3. Note your **Public API Key** for iOS and Android

## 2. App Store Connect (iOS) — Free Sandbox Testing

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Navigate to **My Apps → GroomAI → Subscriptions**
3. Create a **Subscription Group** called `Premium`
4. Add three products with these exact IDs (must match `paywall.tsx`):

| Product ID | Type | Reference Name |
|---|---|---|
| `groomai.monthly` | Auto-Renewable | Monthly Premium |
| `groomai.annual` | Auto-Renewable | Annual Premium |
| `groomai.lifetime` | Non-Consumable | Lifetime Premium |

5. Set prices for each product (sandbox testing uses real price tiers but never charges)
6. Go to **Users & Access → Sandbox Testers** → Add a test Apple ID
7. On your test device, sign out of the real App Store and sign in with the sandbox tester account

## 3. Google Play Console (Android) — Free Internal Testing

1. Go to [play.google.com/console](https://play.google.com/console)
2. Navigate to **GroomAI → Monetize → Products → Subscriptions**
3. Create three products with the same IDs:
   - `groomai.monthly` — Monthly subscription
   - `groomai.annual` — Annual subscription
4. Create a separate **In-app product** for `groomai.lifetime`
5. Go to **Testing → Internal testing** → Add your email as a tester
6. Google automatically uses test cards for internal testers — no real charges

## 4. Link Products to RevenueCat

1. In RevenueCat dashboard → **Products** → Add each product ID
2. Create an **Offering** called `default`
3. Create a **Package** for each:
   - `$rc_monthly` → link to `groomai.monthly`
   - `$rc_annual` → link to `groomai.annual`
   - `$rc_lifetime` → link to `groomai.lifetime`
4. Set `default` offering as the **Current Offering**

## 5. Configure App

1. In RevenueCat → **API Keys** → Copy iOS and Android public keys
2. Set environment variables:
   ```
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxx
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxx
   ```
3. The app code in `paywall.tsx` already calls `Purchases.getOfferings()` —
   once products are linked, prices will appear automatically

## 6. Verify

- Run the app on a **real device** (not simulator) with a sandbox tester account
- Open the Paywall screen → prices should now show instead of dashes
- Try purchasing → will go through sandbox flow (no real charge)
- Check RevenueCat dashboard → should show the test transaction

> **Note**: RevenueCat prices will NOT work in Expo Go or web builds.
> You must test on a real iOS/Android device with a development build.
