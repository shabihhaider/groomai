import { supabase } from '@/lib/supabase'

export const subscriptionService = {
    async getSubscriptionStatus(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('subscription_status, trial_started_at, trial_ends_at, subscription_expires_at, revenuecat_customer_id')
            .eq('id', userId)
            .single()

        if (error) throw error
        return data
    },

    async checkTrialExpiry(userId: string): Promise<boolean> {
        const status = await subscriptionService.getSubscriptionStatus(userId)
        if (status.subscription_status !== 'trial') return false

        const trialEnd = status.trial_ends_at ? new Date(status.trial_ends_at) : null
        if (!trialEnd) return false

        if (new Date() > trialEnd) {
            await subscriptionService.updateSubscriptionStatus(userId, 'free')
            return true // trial expired
        }
        return false
    },

    async updateSubscriptionStatus(userId: string, status: 'free' | 'trial' | 'premium' | 'lifetime') {
        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_status: status,
                ...(status === 'free' ? { subscription_expires_at: null } : {}),
            })
            .eq('id', userId)

        if (error) throw error
    },

    async getTrialDaysRemaining(userId: string): Promise<number> {
        const status = await subscriptionService.getSubscriptionStatus(userId)
        if (status.subscription_status !== 'trial' || !status.trial_ends_at) return 0

        const now = new Date()
        const end = new Date(status.trial_ends_at)
        const diff = end.getTime() - now.getTime()
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    },
}
