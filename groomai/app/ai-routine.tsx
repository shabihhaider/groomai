// app/ai-routine.tsx
// Phase 7 — AI Routine Generator: generates then lets user review/deselect steps before saving

import { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useGenerateRoutine, useSaveGeneratedRoutine } from '@/hooks/useAI'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'

type RoutineStep = {
    title: string
    description: string
    category: string
    duration_seconds: number
    product_suggestion?: string
    selected: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
    face: '💧',
    hair: '✂️',
    beard: '🪒',
    body: '🚿',
}

function StepCard({
    step,
    onToggle,
}: {
    step: RoutineStep
    onToggle: () => void
}) {
    return (
        <Pressable
            style={[styles.stepCard, !step.selected && styles.stepCardUnselected]}
            onPress={() => { Haptics.selectionAsync(); onToggle() }}
        >
            <View style={[styles.stepCheck, step.selected && styles.stepCheckActive]}>
                {step.selected && <Ionicons name="checkmark" size={16} color={Colors.bg.primary} />}
            </View>
            <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                    <Text style={styles.stepEmoji}>{CATEGORY_ICONS[step.category] ?? '✅'}</Text>
                    <Text style={[styles.stepTitle, !step.selected && styles.textDimmed]} numberOfLines={1}>
                        {step.title}
                    </Text>
                    <Text style={styles.stepDuration}>
                        {step.duration_seconds < 60 ? `${step.duration_seconds}s` : `${Math.round(step.duration_seconds / 60)}m`}
                    </Text>
                </View>
                <Text style={[styles.stepDesc, !step.selected && styles.textDimmed]} numberOfLines={2}>
                    {step.description}
                </Text>
                {step.product_suggestion && step.selected && (
                    <Text style={styles.stepProduct}>💊 {step.product_suggestion}</Text>
                )}
            </View>
        </Pressable>
    )
}

function RoutineSection({
    title,
    steps,
    onToggle,
}: {
    title: string
    steps: RoutineStep[]
    onToggle: (i: number) => void
}) {
    const selectedCount = steps.filter((s) => s.selected).length
    const totalTime = steps.filter((s) => s.selected).reduce((acc, s) => acc + s.duration_seconds, 0)
    const mins = Math.ceil(totalTime / 60)

    return (
        <View style={styles.routineSection}>
            <View style={styles.routineSectionHeader}>
                <Text style={styles.routineSectionTitle}>{title}</Text>
                <Text style={styles.routineSectionMeta}>
                    {selectedCount} steps · ~{mins} min
                </Text>
            </View>
            {steps.map((step, i) => (
                <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(300)}>
                    <StepCard step={step} onToggle={() => onToggle(i)} />
                </Animated.View>
            ))}
        </View>
    )
}

