# Monetization & Paywall

## Overview
Revenue model: **Reverse Trial Freemium** + **RevenueCat** for subscription management. Users get 7 days of full premium automatically after onboarding. When trial ends, they hit the paywall. This is psychologically the most effective model — they've already used and valued the features.

---

## Pricing Structure

| Plan | Price | App Store ID |
|---|---|---|
| Monthly | $7.99/month | `groomai.monthly` |
| Annual | $49.99/year | `groomai.annual` |
| Lifetime | $129.99 (one-time) | `groomai.lifetime` |

**Show a "Best Value" badge on Annual. If you show a savings % (e.g., “Save 48%”), compute it dynamically from the current localized prices returned by RevenueCat Offerings (monthly vs annual).**

Note: the table above is your *pricing model*. In the paywall UI, always display the localized price strings returned by RevenueCat Offerings (never hardcode `$7.99`, `$49.99`, etc.).

---

## RevenueCat Setup

### Install
```bash
npm install react-native-purchases
npx expo install react-native-purchases
```

### Initialize (`lib/revenuecat.ts`)
```typescript
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { Platform } from 'react-native'

export function initRevenueCat(userId: string) {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE)

  // Use your Supabase `profiles.id` (auth user id) as RevenueCat `appUserID`.
  // This makes webhook processing straightforward because `event.app_user_id` can map directly to `profiles.id`.

  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!, appUserID: userId })
  } else {
    Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!, appUserID: userId })
  }
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings()
  return offerings.current
}

export async function purchasePackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg)
  return customerInfo
}

export async function restorePurchases() {
  const customerInfo = await Purchases.restorePurchases()
  return customerInfo
}

export async function checkSubscriptionStatus() {
  const customerInfo = await Purchases.getCustomerInfo()
  const isActive = customerInfo.activeSubscriptions.length > 0
  const isLifetime = typeof customerInfo.entitlements.active['premium'] !== 'undefined'
  return { isActive, isLifetime, customerInfo }
}
```

---

## Subscription Store (`stores/subscription.store.ts`)

```typescript
import { create } from 'zustand'
import Purchases, { CustomerInfo } from 'react-native-purchases'

interface SubscriptionStore {
  isPremium: boolean
  isTrialing: boolean
  trialEndsAt: Date | null
  customerInfo: CustomerInfo | null
  setCustomerInfo: (info: CustomerInfo) => void
  checkStatus: () => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  isPremium: false,
  isTrialing: false,
  trialEndsAt: null,
  customerInfo: null,

  setCustomerInfo: (info) => {
    const hasEntitlement = !!info.entitlements.active['premium']
    set({ isPremium: hasEntitlement, customerInfo: info })
  },

  checkStatus: async () => {
    const info = await Purchases.getCustomerInfo()
    const hasEntitlement = !!info.entitlements.active['premium']
    set({ isPremium: hasEntitlement, customerInfo: info })
  }
}))
```

---

## Paywall Screen (`app/paywall.tsx`)

This screen must be so good that users feel **they'd be stupid not to subscribe**. Every word is intentional.

