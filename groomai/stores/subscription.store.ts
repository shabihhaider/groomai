import { create } from 'zustand'
import Purchases, { CustomerInfo } from 'react-native-purchases'

interface SubscriptionState {
    isPremium: boolean
    isTrialing: boolean
    trialEndsAt: Date | null
    customerInfo: CustomerInfo | null

    setCustomerInfo: (info: CustomerInfo) => void
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
            const info = await Purchases.getCustomerInfo()
            const hasEntitlement = !!info.entitlements.active['premium']
            set({ isPremium: hasEntitlement, customerInfo: info })
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
