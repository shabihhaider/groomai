// app/routine-editor.tsx
// Routine detail screen — shows steps, allows completion, tracks XP

import { useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp, ZoomIn, Layout } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius, Springs } from '@/constants/spacing'
import { useRoutines, useRoutineSteps, useTodayLogs, useCompleteStep, useUncompleteStep } from '@/hooks/useRoutine'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { useUserStore } from '@/stores/user.store'
import { getCompletionRatio } from '@/hooks/useHabits'
import { habitService, badgeService } from '@/services/habit.service'
import { scheduleStreakWarning } from '@/utils/notifications'
import { StepTimer } from '@/components/routine/StepTimer'
import { XPToast } from '@/components/tracker/XPToast'


const CATEGORY_ICONS: Record<string, string> = {
    face: 'water-outline',
    hair: 'cut-outline',
    beard: 'man-outline',
    body: 'body-outline',
}


export default function RoutineEditorScreen() {
    const { routineId, routineName } = useLocalSearchParams<{ routineId: string; routineName: string }>()
    const { data: steps, isLoading } = useRoutineSteps(routineId)
    const { data: todayLogs } = useTodayLogs()
    const { data: allRoutines } = useRoutines()
    const completeStep = useCompleteStep()
    const uncompleteStep = useUncompleteStep()
    const isPremium = useSubscriptionStore((s) => s.isPremium)
    const userId = useUserStore((s) => s.session?.user?.id)

    const [xpToasts, setXpToasts] = useState<{ id: number; amount: number }[]>([])
    const [showCelebration, setShowCelebration] = useState(false)

    // Build a set of completed step IDs from today's logs
    const completedStepIds = useMemo(() => {
        if (!todayLogs) return new Set<string>()
        return new Set(
            todayLogs
                .filter((log: any) => log.completed)
                .map((log: any) => log.routine_step_id)
        )
    }, [todayLogs])

    // Count completed steps for this routine
    const totalSteps = steps?.length ?? 0
    const completedCount = steps?.filter((s: any) => completedStepIds.has(s.id)).length ?? 0
    const progress = totalSteps > 0 ? completedCount / totalSteps : 0
    const allComplete = completedCount === totalSteps && totalSteps > 0

    const handleToggleStep = useCallback(async (stepId: string) => {
        const isCurrentlyCompleted = completedStepIds.has(stepId)

        if (isCurrentlyCompleted) {
            // Uncomplete
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            uncompleteStep.mutate(stepId)
        } else {
            // Complete
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            completeStep.mutate(stepId, {
                onSuccess: async () => {
                    // Show XP toast
                    const toastId = Date.now()
                    setXpToasts((prev) => [...prev, { id: toastId, amount: 10 }])

                    // Check and award badge after every step completion
                    if (userId) {
                        badgeService.checkAndAward(userId).then((badge) => {
                            if (badge) {
                                router.push({
                                    pathname: '/badge-unlock',
                                    params: {
                                        slug: badge.slug,
                                        name: badge.name,
                                        description: badge.description,
                                        xpReward: String(badge.xp_reward),
                                        rarity: badge.rarity,
                                    },
                                })
                            }
                        }).catch(() => { })
                    }

                    // Check if this completes the routine
                    const newCompletedCount = completedCount + 1
                    if (newCompletedCount === totalSteps && userId) {
                        // Award +50 XP for full routine completion
                        habitService.awardXP(userId, 50).catch(() => { })

                        // Check if BOTH morning + night routines are now complete → +30 bonus
                        if (allRoutines && todayLogs) {
                            const otherRoutines = allRoutines.filter(
                                (r: any) => r.id !== routineId && (r.type === 'morning' || r.type === 'night')
                            )
                            const allOthersDone = otherRoutines.every((r: any) => {
                                const ratio = getCompletionRatio(r.routine_steps ?? [], todayLogs)
                                return ratio.completed === ratio.total && ratio.total > 0
                            })
                            if (allOthersDone && otherRoutines.length > 0) {
                                habitService.awardXP(userId, 30).catch(() => { })
                            }
                        }

                        // Schedule streak warning for 8pm if they have a streak
                        habitService.getStreak(userId).then((streak) => {
                            if (streak?.current_streak > 0) {
                                scheduleStreakWarning(streak.current_streak).catch(() => { })
                            }
                        }).catch(() => { })

                        setTimeout(() => {
                            setShowCelebration(true)
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

                            // Show bonus XP toast for routine completion
                            const bonusToastId = Date.now() + 1
                            setXpToasts((prev) => [...prev, { id: bonusToastId, amount: 50 }])
                        }, 500)
                    }
                },
            })
        }
    }, [completedStepIds, completedCount, totalSteps])

    const removeToast = useCallback((id: number) => {
        setXpToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gold.primary} />
            </View>
        )
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{routineName ?? 'Routine'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {completedCount}/{totalSteps} steps completed
                    </Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <Animated.View
                        layout={Layout.springify()}
                        style={[
                            styles.progressFill,
                            {
                                width: `${progress * 100}%`,
                                backgroundColor: allComplete ? Colors.success : Colors.gold.primary,
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Steps List */}
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {steps?.map((step: any, index: number) => {
                    const isCompleted = completedStepIds.has(step.id)
                    const categoryIcon = CATEGORY_ICONS[step.category] ?? 'ellipse-outline'

                    return (
                        <Animated.View
                            key={step.id}
                            entering={FadeInDown.delay(index * 80).duration(350)}
                        >
                            <Pressable
                                style={[styles.stepCard, isCompleted && styles.stepCardCompleted]}
                                onPress={() => handleToggleStep(step.id)}
                            >
                                {/* Circle / Checkmark */}
                                <View style={styles.stepLeft}>
                                    {isCompleted ? (
                                        <Animated.View
                                            entering={ZoomIn.springify().damping(10).stiffness(200)}
                                            style={styles.checkCircle}
                                        >
                                            <Ionicons name="checkmark" size={16} color={Colors.text.inverse} />
                                        </Animated.View>
                                    ) : (
                                        <View style={styles.emptyCircle}>
                                            <Text style={styles.stepNumber}>{index + 1}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Step Info */}
                                <View style={styles.stepContent}>
                                    <View style={styles.stepTitleRow}>
                                        <Ionicons
                                            name={categoryIcon as any}
                                            size={14}
                                            color={isCompleted ? Colors.text.tertiary : Colors.text.secondary}
                                        />
                                        <Text
                                            style={[
                                                styles.stepTitle,
                                                isCompleted && styles.stepTitleCompleted,
                                            ]}
                                        >
                                            {step.title}
                                        </Text>
                                    </View>
                                    {step.description && (
                                        <Text
                                            style={[
                                                styles.stepDescription,
                                                isCompleted && styles.stepDescriptionCompleted,
                                            ]}
                                        >
                                            {step.description}
                                        </Text>
                                    )}

                                    {/* Timer (premium only) */}
                                    {isPremium && step.duration_seconds > 0 && !isCompleted && (
                                        <StepTimer
                                            seconds={step.duration_seconds}
                                            onComplete={() => handleToggleStep(step.id)}
                                        />
                                    )}
                                </View>
                            </Pressable>


                        </Animated.View>
                    )
                })}



                {/* Celebration */}
                {showCelebration && (
                    <Animated.View entering={FadeInUp.springify()} style={styles.celebration}>
                        <Text style={styles.celebrationEmoji}>🎉</Text>
                        <Text style={styles.celebrationTitle}>Routine Complete!</Text>
                        <Text style={styles.celebrationXP}>+50 XP Bonus</Text>
                    </Animated.View>
                )}
            </ScrollView>

            {/* XP Toasts */}
            <View style={styles.toastContainer} pointerEvents="none">
                {xpToasts.map((toast) => (
                    <XPToast
                        key={toast.id}
                        amount={toast.amount}
                        onDone={() => removeToast(toast.id)}
                    />
                ))}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backButton: {
        marginRight: Spacing.sm,
        padding: 4,
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.text.primary,
    },
    headerSubtitle: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    progressContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    progressTrack: {
        height: 6,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    scroll: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
    },
    stepCard: {
        flexDirection: 'row',
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    stepCardCompleted: {
        opacity: 0.6,
        borderColor: Colors.success + '30',
    },
    stepLeft: {
        marginRight: Spacing.md,
        marginTop: 2,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.success,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: Colors.text.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumber: {
        ...Typography.caption,
        color: Colors.text.tertiary,
        fontWeight: '600',
    },
    stepContent: {
        flex: 1,
    },
    stepTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    stepTitle: {
        ...Typography.bodyMedium,
        color: Colors.text.primary,
    },
    stepTitleCompleted: {
        textDecorationLine: 'line-through',
        color: Colors.text.tertiary,
    },
    stepDescription: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginTop: 2,
    },
    stepDescriptionCompleted: {
        color: Colors.text.tertiary,
    },
    celebration: {
        alignItems: 'center',
        marginTop: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    celebrationEmoji: {
        fontSize: 48,
        marginBottom: Spacing.sm,
    },
    celebrationTitle: {
        ...Typography.h2,
        color: Colors.success,
        marginBottom: 4,
    },
    celebrationXP: {
        ...Typography.h3,
        color: Colors.gold.primary,
    },
    toastContainer: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
})