export default function AIRoutineScreen() {
    const generateRoutine = useGenerateRoutine()
    const saveRoutine = useSaveGeneratedRoutine()

    const [morning, setMorning] = useState<RoutineStep[]>([])
    const [night, setNight] = useState<RoutineStep[]>([])
    const [generated, setGenerated] = useState(false)

    function generate() {
        generateRoutine.mutate(undefined, {
            onSuccess: (data) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setMorning((data.morning ?? []).map((s: any) => ({ ...s, selected: true })))
                setNight((data.night ?? []).map((s: any) => ({ ...s, selected: true })))
                setGenerated(true)
            },
            onError: (err: any) => {
                if (err?.code === 'rate_limit_exceeded') {
                    Alert.alert('Limit Reached', err.message)
                } else if (err?.code === 'ai_unavailable') {
                    Alert.alert('AI Temporarily Unavailable', 'Please try again in a few minutes.')
                } else {
                    Alert.alert('Generation Failed', 'Please check your connection and try again.')
                }
            },
        })
    }

    function toggleMorning(i: number) {
        setMorning((prev) => prev.map((s, idx) => idx === i ? { ...s, selected: !s.selected } : s))
    }

    function toggleNight(i: number) {
        setNight((prev) => prev.map((s, idx) => idx === i ? { ...s, selected: !s.selected } : s))
    }

    async function save() {
        const selectedMorning = morning.filter((s) => s.selected)
        const selectedNight = night.filter((s) => s.selected)

        if (selectedMorning.length === 0 && selectedNight.length === 0) {
            Alert.alert('Select at least one step', 'Keep at least one step in either routine.')
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        const routinesToSave = []
        if (selectedMorning.length > 0) routinesToSave.push({ type: 'morning' as const, steps: selectedMorning })
        if (selectedNight.length > 0) routinesToSave.push({ type: 'night' as const, steps: selectedNight })

        saveRoutine.mutate(routinesToSave, {
            onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                Alert.alert(
                    '🎉 Routine Saved!',
                    'Your AI-generated routine is ready. Find it in the Routines tab.',
                    [{ text: "Let's go!", onPress: () => router.replace('/(tabs)/routines') }]
                )
            },
            onError: () => {
                Alert.alert('Save Failed', 'Could not save routine. Please try again.')
            },
        })
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AnimatedScreen>
                {/* Header */}
                <View style={styles.headerBar}>
                    <Pressable style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                    </Pressable>
                    <View style={styles.proPill}>
                        <Ionicons name="diamond" size={12} color={Colors.gold.primary} />
                        <Text style={styles.proPillText}>AI</Text>
                    </View>
                </View>

                {!generated ? (
                    // ── Generate prompt screen ─────────────────────────────
                    <ScrollView contentContainerStyle={styles.promptScroll}>
                        <LinearGradient colors={['rgba(201,168,76,0.10)', 'transparent']} style={styles.promptHero}>
                            <Animated.View entering={FadeInDown.duration(350)}>
                                <Text style={styles.promptEmoji}>🤖</Text>
                                <Text style={styles.promptTitle}>AI Routine Generator</Text>
                                <Text style={styles.promptSubtitle}>
                                    GPT-4o will build your personalized morning and night grooming plan based on your skin type, hair type, and goals.
                                </Text>
                            </Animated.View>
                        </LinearGradient>

                        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.featureList}>
                            {[
                                { icon: '👤', text: 'Personalized to your skin type and concerns' },
                                { icon: '⏱', text: 'Fits your available time budget' },
                                { icon: '💊', text: 'Specific product recommendations' },
                                { icon: '🪒', text: 'Includes beard care if applicable' },
                            ].map((item, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <Text style={styles.featureEmoji}>{item.icon}</Text>
                                    <Text style={styles.featureText}>{item.text}</Text>
                                </View>
                            ))}
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(150).duration(350)} style={styles.generateSection}>
                            <Text style={styles.generateNote}>
                                ~15 seconds · Estimated 10–15 minutes daily commitment generated
                            </Text>
                            <Pressable
                                style={[styles.generateBtn, generateRoutine.isPending && styles.generateBtnDisabled]}
                                onPress={generate}
                                disabled={generateRoutine.isPending}
                            >
                                <LinearGradient
                                    colors={[Colors.gold.primary, Colors.gold.muted]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.generateBtnGradient}
                                >
                                    {generateRoutine.isPending ? (
                                        <>
                                            <ActivityIndicator size="small" color={Colors.bg.primary} />
                                            <Text style={styles.generateBtnText}>Building your plan...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="sparkles" size={20} color={Colors.bg.primary} />
                                            <Text style={styles.generateBtnText}>Generate My Routine</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>
                    </ScrollView>
                ) : (
                    // ── Review screen ──────────────────────────────────────
                    <>
                        <ScrollView contentContainerStyle={styles.reviewScroll} showsVerticalScrollIndicator={false}>
                            <Animated.View entering={FadeInDown.duration(300)} style={styles.reviewHeader}>
                                <Ionicons name="checkmark-circle" size={22} color="#34C759" />
                                <Text style={styles.reviewHeaderText}>Your AI Routine is Ready</Text>
                            </Animated.View>
                            <Text style={styles.reviewHint}>
                                Tap any step to remove it from your routine
                            </Text>

                            <RoutineSection title="☀️ Morning Routine" steps={morning} onToggle={toggleMorning} />
                            <RoutineSection title="🌙 Night Routine" steps={night} onToggle={toggleNight} />
                        </ScrollView>

                        {/* Save CTA */}
                        <View style={styles.saveBar}>
                            <Pressable
                                style={styles.regenerateBtn}
                                onPress={generate}
                                disabled={generateRoutine.isPending}
                            >
                                <Ionicons name="refresh" size={18} color={Colors.text.secondary} />
                            </Pressable>
                            <Pressable
                                style={[styles.saveBtn, saveRoutine.isPending && { opacity: 0.7 }]}
                                onPress={save}
                                disabled={saveRoutine.isPending}
                            >
                                <LinearGradient
                                    colors={[Colors.gold.primary, Colors.gold.muted]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.saveBtnGradient}
                                >
                                    {saveRoutine.isPending ? (
                                        <ActivityIndicator size="small" color={Colors.bg.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="save" size={18} color={Colors.bg.primary} />
                                            <Text style={styles.saveBtnText}>Save Routine</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </>
                )}
            </AnimatedScreen>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary },
    headerBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.bg.secondary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    proPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.overlay.gold, paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.gold.muted,
    },
    proPillText: { ...Typography.caption, color: Colors.gold.primary, fontWeight: '700' },

    // Prompt screen
    promptScroll: { paddingBottom: 60 },
    promptHero: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl, alignItems: 'center' },
    promptEmoji: { fontSize: 52, textAlign: 'center', marginBottom: Spacing.sm },
    promptTitle: { ...Typography.h1, color: Colors.text.primary, textAlign: 'center' },
    promptSubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22, marginTop: Spacing.sm },
    featureList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.xl },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    featureEmoji: { fontSize: 18, width: 26 },
    featureText: { ...Typography.body, color: Colors.text.secondary, flex: 1, lineHeight: 22 },
    generateSection: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
    generateNote: { ...Typography.small, color: Colors.text.tertiary, textAlign: 'center' },
    generateBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
    generateBtnDisabled: { opacity: 0.7 },
    generateBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, paddingVertical: 18,
    },
    generateBtnText: { ...Typography.h3, color: Colors.bg.primary, fontWeight: '800' },

    // Review screen
    reviewScroll: { paddingBottom: 100 },
    reviewHeader: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 2,
    },
    reviewHeaderText: { ...Typography.bodyMedium, color: '#34C759', fontWeight: '700' },
    reviewHint: { ...Typography.small, color: Colors.text.tertiary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    routineSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
    routineSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    routineSectionTitle: { ...Typography.h3, color: Colors.text.primary },
    routineSectionMeta: { ...Typography.caption, color: Colors.text.tertiary },
    stepCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.xs,
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    stepCardUnselected: { opacity: 0.45 },
    stepCheck: {
        width: 24, height: 24, borderRadius: 12,
        borderWidth: 2, borderColor: Colors.bg.tertiary,
        justifyContent: 'center', alignItems: 'center',
        marginTop: 2, flexShrink: 0,
    },
    stepCheckActive: { backgroundColor: Colors.gold.primary, borderColor: Colors.gold.primary },
    stepBody: { flex: 1, gap: 3 },
    stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    stepEmoji: { fontSize: 16, flexShrink: 0 },
    stepTitle: { ...Typography.bodyMedium, color: Colors.text.primary, flex: 1 },
    stepDuration: { ...Typography.caption, color: Colors.text.tertiary },
    stepDesc: { ...Typography.small, color: Colors.text.secondary, lineHeight: 18 },
    stepProduct: { ...Typography.caption, color: Colors.gold.primary },
    textDimmed: { color: Colors.text.tertiary },

    // Save bar
    saveBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: Spacing.sm,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        paddingBottom: 30,
        backgroundColor: Colors.bg.primary,
        borderTopWidth: 1, borderTopColor: Colors.bg.tertiary,
    },
    regenerateBtn: {
        width: 52, height: 52, borderRadius: BorderRadius.md,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
        backgroundColor: Colors.bg.secondary,
    },
    saveBtn: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
    saveBtnGradient: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, paddingVertical: 14,
    },
    saveBtnText: { ...Typography.bodyMedium, color: Colors.bg.primary, fontWeight: '700' },
})
