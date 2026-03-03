import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { getOfferings as rcGetOfferings, purchasePackage as rcPurchasePackage, restorePurchases as rcRestorePurchases } from '@/lib/revenuecat'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { differenceInDays } from 'date-fns'

// ── Premium features list ──
const FEATURES = [
    { icon: '🔬', text: 'AI Skin Analysis from Selfie' },
    { icon: '📦', text: 'Product Ingredient Scanner' },
    { icon: '📸', text: 'Monthly Hair Loss Tracker' },
    { icon: '✂️', text: 'Full Barber Translator (50+ Cuts)' },
    { icon: '🤖', text: 'AI-Personalized Routines' },
    { icon: '📷', text: 'Celebrity Hairstyle Breakdown' },
    { icon: '🏆', text: 'Full Badge & Achievement System' },
    { icon: '🚫', text: 'Ad-Free Experience' },
]

// ── Product IDs — must match App Store Connect / Play Console ──
const PRODUCT_IDS = {
    monthly: 'groomai.monthly',
    annual: 'groomai.annual',
    lifetime: 'groomai.lifetime',
} as const

type PlanKey = keyof typeof PRODUCT_IDS

export default function PaywallScreen() {
    const [offerings, setOfferings] = useState<any>(null)
    const [selectedPlan, setSelectedPlan] = useState<PlanKey>('annual')
    const [loading, setLoading] = useState(false)
    const checkStatus = useSubscriptionStore((s) => s.checkStatus)
    const ctaBtnScale = useSharedValue(1)
    const ctaBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: ctaBtnScale.value }] }))

    // Trial urgency
    const isTrialing = useSubscriptionStore((s) => s.isTrialing)
    const trialEndsAt = useSubscriptionStore((s) => s.trialEndsAt)
    const trialDaysLeft = trialEndsAt ? Math.max(0, differenceInDays(trialEndsAt, new Date())) : null

    useEffect(() => {
        rcGetOfferings()
            .then((current) => setOfferings(current))
            .catch(() => {
                // RevenueCat not configured — will show fallback "—" prices
            })
    }, [])

    async function handlePurchase() {
        if (!offerings) return
        setLoading(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        try {
            const pkg = getPackageForPlan(offerings, selectedPlan)
            if (!pkg) throw new Error('No purchasable package found')

            await rcPurchasePackage(pkg)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            await checkStatus()
            router.back()
        } catch (e: any) {
            if (!e.userCancelled) {
                Alert.alert('Purchase Error', e.message ?? 'Something went wrong. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleRestore() {
        setLoading(true)
        try {
            await rcRestorePurchases()
            await checkStatus()
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            Alert.alert('Restored!', 'Your purchases have been restored.', [
                { text: 'OK', onPress: () => router.back() },
            ])
        } catch (e: any) {
            Alert.alert('Restore Failed', e.message ?? 'No previous purchase found.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.bg.primary, '#1a1200', Colors.bg.primary]}
                style={StyleSheet.absoluteFill}
            />

            {/* Close button */}
            <Pressable style={styles.closeBtn} onPress={() => router.back()}>
                <Ionicons name="close" size={24} color={Colors.text.tertiary} />
            </Pressable>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Hero ── */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.hero}>
                    <View style={styles.crownCircle}>
                        <Text style={styles.crownEmoji}>👑</Text>
                    </View>
                    <Text style={styles.heroTitle}>Unlock Your{'\n'}Full Blueprint</Text>
                    <Text style={styles.heroSubtext}>Trusted by thousands of men worldwide</Text>
                </Animated.View>

                {/* ── Features ── */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.features}>
                    {FEATURES.map((f, i) => (
                        <View key={i} style={styles.featureRow}>
                            <Text style={styles.featureIcon}>{f.icon}</Text>
                            <Text style={styles.featureText}>{f.text}</Text>
                            <Ionicons name="checkmark-circle" size={18} color={Colors.gold.primary} />
                        </View>
                    ))}
                </Animated.View>

                {/* ── Plan Selector ── */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.plans}>
                    {/* Annual */}
                    <Pressable
                        style={[styles.plan, selectedPlan === 'annual' && styles.planSelected]}
                        onPress={() => { setSelectedPlan('annual'); Haptics.selectionAsync() }}
                    >
                        <View style={styles.bestValueBadge}>
                            <Text style={styles.bestValueText}>{getAnnualSavingsLabel(offerings)}</Text>
                        </View>
                        <Text style={styles.planName}>Annual</Text>
                        <Text style={styles.planPrice}>{getPlanPriceString(offerings, 'annual')}</Text>
                        <Text style={styles.planSecondary}>{getPlanSecondaryLabel(offerings, 'annual')}</Text>
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
                        <Text style={styles.planSecondary}>One-time payment</Text>
                    </Pressable>
                </Animated.View>

                {/* ── Social Proof ── */}
                <View style={styles.socialProof}>
                    <Text style={styles.quote}>
                        "Finally an app that actually tells me what my barber wants to hear."
                    </Text>
                    <Text style={styles.quoteAuthor}>— James K., verified user</Text>
                </View>

                {/* ── CTA ── */}
                <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.ctaArea}>
                    <Animated.View style={ctaBtnAnimated}>
                        <Pressable
                            style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
                            onPress={handlePurchase}
                            onPressIn={() => { ctaBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                            onPressOut={() => { ctaBtnScale.value = withSpring(1, { damping: 15 }) }}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.text.inverse} />
                            ) : (
                                <Text style={styles.ctaBtnText}>
                                    Start Premium · {getPlanPriceString(offerings, selectedPlan)}
                                </Text>
                            )}
                        </Pressable>
                    </Animated.View>

                    <Text style={styles.ctaSubtext}>
                        {isTrialing && trialDaysLeft !== null
                            ? `Your trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} — don't lose access`
                            : 'Cancel anytime · Secure payment'}
                    </Text>

                    <Pressable onPress={handleRestore} style={styles.linkBtn}>
                        <Text style={styles.restoreText}>Restore Purchase</Text>
                    </Pressable>

                    <Pressable onPress={() => router.back()} style={styles.linkBtn}>
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

// ── Helper functions ──

function getPackageForPlan(offerings: any, plan: PlanKey): any | null {
    const packages: any[] = offerings?.availablePackages ?? []
    if (!packages.length) return null
    return packages.find((p) => p?.product?.identifier === PRODUCT_IDS[plan]) ?? null
}

function getPlanPriceString(offerings: any, plan: PlanKey): string {
    const pkg = getPackageForPlan(offerings, plan)
    return pkg?.product?.priceString ?? '—'
}

function getPlanSecondaryLabel(offerings: any, plan: PlanKey): string {
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
    if (typeof annualPrice !== 'number' || typeof monthlyPrice !== 'number' || monthlyPrice <= 0) {
        return 'BEST VALUE'
    }
    const monthlyTotal = monthlyPrice * 12
    if (monthlyTotal <= 0) return 'BEST VALUE'
    const savingsPct = Math.round((1 - annualPrice / monthlyTotal) * 100)
    return savingsPct > 0 ? `BEST VALUE · SAVE ${savingsPct}%` : 'BEST VALUE'
}

// ── Styles ──

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
    },
    closeBtn: {
        position: 'absolute',
        top: 56,
        right: 20,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.bg.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 80,
        paddingBottom: 48,
    },

    // Hero
    hero: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    crownCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.overlay.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    crownEmoji: {
        fontSize: 40,
    },
    heroTitle: {
        ...Typography.display,
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    heroSubtext: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
    },

    // Features
    features: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        gap: 14,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureIcon: {
        fontSize: 20,
        width: 28,
        textAlign: 'center',
    },
    featureText: {
        ...Typography.body,
        color: Colors.text.primary,
        flex: 1,
    },

    // Plans
    plans: {
        gap: 12,
        marginBottom: Spacing.lg,
    },
    plan: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
    },
    planSelected: {
        borderColor: Colors.gold.primary,
        backgroundColor: Colors.overlay.gold,
    },
    bestValueBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: Colors.gold.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderBottomLeftRadius: BorderRadius.sm,
    },
    bestValueText: {
        color: Colors.text.inverse,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    planName: {
        ...Typography.h3,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    planPrice: {
        ...Typography.h2,
        color: Colors.gold.primary,
    },
    planSecondary: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginTop: 2,
    },

    // Social proof
    socialProof: {
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    quote: {
        ...Typography.body,
        color: Colors.text.secondary,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    quoteAuthor: {
        ...Typography.small,
        color: Colors.text.tertiary,
    },

    // CTA
    ctaArea: {
        alignItems: 'center',
        gap: 12,
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.xs,
    },
    ctaBtn: {
        alignSelf: 'stretch',
        height: 56,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gold.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaBtnDisabled: {
        opacity: 0.7,
    },
    ctaBtnText: {
        color: Colors.text.inverse,
        fontSize: 17,
        fontWeight: '700',
    },
    ctaSubtext: {
        ...Typography.caption,
        color: Colors.text.tertiary,
    },
    linkBtn: {
        paddingVertical: 8,
    },
    restoreText: {
        ...Typography.small,
        color: Colors.gold.muted,
        textDecorationLine: 'underline',
    },
    continueFreely: {
        ...Typography.small,
        color: Colors.text.tertiary,
    },

    // Legal
    legalText: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        textAlign: 'center',
        lineHeight: 16,
        opacity: 0.6,
    },
})
