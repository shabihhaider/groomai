import { useUserStore } from '@/stores/user.store'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { router } from 'expo-router'

/**
 * Combines Supabase profile trial state with RevenueCat entitlement state.
 * Use `requirePremium(callback)` to gate any premium feature.
 */
export function useSubscription() {
    const profile = useUserStore((s) => s.profile)
    const isPremium = useSubscriptionStore((s) => s.isPremium)

    const isTrialing = profile?.subscription_status === 'trial'
    const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
    const trialDaysLeft = trialEndsAt
        ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
        : 0
    const isTrialExpired = isTrialing && trialDaysLeft === 0

    // User has access if RevenueCat says premium OR if trial is still active
    const hasAccess = isPremium || (isTrialing && !isTrialExpired)

    function requirePremium(callback: () => void) {
        if (hasAccess) {
            callback()
        } else {
            router.push('/paywall')
        }
    }

    return {
        isPremium,
        isTrialing,
        trialDaysLeft,
        isTrialExpired,
        hasAccess,
        requirePremium,
    }
}
