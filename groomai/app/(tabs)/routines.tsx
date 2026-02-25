import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import BottomSheetLib, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useUserStore } from '@/stores/user.store'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { useRoutines, useTodayLogs, useSeedRoutines, useCreateRoutine } from '@/hooks/useRoutine'
import { getCompletionRatio } from '@/hooks/useHabits'
import { RoutineCard } from '@/components/routine/RoutineCard'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'

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
    return `${days[now.getDay()]} • ${months[now.getMonth()]} ${now.getDate()}`
}

// Daily tips that rotate based on the day of the year
const DAILY_TIPS = [
    'Try splashing cold water on your face after cleansing — it helps tighten pores.',
    'Apply sunscreen every morning, even on cloudy days. UV damage is the #1 cause of premature aging.',
    'Change your pillowcase every 2-3 days to reduce breakouts.',
    'Drink at least 8 glasses of water today. Hydration shows in your skin.',
    'Pat your face dry instead of rubbing — it reduces irritation.',
    'Exfoliate no more than 2-3 times per week to avoid over-stripping your skin.',
    'Apply moisturizer to slightly damp skin for better absorption.',
]

export default function RoutinesScreen() {
    const profile = useUserStore((s) => s.profile)
    const isPremium = useSubscriptionStore((s) => s.isPremium)
    const { data: routines, isLoading: routinesLoading } = useRoutines()
    const { data: todayLogs } = useTodayLogs()
    const seedRoutines = useSeedRoutines()
    const createRoutine = useCreateRoutine()

    // Create Custom Routine sheet
    const sheetRef = useRef<BottomSheetLib>(null)
    const [newRoutineName, setNewRoutineName] = useState('')
    const [newRoutineType, setNewRoutineType] = useState<'morning' | 'night' | 'custom'>('custom')

    function openCreateSheet() {
        setNewRoutineName('')
        setNewRoutineType('custom')
        sheetRef.current?.expand()
    }

    function handleCreateRoutine() {
        if (!newRoutineName.trim()) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        createRoutine.mutate(
            { name: newRoutineName.trim(), type: newRoutineType },
            { onSuccess: () => { sheetRef.current?.close() } }
        )
    }

    const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
    const greeting = `${getGreeting()}, ${firstName}.`
    const dateString = getDateString()

    // Auto-seed default routines if user has none
    useEffect(() => {
        if (!routinesLoading && routines && routines.length === 0 && !seedRoutines.isPending) {
            seedRoutines.mutate()
        }
    }, [routinesLoading, routines?.length])

    // Separate morning and night routines
    const morningRoutine = useMemo(() => routines?.find((r: any) => r.type === 'morning'), [routines])
    const nightRoutine = useMemo(() => routines?.find((r: any) => r.type === 'night'), [routines])
    const customRoutines = useMemo(() => routines?.filter((r: any) => r.type === 'custom') ?? [], [routines])

    // Today's tip
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const dailyTip = DAILY_TIPS[dayOfYear % DAILY_TIPS.length]

    const createBtnScale = useSharedValue(1)
    const createBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: createBtnScale.value }] }))

    if (routinesLoading || seedRoutines.isPending) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={Colors.gold.primary} />
                <Text style={styles.loadingText}>
                    {seedRoutines.isPending ? 'Setting up your routines...' : 'Loading...'}
                </Text>
            </View>
        )
    }

    return (
        <>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnimatedScreen>
                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <Text style={styles.greeting}>{greeting}</Text>
                            <Text style={styles.dateString}>{dateString}</Text>
                        </Animated.View>

                        {/* Routine Cards */}
                        <View style={styles.cardRow}>
                            {morningRoutine && (
                                <RoutineCard
                                    name={morningRoutine.name}
                                    type="morning"
                                    completed={getCompletionRatio(
                                        morningRoutine.routine_steps ?? [],
                                        todayLogs ?? []
                                    ).completed}
                                    total={getCompletionRatio(
                                        morningRoutine.routine_steps ?? [],
                                        todayLogs ?? []
                                    ).total}
                                    index={0}
                                    onPress={() => router.push({
                                        pathname: '/routine-editor',
                                        params: { routineId: morningRoutine.id, routineName: morningRoutine.name },
                                    })}
                                />
                            )}
                            {nightRoutine && (
                                <RoutineCard
                                    name={nightRoutine.name}
                                    type="night"
                                    completed={getCompletionRatio(
                                        nightRoutine.routine_steps ?? [],
                                        todayLogs ?? []
                                    ).completed}
                                    total={getCompletionRatio(
                                        nightRoutine.routine_steps ?? [],
                                        todayLogs ?? []
                                    ).total}
                                    index={1}
                                    onPress={() => router.push({
                                        pathname: '/routine-editor',
                                        params: { routineId: nightRoutine.id, routineName: nightRoutine.name },
                                    })}
                                />
                            )}
                        </View>

                        {/* Custom Routines */}
                        {customRoutines.map((routine: any, i: number) => (
                            <View key={routine.id} style={{ marginTop: Spacing.sm }}>
                                <RoutineCard
                                    name={routine.name}
                                    type="custom"
                                    completed={getCompletionRatio(
                                        routine.routine_steps ?? [],
                                        todayLogs ?? []
                                    ).completed}
                                    total={getCompletionRatio(
                                        routine.routine_steps ?? [],
                                        todayLogs ?? []
                                    ).total}
                                    index={i + 2}
                                    onPress={() => router.push({
                                        pathname: '/routine-editor',
                                        params: { routineId: routine.id, routineName: routine.name },
                                    })}
                                />
                            </View>
                        ))}

                        {/* Create Custom Routine */}
                        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                            <Animated.View style={createBtnAnimated}>
                                <Pressable
                                    style={styles.createButton}
                                    onPressIn={() => { createBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                                    onPressOut={() => { createBtnScale.value = withSpring(1, { damping: 15 }) }}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        if (isPremium) {
                                            openCreateSheet()
                                        } else {
                                            router.push('/paywall')
                                        }
                                    }}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color={Colors.gold.primary} />
                                    <Text style={styles.createLabel}>Create Custom Routine</Text>
                                    {!isPremium && (
                                        <View style={styles.premiumBadge}>
                                            <Text style={styles.premiumText}>PRO</Text>
                                        </View>
                                    )}
                                </Pressable>
                            </Animated.View>
                        </Animated.View>

                        {/* Daily Tip */}
                        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.tipCard}>
                            <View style={styles.tipHeader}>
                                <Ionicons name="bulb-outline" size={18} color={Colors.gold.primary} />
                                <Text style={styles.tipTitle}>Today's Tip</Text>
                            </View>
                            <Text style={styles.tipText}>{dailyTip}</Text>
                        </Animated.View>
                    </ScrollView>
                </AnimatedScreen>
            </SafeAreaView>

            {/* Create Custom Routine Bottom Sheet — premium only */}
            <BottomSheetLib
                ref={sheetRef}
                index={-1}
                snapPoints={['55%']}
                enablePanDownToClose
                backdropComponent={(props) => (
                    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
                )}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.sheetHandle}
            >
                <BottomSheetView style={styles.sheetContent}>
                    <Text style={styles.sheetTitle}>New Custom Routine</Text>

                    {/* Name input */}
                    <Text style={styles.sheetLabel}>Routine Name</Text>
                    <TextInput
                        style={styles.sheetInput}
                        value={newRoutineName}
                        onChangeText={setNewRoutineName}
                        placeholder="e.g. Gym Day Routine"
                        placeholderTextColor={Colors.text.tertiary}
                        returnKeyType="done"
                        maxLength={40}
                    />

                    {/* Type picker */}
                    <Text style={styles.sheetLabel}>Type</Text>
                    <View style={styles.typePicker}>
                        {(['morning', 'night', 'custom'] as const).map((t) => (
                            <Pressable
                                key={t}
                                style={[styles.typeBtn, newRoutineType === t && styles.typeBtnActive]}
                                onPress={() => { setNewRoutineType(t); Haptics.selectionAsync() }}
                            >
                                <Text style={[styles.typeBtnText, newRoutineType === t && styles.typeBtnTextActive]}>
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Create button */}
                    <Pressable
                        style={[styles.sheetCta, (!newRoutineName.trim() || createRoutine.isPending) && { opacity: 0.4 }]}
                        onPress={handleCreateRoutine}
                        disabled={!newRoutineName.trim() || createRoutine.isPending}
                    >
                        <Text style={styles.sheetCtaText}>
                            {createRoutine.isPending ? 'Creating...' : 'Create Routine'}
                        </Text>
                    </Pressable>
                </BottomSheetView>
            </BottomSheetLib>
        </>
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
    scroll: {
        padding: Spacing.lg,
        paddingBottom: 120,
    },
    greeting: {
        ...Typography.h1,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    dateString: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginBottom: Spacing.lg,
    },
    loadingText: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginTop: Spacing.md,
    },
    cardRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
        borderRadius: BorderRadius.lg,
        borderStyle: 'dashed',
        marginBottom: Spacing.lg,
    },
    createLabel: {
        ...Typography.bodyMedium,
        color: Colors.gold.primary,
    },
    premiumBadge: {
        backgroundColor: Colors.gold.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    premiumText: {
        ...Typography.caption,
        color: Colors.text.inverse,
        fontWeight: '700',
    },
    tipCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.overlay.gold,
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

    // Bottom sheet styles
    sheetBackground: {
        backgroundColor: Colors.bg.secondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    sheetHandle: {
        backgroundColor: Colors.text.tertiary,
        width: 36,
        height: 4,
    },
    sheetContent: {
        flex: 1,
        padding: Spacing.lg,
    },
    sheetTitle: {
        ...Typography.h2,
        color: Colors.text.primary,
        marginBottom: Spacing.lg,
    },
    sheetLabel: {
        ...Typography.label,
        color: Colors.text.secondary,
        marginBottom: Spacing.xs,
    },
    sheetInput: {
        ...Typography.body,
        color: Colors.text.primary,
        backgroundColor: Colors.bg.input,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        marginBottom: Spacing.lg,
    },
    typePicker: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    typeBtn: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        alignItems: 'center',
    },
    typeBtnActive: {
        borderColor: Colors.gold.primary,
        backgroundColor: Colors.overlay.gold,
    },
    typeBtnText: {
        ...Typography.bodyMedium,
        color: Colors.text.secondary,
    },
    typeBtnTextActive: {
        color: Colors.gold.primary,
        fontWeight: '700',
    },
    sheetCta: {
        backgroundColor: Colors.gold.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 14,
        alignItems: 'center',
    },
    sheetCtaText: {
        ...Typography.bodyMedium,
        color: Colors.text.inverse,
        fontWeight: '700',
    },
})
