import { create } from 'zustand'
import { getCustomerInfo } from '@/lib/revenuecat'

interface SubscriptionState {
    isPremium: boolean
    isTrialing: boolean
    trialEndsAt: Date | null
    customerInfo: any | null

    setCustomerInfo: (info: any) => void
    checkStatus: () => Promise<void>
    reset: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
    isPremium: false,
    isTrialing: false,
    trialEndsAt: null,
    customerInfo: null,

    setCustomerInfo: (info) => {
        const hasEntitlement = !!info.entitlements.active['premium']
        set({ isPremium: hasEntitlement, customerInfo: info })
    },

    checkStatus: async () => {
        try {
            const info = await getCustomerInfo()
            if (!info) return // RevenueCat not available (Expo Go)
            const ent = info.entitlements.active['premium']
            const hasEntitlement = !!ent

            // Extract trial state
            let isTrialing = false
            let trialEndsAt: Date | null = null
            if (ent) {
                isTrialing = ent.periodType === 'TRIAL'
                if (ent.expirationDate) {
                    trialEndsAt = new Date(ent.expirationDate)
                }
            }

            set({ isPremium: hasEntitlement, isTrialing, trialEndsAt, customerInfo: info })
        } catch {
            // RevenueCat not configured yet — silently continue
        }
    },

    reset: () =>
        set({
            isPremium: false,
            isTrialing: false,
            trialEndsAt: null,
            customerInfo: null,
        }),
}))
