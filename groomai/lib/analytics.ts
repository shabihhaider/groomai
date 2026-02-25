// lib/analytics.ts
// Phase 9 — PostHog + Sentry unified analytics wrapper
// PostHog: product analytics / funnel tracking
// Sentry: error monitoring
// All calls are no-ops when keys are missing (dev safety)

import * as Sentry from '@sentry/react-native'

// ── PostHog ────────────────────────────────────────────────────────────────
// We call the PostHog REST capture API directly to avoid requiring
// the posthog-react-native native package (saves a native module install)
// If you install posthog-react-native later, swap in the SDK here.

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? ''
const POSTHOG_URL = 'https://app.posthog.com'

let _distinctId = 'anonymous'

function captureEvent(event: string, properties: Record<string, unknown> = {}) {
    if (!POSTHOG_KEY) return
    fetch(`${POSTHOG_URL}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: POSTHOG_KEY,
            event,
            distinct_id: _distinctId,
            properties: {
                ...properties,
                $lib: 'groomai-rn',
            },
        }),
    }).catch(() => { }) // fire-and-forget, never throw
}

// ── Sentry ─────────────────────────────────────────────────────────────────

export function initSentry() {
    const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN
    if (!dsn) return
    Sentry.init({
        dsn,
        tracesSampleRate: 0.2,
        enableAutoSessionTracking: true,
    })
}

export function setSentryUser(userId: string | null) {
    if (userId) {
        Sentry.setUser({ id: userId })
        _distinctId = userId
    } else {
        Sentry.setUser(null)
        _distinctId = 'anonymous'
    }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
    if (context) Sentry.withScope((scope) => {
        scope.setExtras(context as any)
        Sentry.captureException(error)
    })
    else Sentry.captureException(error)
}

// ── Analytics Events API ───────────────────────────────────────────────────

export const analytics = {
    identify(userId: string) {
        _distinctId = userId
        setSentryUser(userId)
    },

    signOut() {
        setSentryUser(null)
    },

    // Auth
    signUp(method: 'email' | 'google' | 'apple') {
        captureEvent('sign_up', { method })
    },

    onboardingCompleted(props: { face_shape?: string; skin_type?: string; hair_type?: string }) {
        captureEvent('onboarding_completed', props)
    },

    // Monetization
    trialStarted() { captureEvent('trial_started') },

    paywallViewed(trigger: 'feature_gate' | 'trial_expired' | 'manual') {
        captureEvent('paywall_viewed', { trigger })
    },

    purchaseCompleted(productId: string, price: number, platform: 'ios' | 'android') {
        captureEvent('purchase_completed', { product_id: productId, price, platform })
    },

    // Core loop
    routineStepCompleted(stepId: string, routineType: string) {
        captureEvent('routine_step_completed', { step_id: stepId, routine_type: routineType })
    },

    routineCompleted(routineType: string, stepsCount: number) {
        captureEvent('routine_completed', { routine_type: routineType, steps_count: stepsCount })
    },

    streakMilestone(days: number) {
        captureEvent('streak_milestone', { days })
    },

    badgeEarned(badgeSlug: string, rarity: string) {
        captureEvent('badge_earned', { badge_slug: badgeSlug, rarity })
    },

    // AI features
    skinAnalysisCompleted(skinType: string, score: number) {
        captureEvent('skin_analysis_completed', { skin_type: skinType, overall_score: score })
    },

    productScanned(verdict: string, barcode?: string) {
        captureEvent('product_scanned', { verdict, barcode })
    },

    arTryonUsed(hairstyleId: string) {
        captureEvent('ar_tryon_used', { hairstyle_id: hairstyleId })
    },

    barberCardShared(hairstyleId: string) {
        captureEvent('barber_card_shared', { hairstyle_id: hairstyleId })
    },

    // Affiliate
    affiliateLinkClicked(productId: string, productName: string, source: string, skinType?: string) {
        captureEvent('affiliate_link_clicked', { product_id: productId, product_name: productName, source, skin_type: skinType })
    },

    // Hair loss tracker
    hairLossSessionCompleted(month: string) {
        captureEvent('hair_loss_session_completed', { month })
    },
}
