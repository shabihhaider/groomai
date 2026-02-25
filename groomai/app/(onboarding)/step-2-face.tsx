import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { OnboardingProgress } from '@/components/onboarding/ProgressBar'
import { useUserStore } from '@/stores/user.store'
import { deriveFaceShapeFromQuiz, FACE_SHAPE_LABELS, type QuizAnswers } from '@/utils/faceShape'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'

const JAWLINE_OPTIONS = [
    { value: 'sharp' as const, label: 'Sharp and defined', icon: '◻️' },
    { value: 'narrow' as const, label: 'Narrow and pointed', icon: '💎' },
    { value: 'rounded' as const, label: 'Rounded', icon: '⭕' },
    { value: 'balanced' as const, label: 'Similar width top and bottom', icon: '⬭' },
]

const FOREHEAD_OPTIONS = [
    { value: 'forehead_wider' as const, label: 'Forehead is wider' },
    { value: 'same' as const, label: 'About the same width' },
    { value: 'jaw_wider' as const, label: 'Jawline is wider' },
]

const LENGTH_OPTIONS = [
    { value: 'short' as const, label: 'About as long as it is wide' },
    { value: 'long' as const, label: 'Noticeably longer than wide' },
    { value: 'medium' as const, label: 'Somewhere in between' },
]

export default function Step2Face() {
    const updateOnboarding = useUserStore((s) => s.updateOnboarding)
    const saveStep2 = useUserStore((s) => s.saveStep2)
    const [jawline, setJawline] = useState<QuizAnswers['jawline'] | ''>('')
    const [foreheadVsJaw, setForeheadVsJaw] = useState<QuizAnswers['foreheadVsJaw'] | ''>('')
    const [faceLength, setFaceLength] = useState<QuizAnswers['faceLength'] | ''>('')
    const btnScale = useSharedValue(1)
    const btnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))

    const allAnswered = jawline && foreheadVsJaw && faceLength
    const detectedShape = allAnswered
        ? deriveFaceShapeFromQuiz({ jawline, foreheadVsJaw, faceLength })
        : null

    async function handleContinue() {
        if (!detectedShape) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        updateOnboarding({ faceShape: detectedShape, faceShapeMethod: 'quiz' })
        try {
            await saveStep2()
        } catch { /* non-blocking */ }
        router.push('/(onboarding)/step-3-skin')
    }

    return (
        <View style={styles.container}>
            <OnboardingProgress step={2} total={6} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Text style={styles.title}>Let's find your face shape.</Text>
                </Animated.View>

                {/* Q1: Jawline */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                    <Text style={styles.question}>What best describes your jawline?</Text>
                    {JAWLINE_OPTIONS.map((opt) => (
                        <Pressable
                            key={opt.value}
                            style={[styles.option, jawline === opt.value && styles.optionActive]}
                            onPress={() => setJawline(opt.value)}
                        >
                            <View style={[styles.radio, jawline === opt.value && styles.radioActive]} />
                            <Text style={[styles.optionText, jawline === opt.value && styles.optionTextActive]}>
                                {opt.label}
                            </Text>
                        </Pressable>
                    ))}
                </Animated.View>

                {/* Q2: Forehead vs Jaw */}
                {jawline ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>How does your forehead compare to your jawline?</Text>
                        {FOREHEAD_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.option, foreheadVsJaw === opt.value && styles.optionActive]}
                                onPress={() => setForeheadVsJaw(opt.value)}
                            >
                                <View style={[styles.radio, foreheadVsJaw === opt.value && styles.radioActive]} />
                                <Text style={[styles.optionText, foreheadVsJaw === opt.value && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </Animated.View>
                ) : null}

                {/* Q3: Face Length */}
                {foreheadVsJaw ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>How long is your face?</Text>
                        {LENGTH_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.option, faceLength === opt.value && styles.optionActive]}
                                onPress={() => setFaceLength(opt.value)}
                            >
                                <View style={[styles.radio, faceLength === opt.value && styles.radioActive]} />
                                <Text style={[styles.optionText, faceLength === opt.value && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </Animated.View>
                ) : null}

                {/* Result */}
                {detectedShape && (
                    <Animated.View entering={FadeIn.duration(500)} style={styles.resultCard}>
                        <Text style={styles.resultLabel}>Your face shape:</Text>
                        <Text style={styles.resultShape}>{FACE_SHAPE_LABELS[detectedShape] || detectedShape}</Text>
                    </Animated.View>
                )}
            </ScrollView>

            <Animated.View style={btnAnimated}>
                <Pressable
                    style={[styles.continueBtn, !allAnswered && styles.btnDisabled]}
                    onPress={handleContinue}
                    onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15 }) }}
                    onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }) }}
                    disabled={!allAnswered}
                >
                    <Text style={styles.continueBtnText}>Continue →</Text>
                </Pressable>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary, paddingTop: 60 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: 40 },
    title: { ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.xl },
    question: { ...Typography.h3, color: Colors.text.primary, marginTop: Spacing.lg, marginBottom: Spacing.md },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        gap: 12,
    },
    optionActive: {
        borderColor: Colors.gold.primary,
        backgroundColor: Colors.overlay.gold,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.text.tertiary,
    },
    radioActive: {
        borderColor: Colors.gold.primary,
        backgroundColor: Colors.gold.primary,
    },
    optionText: { ...Typography.body, color: Colors.text.secondary, flex: 1 },
    optionTextActive: { color: Colors.text.primary },
    resultCard: {
        backgroundColor: Colors.overlay.gold,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
        padding: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    resultLabel: { ...Typography.small, color: Colors.text.secondary, marginBottom: 4 },
    resultShape: { ...Typography.h2, color: Colors.gold.primary },
    continueBtn: {
        height: 56,
        backgroundColor: Colors.gold.primary,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: Spacing.lg,
        marginBottom: 40,
    },
    btnDisabled: { opacity: 0.3 },
    continueBtnText: { color: Colors.text.inverse, fontSize: 17, fontWeight: '700' },
})
