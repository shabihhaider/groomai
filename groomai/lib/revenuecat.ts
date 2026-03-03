import { Platform } from 'react-native'
import Constants from 'expo-constants'

const isExpoGo = Constants.appOwnership === 'expo'

// Dynamically load RevenueCat only in dev-client / standalone builds
let Purchases: any = null
let LOG_LEVEL: any = null
if (!isExpoGo) {
    try {
        const mod = require('react-native-purchases')
        Purchases = mod.default ?? mod
        LOG_LEVEL = mod.LOG_LEVEL
    } catch {
        // native module unavailable
    }
}

/**
 * Initialize RevenueCat with the authenticated user's ID.
 * Call this after successful Supabase auth.
 */
export async function initRevenueCat(userId: string) {
    if (!Purchases) return

    if (__DEV__ && LOG_LEVEL) {
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
    if (!Purchases) return null
    const offerings = await Purchases.getOfferings()
    return offerings.current
}

/** Execute a purchase for a specific package. */
export async function purchasePackage(pkg: any) {
    if (!Purchases) throw new Error('RevenueCat not available in Expo Go')
    const { customerInfo } = await Purchases.purchasePackage(pkg)
    return customerInfo
}

/** Restore previously purchased subscriptions. */
export async function restorePurchases() {
    if (!Purchases) throw new Error('RevenueCat not available in Expo Go')
    const customerInfo = await Purchases.restorePurchases()
    return customerInfo
}

/** Check the current customer's subscription status. */
export async function checkSubscriptionStatus() {
    if (!Purchases) return { isActive: false, isLifetime: false, customerInfo: null }
    const customerInfo = await Purchases.getCustomerInfo()
    const isActive = customerInfo.activeSubscriptions.length > 0
    const isLifetime = typeof customerInfo.entitlements.active['premium'] !== 'undefined'
    return { isActive, isLifetime, customerInfo }
}

/** Log out of RevenueCat (safe no-op if not available). */
export async function logOutPurchases() {
    if (!Purchases) return
    await Purchases.logOut()
}

/** Get customer info (safe no-op if not available). */
export async function getCustomerInfo() {
    if (!Purchases) return null
    return await Purchases.getCustomerInfo()
}
