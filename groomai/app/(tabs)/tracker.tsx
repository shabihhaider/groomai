// app/(tabs)/tracker.tsx
// Progress screen — Level, Streak, Weekly Activity Grid, Badges (2-col + rarity + progress + tap detail)

import { useMemo, useEffect, useCallback, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
    FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { BADGES, LEVEL_TITLES, LEVEL_THRESHOLDS, RARITY_COLORS, type BadgeDefinition } from '@/constants/badges'
import { useUserStore } from '@/stores/user.store'
import { useStreak, useUserBadges, useAllBadges, useWeeklyActivity } from '@/hooks/useHabits'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'

function getLevel(xp: number): number {
    const entries = Object.entries(LEVEL_THRESHOLDS).map(([k, v]) => [Number(k), v] as [number, number])
    for (let i = entries.length - 1; i >= 0; i--) {
        if (xp >= entries[i][1]) return entries[i][0]
    }
    return 1
}

function getNextLevelXP(xp: number): { current: number; threshold: number; progress: number } {
    const level = getLevel(xp)
    const current = LEVEL_THRESHOLDS[level]
    const next = level < 10 ? LEVEL_THRESHOLDS[level + 1] : LEVEL_THRESHOLDS[10]
    const progress = level >= 10 ? 1 : (xp - current) / (next - current)
    return { current, threshold: next, progress }
}

// Badge emoji mapping by slug prefix
const BADGE_EMOJIS: Record<string, string> = {
    'first-checkin': '🌟',
    'week-warrior': '🔥',
    'fortnight': '⚡',
    'month-master': '🏆',
    'two-months': '💪',
    'century': '👑',
    'ten-checkins': '📋',
    'fifty-checkins': '📝',
    'hundred-checkins': '🎯',
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

// Day-of-week labels
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Get badge progress text based on badge condition type
function getBadgeProgress(
    badge: BadgeDefinition,
    currentStreak: number,
    totalDays: number,
    level: number,
): { text: string; progress: number } | null {
    // If condition is missing (e.g. badge from DB), look it up from local BADGES constant
    const cond = badge.condition ?? BADGES.find(b => b.slug === badge.slug)?.condition

    if (!cond) return null

    const target = typeof cond.value === 'number' ? cond.value : 0

    switch (cond.type) {
        case 'streak':
            return { text: `${currentStreak}/${target} days`, progress: target > 0 ? currentStreak / target : 0 }
        case 'checkin_count':
            return { text: `${totalDays}/${target}`, progress: target > 0 ? totalDays / target : 0 }
        case 'level':
            return { text: `Lv.${level}/${target}`, progress: target > 0 ? level / target : 0 }
        case 'feature':
        case 'special':
            return { text: 'Use feature', progress: 0 }
        default:
            return null
    }
}

export default function TrackerScreen() {
    const profile = useUserStore((s) => s.profile)
    const { data: streak } = useStreak()
    const { data: userBadges } = useUserBadges()
    const { data: allBadges } = useAllBadges()
    const { data: weeklyActivity } = useWeeklyActivity()

    const totalXP = profile?.total_xp ?? 0
    const level = getLevel(totalXP)
    const levelTitle = LEVEL_TITLES[level] ?? 'Rookie'
    const { progress: xpProgress, threshold: nextThreshold } = getNextLevelXP(totalXP)

    const currentStreak = streak?.current_streak ?? profile?.current_streak ?? 0
    const longestStreak = streak?.longest_streak ?? profile?.longest_streak ?? 0
    const totalDays = streak?.total_days_completed ?? 0
    const freezesRemaining = streak?.streak_freezes_remaining ?? 1
    const freezeUsedAt = streak?.streak_freeze_used_at

    // XP multiplier based on streak length
    const xpMultiplier = currentStreak >= 30 ? 5 : currentStreak >= 14 ? 3 : currentStreak >= 7 ? 2 : 1

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

    // Modal for badge detail
    const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null)
    const [showBadgeModal, setShowBadgeModal] = useState(false)

    const [showFreezeInfo, setShowFreezeInfo] = useState(false)

    const handleBadgeTap = useCallback((badge: BadgeDefinition) => {
        setSelectedBadge(badge)
        setShowBadgeModal(true)
    }, [])

    // Build weekly activity grid (12 weeks × 7 days)
    const activityGrid = useMemo(() => {
        // Create a 12×7 grid (12 weeks, 7 days each)
        const grid: boolean[][] = []
        const activitySet = new Set(
            (weeklyActivity ?? []).map((d: any) => d.date ?? d.activity_date)
        )

        const today = new Date()
        for (let week = 11; week >= 0; week--) {
            const weekDays: boolean[] = []
            for (let day = 0; day < 7; day++) {
                const date = new Date(today)
                date.setDate(date.getDate() - (week * 7 + (6 - day)))
                const dateStr = date.toISOString().split('T')[0]
                weekDays.push(activitySet.has(dateStr))
            }
            grid.push(weekDays)
        }
        return grid
    }, [weeklyActivity])

    const badgesList = allBadges ?? BADGES

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
                                    {totalXP.toLocaleString()} / {nextThreshold.toLocaleString()} XP
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
                            <Text style={styles.streakStatValue}>{totalDays}</Text>
                            <Text style={styles.streakStatLabel}>Total Days</Text>
                        </View>
                    </Animated.View>

                    {/* Streak Gamification Row */}
                    <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.gamificationRow}>
                        {/* XP Multiplier */}
                        {xpMultiplier > 1 && (
                            <View style={styles.gamificationChip}>
                                <Text style={styles.gamificationEmoji}>⚡</Text>
                                <Text style={styles.gamificationText}>{xpMultiplier}x XP Bonus</Text>
                            </View>
                        )}
                        {/* Streak Freeze */}
                        <Pressable
                            style={[styles.gamificationChip, freezesRemaining === 0 && styles.gamificationChipDanger]}
                            onPress={() => setShowFreezeInfo(!showFreezeInfo)}
                        >
                            <Text style={styles.gamificationEmoji}>🛡️</Text>
                            <Text style={[styles.gamificationText, freezesRemaining === 0 && { color: Colors.text.tertiary }]}>
                                {freezesRemaining > 0 ? `${freezesRemaining} Freeze` : 'No Freezes'}
                            </Text>
                            <Ionicons name="information-circle-outline" size={14} color={Colors.text.tertiary} />
                        </Pressable>
                    </Animated.View>

                    {/* Freeze Explanation Tooltip */}
                    {showFreezeInfo && (
                        <Animated.View entering={FadeInDown.duration(200)} style={styles.freezeInfoCard}>
                            <Text style={styles.freezeInfoTitle}>🛡️ Streak Freeze</Text>
                            <Text style={styles.freezeInfoText}>
                                A freeze protects your streak if you miss a day. It activates automatically when you don't complete any routine.
                            </Text>
                            <Text style={styles.freezeInfoText}>
                                Earn more freezes by completing a 7-day streak (+1 freeze).
                            </Text>
                        </Animated.View>
                    )}

                    {/* ── Weekly Activity Grid ── */}
                    <Animated.View entering={FadeInDown.delay(250).duration(400)}>
                        <Text style={styles.sectionTitle}>Activity</Text>
                        <Text style={styles.sectionSubtitle}>Last 12 weeks</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.activityCard}>
                        {/* Day-of-week labels */}
                        <View style={styles.activityRow}>
                            <View style={styles.dowLabelCol}>
                                {DOW.map((d, i) => (
                                    <Text key={i} style={styles.dowLabel}>{d}</Text>
                                ))}
                            </View>
                            {/* Grid columns (12 weeks) */}
                            {activityGrid.map((week, wi) => (
                                <View key={wi} style={styles.activityCol}>
                                    {week.map((active, di) => (
                                        <View
                                            key={di}
                                            style={[
                                                styles.activityDot,
                                                { backgroundColor: active ? Colors.gold.primary : Colors.bg.tertiary },
                                            ]}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Badges Section */}
                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <Text style={styles.sectionTitle}>Badges</Text>
                        <Text style={styles.sectionSubtitle}>
                            {earnedSlugs.size} of {badgesList.length} earned
                        </Text>
                    </Animated.View>

                    {/* 2-Column Badge Grid */}
                    <View style={styles.badgeGrid}>
                        {badgesList.map((badge: any, index: number) => {
                            const slug = badge.slug
                            const isEarned = earnedSlugs.has(slug)
                            const rarityColor = RARITY_COLORS[badge.rarity] ?? RARITY_COLORS.common
                            const emoji = BADGE_EMOJIS[slug] ?? '🏅'
                            const progress = getBadgeProgress(badge, currentStreak, totalDays, level)

                            return (
                                <Animated.View
                                    key={slug}
                                    style={styles.badgeWrapper}
                                    entering={FadeInUp.delay(100 + index * 30).duration(300)}
                                >
                                    <Pressable
                                        style={[
                                            styles.badgeItem,
                                            {
                                                borderColor: isEarned
                                                    ? rarityColor + '70'
                                                    : rarityColor + '30',
                                            },
                                            isEarned && {
                                                shadowColor: rarityColor,
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.5,
                                                shadowRadius: 8,
                                                elevation: 6,
                                            },
                                        ]}
                                        onPress={() => handleBadgeTap(badge)}
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
                                            numberOfLines={2}
                                        >
                                            {badge.name}
                                        </Text>

                                        {/* Rarity indicator for earned */}
                                        {isEarned && (
                                            <View style={[styles.rarityPill, { backgroundColor: rarityColor + '25', borderColor: rarityColor + '60' }]}>
                                                <Text style={styles.rarityText}>{badge.rarity}</Text>
                                            </View>
                                        )}

                                        {/* Progress text for locked */}
                                        {!isEarned && progress && (
                                            <View style={styles.badgeProgressContainer}>
                                                <View style={styles.badgeProgressTrack}>
                                                    <View
                                                        style={[
                                                            styles.badgeProgressFill,
                                                            {
                                                                width: `${Math.min(progress.progress, 1) * 100}%`,
                                                                backgroundColor: rarityColor,
                                                            },
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={[styles.badgeProgressText, { color: rarityColor }]}>
                                                    {progress.text}
                                                </Text>
                                            </View>
                                        )}
                                    </Pressable>
                                </Animated.View>
                            )
                        })}
                    </View>
                </ScrollView>
            </AnimatedScreen>

            {/* ── Badge Detail Modal ── */}
            <Modal
                visible={showBadgeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowBadgeModal(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowBadgeModal(false)}>
                    <Pressable style={styles.sheetBg} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetContent}>
                            {selectedBadge && (() => {
                                const fullBadge = BADGES.find(b => b.slug === selectedBadge.slug) ?? selectedBadge
                                const isEarned = earnedSlugs.has(fullBadge.slug)
                                const rarityColor = RARITY_COLORS[fullBadge.rarity] ?? RARITY_COLORS.common
                                const emoji = BADGE_EMOJIS[fullBadge.slug] ?? '🏅'
                                const progress = getBadgeProgress(fullBadge, currentStreak, totalDays, level)

                                return (
                                    <>
                                        <Text style={styles.sheetEmoji}>{isEarned ? emoji : '🔒'}</Text>
                                        <Text style={styles.sheetBadgeName}>{fullBadge.name}</Text>
                                        <View style={[styles.sheetRarityBadge, { backgroundColor: rarityColor + '20', borderColor: rarityColor + '50' }]}>
                                            <Text style={[styles.sheetRarityText, { color: rarityColor }]}>
                                                {fullBadge.rarity?.toUpperCase() ?? 'COMMON'}
                                            </Text>
                                        </View>
                                        <Text style={styles.sheetDescription}>{fullBadge.description}</Text>
                                        <Text style={styles.sheetXP}>+{fullBadge.xp ?? (fullBadge as any).xp_reward} XP</Text>

                                        {!isEarned && progress && (
                                            <View style={styles.sheetProgressSection}>
                                                <View style={styles.sheetProgressRow}>
                                                    <Text style={styles.sheetProgressLabel}>Progress</Text>
                                                    <Text style={[styles.sheetProgressValue, { color: rarityColor }]}>
                                                        {progress.text}
                                                    </Text>
                                                </View>
                                                <View style={styles.sheetProgressTrack}>
                                                    <View
                                                        style={[
                                                            styles.sheetProgressFill,
                                                            {
                                                                width: `${Math.min(progress.progress, 1) * 100}%`,
                                                                backgroundColor: rarityColor,
                                                            },
                                                        ]}
                                                    />
                                                </View>
                                                {progress.progress < 1 && (
                                                    <Text style={styles.sheetMotivation}>
                                                        {progress.progress > 0.5
                                                            ? '🔥 Almost there — keep going!'
                                                            : "💪 You're making progress!"}
                                                    </Text>
                                                )}
                                            </View>
                                        )}

                                        {isEarned && (
                                            <Text style={styles.sheetEarnedText}>✅ Unlocked!</Text>
                                        )}
                                    </>
                                )
                            })()}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
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

    // ── Weekly Activity Grid ──
    activityCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    activityRow: {
        flexDirection: 'row',
        gap: 3,
    },
    dowLabelCol: {
        justifyContent: 'space-between',
        marginRight: 4,
    },
    dowLabel: {
        fontSize: 9,
        color: Colors.text.tertiary,
        textAlign: 'center',
        height: 12,
        lineHeight: 12,
    },
    activityCol: {
        flex: 1,
        gap: 3,
    },
    activityDot: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 2.5,
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
    badgeWrapper: {
        width: '47%' as any,
        flexGrow: 1,
        flexBasis: '46%' as any,
    },
    badgeItem: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        minHeight: 120,
        justifyContent: 'center',
    },
    badgeEmoji: {
        fontSize: 32,
        marginBottom: 6,
    },
    badgeLocked: {
        opacity: 0.3,
    },
    badgeName: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 14,
    },
    badgeNameLocked: {
        color: Colors.text.tertiary,
    },
    rarityPill: {
        marginTop: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1,
    },
    rarityText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
        color: Colors.text.secondary,
    },
    badgeProgressContainer: {
        width: '100%',
        marginTop: 8,
        alignItems: 'center',
    },
    badgeProgressTrack: {
        width: '100%',
        height: 3,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 1.5,
        overflow: 'hidden',
    },
    badgeProgressFill: {
        height: '100%',
        borderRadius: 1.5,
    },
    badgeProgressText: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 3,
    },

    // ── Badge Detail Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheetBg: {
        backgroundColor: Colors.bg.secondary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 8,
        alignItems: 'center',
    },
    sheetHandle: {
        backgroundColor: Colors.text.tertiary,
        width: 40,
        height: 4,
        borderRadius: 2,
        marginBottom: 8,
    },
    sheetContent: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    sheetEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    sheetBadgeName: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginBottom: 8,
    },
    sheetRarityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    sheetRarityText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    sheetDescription: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    sheetXP: {
        ...Typography.h3,
        color: Colors.gold.primary,
        marginBottom: 12,
    },
    sheetProgressSection: {
        width: '100%',
        marginTop: 4,
    },
    sheetProgressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    sheetProgressLabel: {
        ...Typography.caption,
        color: Colors.text.secondary,
    },
    sheetProgressValue: {
        ...Typography.caption,
        fontWeight: '700',
    },
    sheetProgressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 3,
        overflow: 'hidden',
    },
    sheetProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    sheetMotivation: {
        ...Typography.small,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginTop: 8,
    },
    sheetEarnedText: {
        ...Typography.bodyMedium,
        color: Colors.success,
        marginTop: 4,
    },

    // Gamification row (XP multiplier + freeze indicator)
    gamificationRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    gamificationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    gamificationChipDanger: {
        borderColor: Colors.bg.tertiary,
    },
    gamificationEmoji: {
        fontSize: 14,
    },
    gamificationText: {
        ...Typography.small,
        color: Colors.gold.primary,
        fontWeight: '700',
    },
    freezeInfoCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: 12,
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    freezeInfoTitle: {
        ...Typography.body,
        color: Colors.text.primary,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    freezeInfoText: {
        ...Typography.small,
        color: Colors.text.secondary,
        lineHeight: 20,
        marginBottom: Spacing.xs,
    },
})