```tsx
import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import LottieView from 'lottie-react-native'
import Purchases, { PurchasesPackage } from 'react-native-purchases'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'

const FEATURES = [
  { icon: '🪞', text: 'AR Hairstyle & Beard Try-On' },
  { icon: '🔬', text: 'AI Skin Analysis from selfie' },
  { icon: '📦', text: 'Product Ingredient Scanner' },
  { icon: '📸', text: 'Monthly Hair Loss Tracker' },
  { icon: '✂️', text: 'Full Barber Translator (50+ cuts)' },
  { icon: '🤖', text: 'AI-Personalized Routines' },
  { icon: '🏆', text: 'Full Badge & Achievement System' },
  { icon: '🚫', text: 'Ad-Free Experience' },
]

export default function PaywallScreen() {
  const [offerings, setOfferings] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly' | 'lifetime'>('annual')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Purchases.getOfferings().then(o => setOfferings(o.current))
  }, [])

  async function handlePurchase() {
    if (!offerings) return
    setLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      const pkg = getPackageForPlan(offerings, selectedPlan)
      if (!pkg) throw new Error('No purchasable package found for selected plan')

      await Purchases.purchasePackage(pkg)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.back()
    } catch (e: any) {
      if (!e.userCancelled) {
        // Show error toast
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1200', '#0a0a0a']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
          <LottieView
            source={require('@/assets/animations/crown.json')}
            autoPlay loop
            style={styles.heroAnimation}
          />
          <Text style={styles.heroTitle}>Unlock Your{'\n'}Full Blueprint</Text>
          <Text style={styles.heroSubtext}>
            {/* DO NOT hardcode a user count here — Apple review flags static fake numbers on paywalls.
                Query your real count from Supabase daily and cache it, or use copy like:
                "Trusted by thousands of men worldwide" which is generic and safe. */}
            Trusted by thousands of men worldwide
          </Text>
        </Animated.View>

        {/* Features list */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
              <Text style={styles.featureCheck}>✓</Text>
            </View>
          ))}
        </Animated.View>

        {/* Plan selector */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.plans}>
          
          {/* Annual — default selected, "Best Value" badge */}
          <Pressable
            style={[styles.plan, selectedPlan === 'annual' && styles.planSelected]}
            onPress={() => { setSelectedPlan('annual'); Haptics.selectionAsync() }}
          >
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>{getAnnualSavingsLabel(offerings)}</Text>
            </View>
            <Text style={styles.planName}>Annual</Text>
            <Text style={styles.planPrice}>{getPlanPriceString(offerings, 'annual')}</Text>
            <Text style={styles.planPriceMonthly}>{getPlanSecondaryLabel(offerings, 'annual')}</Text>
          </Pressable>

          {/* Monthly */}
          <Pressable
            style={[styles.plan, selectedPlan === 'monthly' && styles.planSelected]}
            onPress={() => { setSelectedPlan('monthly'); Haptics.selectionAsync() }}
          >
            <Text style={styles.planName}>Monthly</Text>
            <Text style={styles.planPrice}>{getPlanPriceString(offerings, 'monthly')}</Text>
          </Pressable>

          {/* Lifetime */}
          <Pressable
            style={[styles.plan, selectedPlan === 'lifetime' && styles.planSelected]}
            onPress={() => { setSelectedPlan('lifetime'); Haptics.selectionAsync() }}
          >
            <Text style={styles.planName}>Lifetime</Text>
            <Text style={styles.planPrice}>{getPlanPriceString(offerings, 'lifetime')}</Text>
            <Text style={styles.planPriceMonthly}>One-time payment</Text>
          </Pressable>
        </Animated.View>

        {/* Social proof */}
        {/* IMPORTANT: Do NOT show a star rating or review count until your app actually has ratings.
            Apple cross-checks paywall claims against your real App Store rating.
            Use a real testimonial from a beta tester instead, or leave this section out in v1.
            Once you have real App Store ratings, pull them via the App Store Connect API. */}
        <View style={styles.socialProof}>
          <Text style={styles.quote}>"Finally an app that actually tells me what my barber wants to hear."</Text>
          <Text style={styles.quoteAuthor}>— Beta user</Text>
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.ctaArea}>
          <Pressable
            style={[styles.ctaBtn, loading && styles.ctaBtnLoading]}
            onPress={handlePurchase}
            disabled={loading}
          >
            <Text style={styles.ctaBtnText}>
              {loading ? 'Processing...' : `Start Premium · ${getPlanPriceString(offerings, selectedPlan)}`}
            </Text>
          </Pressable>

          <Text style={styles.ctaSubtext}>Cancel anytime · Secure payment</Text>

          <Pressable onPress={() => Purchases.restorePurchases()}>
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text style={styles.continueFreely}>Continue with free plan</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.legalText}>
          Payment will be charged to your App Store / Google Play account. 
          Subscriptions auto-renew unless cancelled 24h before renewal.
        </Text>
      </ScrollView>
    </View>
  )
}

const PRODUCT_IDS = {
  monthly: 'groomai.monthly',
  annual: 'groomai.annual',
  lifetime: 'groomai.lifetime',
} as const

function getPackageForPlan(offerings: any, plan: keyof typeof PRODUCT_IDS): PurchasesPackage | null {
  const packages: PurchasesPackage[] = offerings?.availablePackages ?? []
  if (!packages.length) return null

  // Do NOT depend on `package.identifier` being 'monthly'/'annual'/'lifetime'.
  // Select by your App Store / Play Store product identifier instead.
  const match = packages.find((p) => p?.product?.identifier === PRODUCT_IDS[plan])
  return match ?? null
}

function getPlanPriceString(offerings: any, plan: keyof typeof PRODUCT_IDS): string {
  const pkg = getPackageForPlan(offerings, plan)
  return pkg?.product?.priceString ?? '—'
}

function getPlanSecondaryLabel(offerings: any, plan: keyof typeof PRODUCT_IDS): string {
  if (plan !== 'annual') return ''

  const annual = getPackageForPlan(offerings, 'annual')
  const monthly = getPackageForPlan(offerings, 'monthly')
  const annualPrice = annual?.product?.price
  const monthlyPrice = monthly?.product?.price
  if (typeof annualPrice !== 'number' || typeof monthlyPrice !== 'number' || monthlyPrice <= 0) return ''

  const effectiveMonthly = (annualPrice / 12).toFixed(2)
  const currency = annual?.product?.currencyCode
  return currency ? `≈ ${effectiveMonthly} ${currency}/month` : `≈ ${effectiveMonthly}/month`
}

function getAnnualSavingsLabel(offerings: any): string {
  const annual = getPackageForPlan(offerings, 'annual')
  const monthly = getPackageForPlan(offerings, 'monthly')
  const annualPrice = annual?.product?.price
  const monthlyPrice = monthly?.product?.price

  // Fallback to a generic badge if we don't have comparable numeric prices.
  if (typeof annualPrice !== 'number' || typeof monthlyPrice !== 'number' || monthlyPrice <= 0) {
    return 'BEST VALUE'
  }

  const monthlyTotal = monthlyPrice * 12
  if (monthlyTotal <= 0) return 'BEST VALUE'

  const savingsPct = Math.round((1 - annualPrice / monthlyTotal) * 100)
  return savingsPct > 0 ? `BEST VALUE · SAVE ${savingsPct}%` : 'BEST VALUE'
}
```

