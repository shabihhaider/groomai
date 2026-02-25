import { useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { LEVEL_TITLES, LEVEL_THRESHOLDS, RARITY_COLORS, BADGES } from '@/constants/badges'
import { useUserStore } from '@/stores/user.store'
import { useStreak, useUserBadges, useAllBadges } from '@/hooks/useHabits'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'

function getLevel(xp: number): number {
    for (let level = 10; level >= 1; level--) {
        if (xp >= LEVEL_THRESHOLDS[level]) return level
    }
    return 1
}

function getNextLevelXP(xp: number): { current: number; threshold: number; progress: number } {
    const level = getLevel(xp)
    if (level >= 10) return { current: xp, threshold: LEVEL_THRESHOLDS[10], progress: 1 }
    const currentThreshold = LEVEL_THRESHOLDS[level]
    const nextThreshold = LEVEL_THRESHOLDS[level + 1]
    const progress = (xp - currentThreshold) / (nextThreshold - currentThreshold)
    return { current: xp, threshold: nextThreshold, progress: Math.min(progress, 1) }
}

// Badge emoji mapping by slug prefix
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

export default function TrackerScreen() {
    const profile = useUserStore((s) => s.profile)
    const { data: streak } = useStreak()
    const { data: userBadges } = useUserBadges()
    const { data: allBadges } = useAllBadges()

    const totalXP = profile?.total_xp ?? 0
    const level = getLevel(totalXP)
    const levelTitle = LEVEL_TITLES[level] ?? 'Rookie'
    const { progress: xpProgress, threshold: nextThreshold } = getNextLevelXP(totalXP)

    const currentStreak = streak?.current_streak ?? profile?.current_streak ?? 0
    const longestStreak = streak?.longest_streak ?? profile?.longest_streak ?? 0

    // Bounce animation for streak count
    const streakScale = useSharedValue(0.6)
    const streakAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: streakScale.value }] }))
    useEffect(() => {
        streakScale.value = withSpring(1, { damping: 6, stiffness: 180, mass: 0.8 })
    }, [currentStreak])

    // Build a set of earned badge slugs
    const earnedSlugs = useMemo(() => {
        if (!userBadges) return new Set<string>()
        return new Set(userBadges.map((ub: any) => ub.badges?.slug).filter(Boolean))
    }, [userBadges])

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AnimatedScreen>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.title}>Progress</Text>
                    </Animated.View>

                    {/* XP Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.xpCard}>
                        <View style={styles.levelRow}>
                            <Text style={styles.levelLabel}>Level {level}</Text>
                            <Text style={styles.levelTitle}>{levelTitle}</Text>
                        </View>
                        <View style={styles.xpRow}>
                            <Text style={styles.xpText}>{totalXP.toLocaleString()} XP</Text>
                            {level < 10 && (
                                <Text style={styles.xpNext}>
                                    {nextThreshold.toLocaleString()} XP to Level {level + 1}
                                </Text>
                            )}
                        </View>
                        <ProgressBar
                            progress={xpProgress}
                            height={8}
                            color={Colors.gold.primary}
                            animated
                        />
                    </Animated.View>

                    {/* Streak Card */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.streakCard}>
                        <View style={styles.streakMain}>
                            <Text style={styles.flameEmoji}>🔥</Text>
                            <View>
                                <Animated.Text style={[styles.streakCount, streakAnimStyle]}>
                                    {currentStreak}
                                </Animated.Text>
                                <Text style={styles.streakLabel}>Day Streak</Text>
                            </View>
                        </View>
                        <View style={styles.streakDivider} />
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>{longestStreak}</Text>
                            <Text style={styles.streakStatLabel}>Best</Text>
                        </View>
                        <View style={styles.streakStat}>
                            <Text style={styles.streakStatValue}>
                                {streak?.total_days_completed ?? 0}
                            </Text>
                            <Text style={styles.streakStatLabel}>Total Days</Text>
                        </View>
                    </Animated.View>

                    {/* Badges Section */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <Text style={styles.sectionTitle}>Badges</Text>
                        <Text style={styles.sectionSubtitle}>
                            {earnedSlugs.size} of {allBadges?.length ?? BADGES.length} earned
                        </Text>
                    </Animated.View>

                    <View style={styles.badgeGrid}>
                        {(allBadges ?? BADGES).map((badge: any, index: number) => {
                            const slug = badge.slug
                            const isEarned = earnedSlugs.has(slug)
                            const rarityColor = RARITY_COLORS[badge.rarity] ?? RARITY_COLORS.common
                            const emoji = BADGE_EMOJIS[slug] ?? '🏅'

                            return (
                                <Animated.View
                                    key={slug}
                                    entering={FadeInUp.delay(100 + index * 40).duration(300)}
                                    style={[
                                        styles.badgeItem,
                                        isEarned && {
                                            borderColor: rarityColor + '70',
                                            shadowColor: rarityColor,
                                            shadowOffset: { width: 0, height: 0 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 8,
                                            elevation: 6,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.badgeEmoji,
                                            !isEarned && styles.badgeLocked,
                                        ]}
                                    >
                                        {isEarned ? emoji : '🔒'}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.badgeName,
                                            !isEarned && styles.badgeNameLocked,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {badge.name}
                                    </Text>
                                    {isEarned && (
                                        <View style={[styles.rarityPill, { backgroundColor: rarityColor + '25', borderColor: rarityColor + '60' }]}>
                                            <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
                                        </View>
                                    )}
                                </Animated.View>
                            )
                        })}
                    </View>
                </ScrollView>
            </AnimatedScreen>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
    },
    scroll: {
        padding: Spacing.lg,
        paddingBottom: 120,
    },
    title: {
        ...Typography.h1,
        color: Colors.text.primary,
        marginBottom: Spacing.lg,
    },

    // XP Card
    xpCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: 4,
    },
    levelLabel: {
        ...Typography.label,
        color: Colors.gold.primary,
    },
    levelTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
    },
    xpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: Spacing.sm,
    },
    xpText: {
        ...Typography.body,
        color: Colors.text.primary,
        fontWeight: '600',
    },
    xpNext: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    xpTrack: {
        height: 8,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 4,
        overflow: 'hidden',
    },
    xpFill: {
        height: '100%',
        backgroundColor: Colors.gold.primary,
        borderRadius: 4,
    },

    // Streak Card
    streakCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    streakMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        flex: 1,
    },
    flameEmoji: {
        fontSize: 32,
    },
    streakCount: {
        ...Typography.h1,
        color: Colors.text.primary,
        lineHeight: 32,
    },
    streakLabel: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    streakDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.bg.tertiary,
        marginHorizontal: Spacing.md,
    },
    streakStat: {
        alignItems: 'center',
        marginHorizontal: Spacing.sm,
    },
    streakStatValue: {
        ...Typography.h3,
        color: Colors.text.primary,
    },
    streakStatLabel: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },

    // Badges
    sectionTitle: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginBottom: Spacing.md,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    badgeItem: {
        width: '30%',
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        minHeight: 90,
        justifyContent: 'center',
    },
    badgeEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    badgeLocked: {
        opacity: 0.3,
    },
    badgeName: {
        ...Typography.caption,
        color: Colors.text.primary,
        textAlign: 'center',
        fontWeight: '600',
    },
    badgeNameLocked: {
        color: Colors.text.tertiary,
    },
    rarityPill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        marginTop: 4,
        padding: 2,
    },
    rarityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 4,
    },
})
