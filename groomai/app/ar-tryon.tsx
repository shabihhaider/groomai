// app/ar-tryon.tsx
// AR Try-On — Coming Soon placeholder screen
// Prevents crash when user taps "Try it On" in hairstyle detail

import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated'
import { useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'

export default function ARTryOnScreen() {
    const pulseScale = useSharedValue(1)
    const glowOpacity = useSharedValue(0.3)

    useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        )
        glowOpacity.value = withRepeat(
            withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        )
    }, [])

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }))

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }))

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AnimatedScreen>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            router.back()
                        }}
                    >
                        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>AR Try-On</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Animated icon */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.iconContainer}>
                        <Animated.View style={[styles.glowRing, glowStyle]} />
                        <Animated.View style={pulseStyle}>
                            <LinearGradient
                                colors={[Colors.gold.primary, Colors.gold.muted]}
                                style={styles.iconCircle}
                            >
                                <Ionicons name="camera" size={48} color={Colors.bg.primary} />
                            </LinearGradient>
                        </Animated.View>
                    </Animated.View>

                    {/* Title */}
                    <Animated.View entering={FadeInDown.delay(350).duration(500)}>
                        <Text style={styles.title}>AR Try-On</Text>
                        <Text style={styles.subtitle}>Coming Soon</Text>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.descCard}>
                        <Text style={styles.descText}>
                            We're building an augmented reality experience that lets you preview hairstyles on your own face in real-time before visiting the barber.
                        </Text>
                    </Animated.View>

                    {/* Features preview */}
                    <Animated.View entering={FadeInDown.delay(650).duration(500)} style={styles.featuresCard}>
                        {[
                            { icon: 'scan-outline', text: 'Real-time face detection' },
                            { icon: 'color-palette-outline', text: 'Try different styles instantly' },
                            { icon: 'share-social-outline', text: 'Save & share your look' },
                        ].map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name={feature.icon as any} size={18} color={Colors.gold.primary} />
                                </View>
                                <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                        ))}
                    </Animated.View>

                    {/* CTA */}
                    <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.ctaContainer}>
                        <Pressable
                            style={styles.ctaBtn}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                                router.back()
                            }}
                        >
                            <LinearGradient
                                colors={[Colors.gold.primary, Colors.gold.muted]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.ctaGradient}
                            >
                                <Ionicons name="arrow-back" size={18} color={Colors.bg.primary} />
                                <Text style={styles.ctaText}>Back to Styles</Text>
                            </LinearGradient>
                        </Pressable>
                        <Text style={styles.ctaNote}>You'll be notified when AR is ready</Text>
                    </Animated.View>
                </View>
            </AnimatedScreen>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.bg.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingBottom: 60,
    },
    iconContainer: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: Colors.gold.primary,
    },
    iconCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...Typography.display,
        color: Colors.text.primary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.gold.primary,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: Spacing.lg,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    descCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.overlay.gold,
        marginBottom: Spacing.lg,
    },
    descText: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    featuresCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        marginBottom: Spacing.xl,
        width: '100%',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: 8,
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.overlay.gold,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        ...Typography.body,
        color: Colors.text.primary,
        flex: 1,
    },
    ctaContainer: {
        alignItems: 'center',
        width: '100%',
    },
    ctaBtn: {
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        width: '100%',
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 14,
        paddingHorizontal: Spacing.lg,
    },
    ctaText: {
        ...Typography.bodyMedium,
        color: Colors.bg.primary,
        fontWeight: '700',
    },
    ctaNote: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        marginTop: Spacing.sm,
    },
})
