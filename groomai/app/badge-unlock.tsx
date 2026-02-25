// app/badge-unlock.tsx
// Full-screen celebration modal when a badge is earned

import { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import Animated, { FadeIn, FadeOut, ZoomIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { RARITY_COLORS } from '@/constants/badges'

const { width } = Dimensions.get('window')

// Badge emoji mapping
const BADGE_EMOJIS: Record<string, string> = {
    'first-checkin': '🌟',
    'week-warrior': '🔥',
    'fortnight': '⚡',
    'month-master': '🏆',
    'two-months': '💪',
    'century': '👑',
    'ten-checkins': '✅',
    'fifty-checkins': '🎯',
    'hundred-checkins': '💯',
    'five-hundred-checkins': '🏅',
    'level-five': '⭐',
    'level-ten': '🌟',
    'skin-guru': '🧴',
    'scanner-pro': '🔍',
    'style-explorer': '💇',
    'ar-enthusiast': '📱',
    'hair-tracker': '📸',
    'early-adopter': '🚀',
    'premium-member': '💎',
    'share-master': '🔗',
}

export default function BadgeUnlockScreen() {
    const { name, description, xpReward, rarity, slug } = useLocalSearchParams<{
        name: string
        description: string
        xpReward: string
        rarity: string
        slug: string
    }>()

    const rarityColor = RARITY_COLORS[rarity ?? 'common'] ?? RARITY_COLORS.common
    const emoji = BADGE_EMOJIS[slug ?? ''] ?? '🏅'
    const ctaScale = useSharedValue(1)
    const ctaAnimated = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }))

    useEffect(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, [])

    return (
        <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
            {/* Confetti particles (simplified — no Lottie dependency) */}
            <View style={styles.confettiContainer}>
                {Array.from({ length: 24 }).map((_, i) => (
                    <Animated.View
                        key={i}
                        entering={FadeIn.delay(i * 50).duration(300)}
                        style={[
                            styles.confettiDot,
                            {
                                left: `${(i * 17 + 5) % 95}%`,
                                top: `${(i * 13 + 10) % 60}%`,
                                backgroundColor: [
                                    Colors.gold.primary, Colors.success, Colors.info,
                                    Colors.warning, '#FF6B6B', '#9C27B0',
                                ][i % 6],
                                width: 6 + (i % 3) * 4,
                                height: 6 + (i % 3) * 4,
                                borderRadius: i % 2 === 0 ? 20 : 3,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Card */}
            <Animated.View
                entering={ZoomIn.springify().damping(10).stiffness(150).delay(200)}
                style={styles.card}
            >
                <Text style={styles.label}>BADGE UNLOCKED</Text>

                {/* Badge Glow Ring */}
                <View style={[styles.glowRing, { borderColor: rarityColor + '60', shadowColor: rarityColor }]}>
                    <View style={[styles.badgeCircle, { borderColor: rarityColor }]}>
                        <Text style={styles.badgeEmoji}>{emoji}</Text>
                    </View>
                </View>

                <Text style={styles.badgeName}>{name}</Text>
                <Text style={styles.badgeDescription}>{description}</Text>

                {/* XP Reward */}
                <View style={styles.xpContainer}>
                    <Text style={styles.xpText}>+{xpReward} XP ⚡</Text>
                </View>

                {/* Rarity Pill */}
                <View style={[styles.rarityPill, { backgroundColor: rarityColor + '25', borderColor: rarityColor + '60' }]}>
                    <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
                    <Text style={[styles.rarityText, { color: rarityColor }]}>
                        {(rarity ?? 'common').toUpperCase()}
                    </Text>
                </View>

                {/* Dismiss Button */}
                <Animated.View style={[ctaAnimated, { width: '100%' }]}>
                <Pressable
                    style={styles.cta}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back() }}
                    onPressIn={() => { ctaScale.value = withSpring(0.96, { damping: 15 }) }}
                    onPressOut={() => { ctaScale.value = withSpring(1, { damping: 15 }) }}
                >
                    <Text style={styles.ctaText}>Awesome!</Text>
                </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    confettiDot: {
        position: 'absolute',
        opacity: 0.6,
    },
    card: {
        width: width - 64,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    label: {
        ...Typography.label,
        color: Colors.gold.primary,
        letterSpacing: 2,
        marginBottom: Spacing.lg,
    },
    glowRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    badgeCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.bg.tertiary,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeEmoji: {
        fontSize: 44,
    },
    badgeName: {
        ...Typography.h2,
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: 4,
    },
    badgeDescription: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    xpContainer: {
        backgroundColor: Colors.gold.primary + '20',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.md,
    },
    xpText: {
        ...Typography.bodyMedium,
        color: Colors.gold.light,
    },
    rarityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        marginBottom: Spacing.lg,
    },
    rarityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    rarityText: {
        ...Typography.caption,
        fontWeight: '700',
        letterSpacing: 1,
    },
    cta: {
        width: '100%',
        backgroundColor: Colors.gold.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 14,
        alignItems: 'center',
    },
    ctaText: {
        ...Typography.bodyMedium,
        color: Colors.text.inverse,
        fontWeight: '700',
    },
})