---

## Trial Warning Screen

Shown 2 days before trial expires:

```
"Your free trial ends in 2 days"

You'll lose access to:
  ✗ AR Hairstyle Try-On
  ✗ Skin Analysis
  ✗ Product Scanner
  ✗ Hair Loss Tracker
  ✗ Full Barber Library

[Keep My Premium →]  ← gold button
[Maybe Later]        ← small, grey
```

Show this as a modal on app open if `trial_ends_at` is within 48 hours.

---

## Trial End Detection

```typescript
// hooks/useSubscription.ts
export function useSubscription() {
  const { profile } = useUserStore()
  const { isPremium, checkStatus } = useSubscriptionStore()

  const isTrialing = profile?.subscription_status === 'trial'
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
    : 0
  const isTrialExpired = isTrialing && trialDaysLeft === 0

  const hasAccess = isPremium || (isTrialing && !isTrialExpired)

  function requirePremium(callback: () => void) {
    if (hasAccess) {
      callback()
    } else {
      router.push('/paywall')
    }
  }

  return { isPremium, isTrialing, trialDaysLeft, isTrialExpired, hasAccess, requirePremium }
}
```

---

## Webhook: Sync RevenueCat with Supabase

When a user subscribes, RevenueCat sends a webhook. Handle it in an Edge Function. **Two production requirements are mandatory: signature verification and idempotency.**

First, add a `webhook_events` table to your migrations (`004_features.sql`) to enable idempotency:

```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,                 -- 'revenuecat'
  event_id TEXT,                          -- Provider event id (if available)
  event_type TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('received', 'processed', 'ignored', 'error')) DEFAULT 'received',
  error_message TEXT,
  UNIQUE(provider, event_id)
);
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- Server-only table: do NOT add client CRUD policies.
```

```typescript
// supabase/functions/revenuecat-webhook/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // 1. Signature verification
  // RevenueCat sends the shared secret in the Authorization header as a Bearer token.
  // Set REVENUECAT_WEBHOOK_SECRET in Supabase Secrets Dashboard.
  const authHeader = req.headers.get('Authorization')
  const expectedSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.json()
  const event = body.event  // RevenueCat wraps the event in a .event property

  if (!event?.id || !event?.app_user_id) {
    return new Response('Invalid payload', { status: 400 })
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 2. Idempotency — RevenueCat retries failed webhooks; skip already-processed events
  const { error: insertError } = await admin
    .from('webhook_events')
    .insert({
      provider: 'revenuecat',
      event_id: event.id,
      event_type: event.type,
      payload: body,
      status: 'received',
    })

  if (insertError?.code === '23505') {
    // Duplicate key — already processed, acknowledge and return
    return new Response('Already processed', { status: 200 })
  }

  // 3. Handle event types
  if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
    await admin
      .from('profiles')
      .update({
        subscription_status: 'premium',
        revenuecat_customer_id: event.app_user_id,
        subscription_expires_at: event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null
      })
      .eq('id', event.app_user_id)
  }

  if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
    await admin
      .from('profiles')
      .update({ subscription_status: 'free', subscription_expires_at: null, revenuecat_customer_id: event.app_user_id })
      .eq('id', event.app_user_id)
  }

  if (event.type === 'NON_RENEWING_PURCHASE') {
    // Lifetime purchase
    await admin
      .from('profiles')
      .update({ subscription_status: 'lifetime', subscription_expires_at: null, revenuecat_customer_id: event.app_user_id })
      .eq('id', event.app_user_id)
  }

  return new Response('OK', { status: 200 })
})
```
