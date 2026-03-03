import { useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { LEVEL_TITLES, LEVEL_THRESHOLDS } from '@/constants/badges'
import { useUserStore } from '@/stores/user.store'
import { useRoutines, useTodayLogs } from '@/hooks/useRoutine'
import { useStreak } from '@/hooks/useHabits'
import { getCompletionRatio } from '@/hooks/useHabits'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'
import { useGroupedAffiliateRecommendations } from '@/hooks/useAffiliate'
import { AffiliateProductCard } from '@/components/ui/AffiliateProductCard'
import { DISPLAY_GROUP_LABELS } from '@/constants/affiliateProducts'
import { getDailyTip } from '@/constants/dailyTips'

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

function getDateString(): string {
    const now = new Date()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[now.getDay()]} \u2022 ${months[now.getMonth()]} ${now.getDate()}`
}

function getLevel(xp: number): number {
    for (let level = 10; level >= 1; level--) {
        if (xp >= LEVEL_THRESHOLDS[level]) return level
    }
    return 1
}

function ActionCard({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
    const scale = useSharedValue(1)
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
    return (
        <Animated.View style={[{ flex: 1 }, animStyle]}>
            <Pressable
                style={styles.actionCard}
                onPress={onPress}
                onPressIn={() => { scale.value = withSpring(0.93, { damping: 12 }) }}
                onPressOut={() => { scale.value = withSpring(1, { damping: 10 }) }}
            >
                <Ionicons name={icon} size={24} color={Colors.gold.primary} />
                <Text style={styles.actionLabel}>{label}</Text>
            </Pressable>
        </Animated.View>
    )
}

export default function HomeScreen() {
    const profile = useUserStore((s) => s.profile)
    const { data: routines } = useRoutines()
    const { data: todayLogs } = useTodayLogs()
    const { data: streak } = useStreak()

    const firstName = profile?.full_name?.split(' ')[0] || 'there'
    const totalXP = profile?.total_xp ?? 0
    const level = getLevel(totalXP)
    const levelTitle = LEVEL_TITLES[level] ?? 'Rookie'
    const currentStreak = streak?.current_streak ?? profile?.current_streak ?? 0

    // XP progress
    const currentThreshold = LEVEL_THRESHOLDS[level]
    const nextThreshold = level < 10 ? LEVEL_THRESHOLDS[level + 1] : LEVEL_THRESHOLDS[10]
    const xpProgress = level >= 10 ? 1 : (totalXP - currentThreshold) / (nextThreshold - currentThreshold)

    // Routine completion
    const morningRoutine = useMemo(() => routines?.find((r: any) => r.type === 'morning'), [routines])
    const nightRoutine = useMemo(() => routines?.find((r: any) => r.type === 'night'), [routines])

    const morningRatio = getCompletionRatio(morningRoutine?.routine_steps ?? [], todayLogs ?? [])
    const nightRatio = getCompletionRatio(nightRoutine?.routine_steps ?? [], todayLogs ?? [])

    // Daily tip
    const dailyTip = getDailyTip()

    const { data: groupedRecs } = useGroupedAffiliateRecommendations()

    const actionScale = useSharedValue(1)
    const actionAnimated = useAnimatedStyle(() => ({ transform: [{ scale: actionScale.value }] }))

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AnimatedScreen>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Gradient Hero Header */}
                    <LinearGradient
                        colors={['rgba(201,168,76,0.12)', 'transparent']}
                        style={styles.heroGradient}
                    >
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <Text style={styles.greeting}>{getGreeting()},</Text>
                            <Text style={styles.name}>{firstName}.</Text>
                            <Text style={styles.dateString}>{getDateString()}</Text>
                        </Animated.View>
                    </LinearGradient>

                    {/* Streak + Level Row */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
                        {/* Streak */}
                        <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/tracker')}>
                            <Text style={styles.statEmoji}>🔥</Text>
                            <Text style={styles.statValue}>{currentStreak}</Text>
                            <Text style={styles.statLabel}>Day Streak</Text>
                        </Pressable>

                        {/* Level */}
                        <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/tracker')}>
                            <Text style={styles.statEmoji}>⭐</Text>
                            <Text style={styles.statValue}>Lv. {level}</Text>
                            <Text style={styles.statLabel}>{levelTitle}</Text>
                        </Pressable>

                        {/* XP */}
                        <View style={styles.statCard}>
                            <Text style={styles.statEmoji}>⚡</Text>
                            <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total XP</Text>
                        </View>
                    </Animated.View>

                    {/* XP Progress Bar */}
                    <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.xpBarSection}>
                        <ProgressBar
                            progress={Math.min(xpProgress, 1)}
                            height={6}
                            color={Colors.gold.primary}
                            animated
                        />
                        {level < 10 && (
                            <Text style={styles.xpBarLabel}>
                                {totalXP.toLocaleString()} / {nextThreshold.toLocaleString()} XP
                            </Text>
                        )}
                    </Animated.View>

                    {/* Today's Routines */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <Text style={styles.sectionTitle}>Today's Routines</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.routineRow}>
                        {/* Morning */}
                        <Pressable
                            style={styles.routineMini}
                            onPress={() => morningRoutine && router.push({
                                pathname: '/routine-editor',
                                params: { routineId: morningRoutine.id, routineName: morningRoutine.name },
                            })}
                        >
                            <View style={styles.routineMiniHeader}>
                                <Ionicons name="sunny" size={18} color={Colors.gold.primary} />
                                <Text style={styles.routineMiniTitle}>Morning</Text>
                            </View>
                            <Text style={styles.routineMiniCount}>
                                {morningRatio.completed}/{morningRatio.total}
                            </Text>
                            <View style={styles.miniTrack}>
                                <View
                                    style={[
                                        styles.miniFill,
                                        {
                                            width: `${morningRatio.total > 0 ? (morningRatio.completed / morningRatio.total) * 100 : 0}%`,
                                            backgroundColor: morningRatio.completed === morningRatio.total && morningRatio.total > 0
                                                ? Colors.success
                                                : Colors.gold.primary,
                                        },
                                    ]}
                                />
                            </View>
                            {morningRatio.completed === morningRatio.total && morningRatio.total > 0 && (
                                <Text style={styles.routineComplete}>✓ Done</Text>
                            )}
                        </Pressable>

                        {/* Night */}
                        <Pressable
                            style={styles.routineMini}
                            onPress={() => nightRoutine && router.push({
                                pathname: '/routine-editor',
                                params: { routineId: nightRoutine.id, routineName: nightRoutine.name },
                            })}
                        >
                            <View style={styles.routineMiniHeader}>
                                <Ionicons name="moon" size={18} color={Colors.gold.primary} />
                                <Text style={styles.routineMiniTitle}>Night</Text>
                            </View>
                            <Text style={styles.routineMiniCount}>
                                {nightRatio.completed}/{nightRatio.total}
                            </Text>
                            <View style={styles.miniTrack}>
                                <View
                                    style={[
                                        styles.miniFill,
                                        {
                                            width: `${nightRatio.total > 0 ? (nightRatio.completed / nightRatio.total) * 100 : 0}%`,
                                            backgroundColor: nightRatio.completed === nightRatio.total && nightRatio.total > 0
                                                ? Colors.success
                                                : Colors.gold.primary,
                                        },
                                    ]}
                                />
                            </View>
                            {nightRatio.completed === nightRatio.total && nightRatio.total > 0 && (
                                <Text style={styles.routineComplete}>✓ Done</Text>
                            )}
                        </Pressable>
                    </Animated.View>

                    {/* Daily Tip */}
                    <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.tipCard}>
                        <View style={styles.tipHeader}>
                            <Ionicons name="bulb-outline" size={18} color={Colors.gold.primary} />
                            <Text style={styles.tipTitle}>Daily Tip</Text>
                        </View>
                        <Text style={styles.tipText}>{dailyTip}</Text>
                    </Animated.View>

                    {/* Products For You — Categorized */}
                    {(groupedRecs ?? []).length > 0 && (
                        <Animated.View entering={FadeInDown.delay(380).duration(400)} style={styles.affiliateSection}>
                            <Text style={styles.sectionTitle}>Products For You</Text>
                            <Text style={styles.sectionSubtitle}>Matched to your skin type & preferences</Text>
                            {(groupedRecs ?? []).map((group) => {
                                const label = DISPLAY_GROUP_LABELS[group.group]
                                return (
                                    <View key={group.group} style={styles.productGroup}>
                                        <Text style={styles.groupTitle}>{label.emoji} {label.title}</Text>
                                        <View style={styles.affiliateList}>
                                            {group.products.map((product) => (
                                                <AffiliateProductCard
                                                    key={product.id}
                                                    product={product}
                                                    source={`home-${group.group}`}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )
                            })}
                        </Animated.View>
                    )}

                    {/* Quick Actions */}
                    <Animated.View entering={FadeInDown.delay(450).duration(400)}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.actionsRow}>
                        <ActionCard icon="list" label="Routines" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/routines') }} />
                        <ActionCard icon="trophy" label="Badges" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/tracker') }} />
                        <ActionCard icon="cut" label="Barber" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/barber') }} />
                    </Animated.View>

                    {/* Tools */}
                    <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Tools</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(520).duration(400)} style={styles.actionsRow}>
                        <ActionCard icon="camera" label="Skin AI" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/skin-analysis') }} />
                        <ActionCard icon="barcode" label="Scan" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/product-scanner') }} />
                        <ActionCard icon="sparkles" label="AI Routine" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/ai-routine') }} />
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(540).duration(400)} style={[styles.actionsRow, { marginTop: Spacing.sm }]}
                    >
                        <ActionCard icon="pulse" label="Hair Loss" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/hair-loss-tracker') }} />
                        <View style={{ flex: 2 }} />
                    </Animated.View>
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
    affiliateSection: {
        marginBottom: Spacing.md,
    },
    sectionSubtitle: {
        ...Typography.small,
        color: Colors.text.tertiary,
        marginTop: -Spacing.xs,
        marginBottom: Spacing.sm,
    },
    affiliateList: {
        gap: Spacing.sm,
    },
    productGroup: {
        marginBottom: Spacing.md,
    },
    groupTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
    heroGradient: {
        marginHorizontal: -Spacing.lg,
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
        paddingTop: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    greeting: {
        fontSize: 16,
        fontWeight: '500' as const,
        lineHeight: 22,
        color: Colors.text.secondary,
    },
    name: {
        ...Typography.display,
        color: Colors.text.primary,
        marginBottom: Spacing.xs,
    },
    dateString: {
        ...Typography.small,
        color: Colors.text.tertiary,
        marginBottom: Spacing.md,
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(201,168,76,0.15)',
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    statValue: {
        ...Typography.h3,
        color: Colors.gold.primary,
    },
    statLabel: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginTop: 2,
    },

    // XP Bar
    xpBarSection: {
        marginBottom: Spacing.lg,
    },
    xpBarLabel: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        textAlign: 'right',
        marginTop: 4,
    },

    // Section
    sectionTitle: {
        ...Typography.h3,
        color: Colors.text.primary,
        marginBottom: Spacing.sm,
    },

    // Routine Mini Cards
    routineRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    routineMini: {
        flex: 1,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    routineMiniHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.xs,
    },
    routineMiniTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    routineMiniCount: {
        ...Typography.caption,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
    miniTrack: {
        height: 4,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 2,
        overflow: 'hidden',
    },
    miniFill: {
        height: '100%',
        borderRadius: 2,
    },
    routineComplete: {
        ...Typography.caption,
        color: Colors.success,
        marginTop: Spacing.xs,
        fontWeight: '600',
    },

    // Tip Card
    tipCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.overlay.gold,
        marginBottom: Spacing.lg,
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    tipTitle: {
        ...Typography.h3,
        color: Colors.gold.primary,
    },
    tipText: {
        ...Typography.body,
        color: Colors.text.secondary,
        lineHeight: 22,
    },

    // Quick Actions
    actionsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionCard: {
        flex: 1,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        gap: Spacing.xs,
    },
    actionLabel: {
        ...Typography.caption,
        color: Colors.text.secondary,
        fontWeight: '600',
    },
})
