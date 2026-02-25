import { useState, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { OnboardingProgress } from '@/components/onboarding/ProgressBar'
import { useUserStore } from '@/stores/user.store'
import { FACE_SHAPE_LABELS } from '@/utils/faceShape'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'

const INSIGHTS = [
    { key: 'face', getLabel: (o: any) => `Face shape detected: ${FACE_SHAPE_LABELS[o.faceShape] || o.faceShape || 'Oval'}` },
    { key: 'skin', getLabel: (o: any) => `Skin type: ${o.skinType ? o.skinType.charAt(0).toUpperCase() + o.skinType.slice(1) : 'Normal'}` },
    { key: 'routine', getLabel: () => 'Personalized morning routine: 3 steps' },
    { key: 'haircuts', getLabel: () => 'Recommended haircuts: 8 styles' },
    { key: 'plan', getLabel: () => 'Your plan: Ready' },
]

export default function Step6Trial() {
    const onboarding = useUserStore((s) => s.onboarding)
    const completeOnboarding = useUserStore((s) => s.completeOnboarding)
    const [visibleInsights, setVisibleInsights] = useState(0)
    const [buildComplete, setBuildComplete] = useState(false)
    const [saving, setSaving] = useState(false)
    const trialBtnScale = useSharedValue(1)
    const trialBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: trialBtnScale.value }] }))
    const freeBtnScale = useSharedValue(1)
    const freeBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: freeBtnScale.value }] }))

    // Animate insights appearing one by one
    useEffect(() => {
        if (visibleInsights < INSIGHTS.length) {
            const timer = setTimeout(() => {
                setVisibleInsights((prev) => prev + 1)
            }, 600)
            return () => clearTimeout(timer)
        } else {
            const timer = setTimeout(() => setBuildComplete(true), 500)
            return () => clearTimeout(timer)
        }
    }, [visibleInsights])

    async function handleStartTrial() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setSaving(true)
        try {
            await completeOnboarding()
            router.replace('/(tabs)/home')
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save your profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    async function handleFreePlan() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSaving(true)
        try {
            await completeOnboarding()
            router.replace('/(tabs)/home')
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save your profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <View style={styles.container}>
            <OnboardingProgress step={6} total={6} />

            <View style={styles.content}>
                {/* Building phase */}
                {!buildComplete && (
                    <Animated.View entering={FadeIn.duration(400)} style={styles.buildingArea}>
                        <ActivityIndicator size="large" color={Colors.gold.primary} style={{ marginBottom: 20 }} />
                        <Text style={styles.buildingText}>Building your plan...</Text>

                        <View style={styles.insightsList}>
                            {INSIGHTS.slice(0, visibleInsights).map((insight, index) => (
                                <Animated.View
                                    key={insight.key}
                                    entering={FadeInDown.delay(index * 100).duration(400)}
                                    style={styles.insightRow}
                                >
                                    <Text style={styles.insightCheck}>✓</Text>
                                    <Text style={styles.insightLabel}>{insight.getLabel(onboarding)}</Text>
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Result & CTA */}
                {buildComplete && (
                    <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.resultArea}>
                        <Text style={styles.readyName}>
                            {onboarding.fullName || 'Hey'}, your grooming{'\n'}blueprint is ready.
                        </Text>

                        {/* Recap */}
                        <View style={styles.recapCard}>
                            {INSIGHTS.map((insight) => (
                                <View key={insight.key} style={styles.recapRow}>
                                    <Text style={styles.recapCheck}>✓</Text>
                                    <Text style={styles.recapLabel}>{insight.getLabel(onboarding)}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Trial CTA */}
                        <Animated.View style={trialBtnAnimated}>
                            <Pressable
                                style={[styles.trialBtn, saving && styles.btnDisabled]}
                                onPress={handleStartTrial}
                                onPressIn={() => { trialBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                                onPressOut={() => { trialBtnScale.value = withSpring(1, { damping: 15 }) }}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={Colors.text.inverse} />
                                ) : (
                                    <Text style={styles.trialBtnText}>Start your free 7-day premium trial</Text>
                                )}
                            </Pressable>
                        </Animated.View>

                        <Text style={styles.trialNote}>No credit card needed. Cancel anytime.</Text>

                        {/* Free option */}
                        <Animated.View style={freeBtnAnimated}>
                            <Pressable
                                onPress={handleFreePlan}
                                onPressIn={() => { freeBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                                onPressOut={() => { freeBtnScale.value = withSpring(1, { damping: 15 }) }}
                                disabled={saving}
                            >
                                <Text style={styles.freeLink}>Continue with free plan →</Text>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary, paddingTop: 60 },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },

    // Building phase
    buildingArea: { alignItems: 'center' },
    buildingText: { ...Typography.h2, color: Colors.text.primary, marginBottom: Spacing.xl },
    insightsList: { width: '100%', gap: 12 },
    insightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    insightCheck: { color: Colors.success, fontSize: 18, fontWeight: '700' },
    insightLabel: { ...Typography.body, color: Colors.text.secondary },

    // Result & CTA phase
    resultArea: { alignItems: 'center' },
    readyName: {
        ...Typography.h1,
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    recapCard: {
        width: '100%',
        backgroundColor: Colors.overlay.gold,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
        padding: Spacing.lg,
        gap: 10,
        marginBottom: Spacing.xl,
    },
    recapRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    recapCheck: { color: Colors.gold.primary, fontSize: 16, fontWeight: '700' },
    recapLabel: { ...Typography.body, color: Colors.text.primary },

    trialBtn: {
        width: '100%',
        height: 60,
        backgroundColor: Colors.gold.primary,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.gold.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        paddingHorizontal: 20,
    },
    btnDisabled: { opacity: 0.6 },
    trialBtnText: { color: Colors.text.inverse, fontSize: 16, fontWeight: '700' },
    trialNote: {
        ...Typography.small,
        color: Colors.text.tertiary,
        marginTop: 10,
        marginBottom: Spacing.lg,
    },
    freeLink: {
        ...Typography.body,
        color: Colors.text.secondary,
        textDecorationLine: 'underline',
    },
})
