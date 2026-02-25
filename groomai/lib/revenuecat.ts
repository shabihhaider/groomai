import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases'
import { Platform } from 'react-native'

/**
 * Initialize RevenueCat with the authenticated user's ID.
 * Call this after successful Supabase auth.
 */
export async function initRevenueCat(userId: string) {
    if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE)
    }

    const apiKey = Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    })

    if (!apiKey) {
        console.warn('[RevenueCat] No API key found for platform:', Platform.OS)
        return
    }

    Purchases.configure({ apiKey, appUserID: userId })
}

/** Fetch the current offering from RevenueCat. */
export async function getOfferings() {
    const offerings = await Purchases.getOfferings()
    return offerings.current
}

/** Execute a purchase for a specific package. */
export async function purchasePackage(pkg: PurchasesPackage) {
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return customerInfo
}

/** Restore previously purchased subscriptions. */
export async function restorePurchases() {
    const customerInfo = await Purchases.restorePurchases()
    return customerInfo
}

/** Check the current customer's subscription status. */
export async function checkSubscriptionStatus() {
    const customerInfo = await Purchases.getCustomerInfo()
    const isActive = customerInfo.activeSubscriptions.length > 0
    const isLifetime = typeof customerInfo.entitlements.active['premium'] !== 'undefined'
    return { isActive, isLifetime, customerInfo }
}
