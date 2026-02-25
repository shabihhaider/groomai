import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { OnboardingProgress } from '@/components/onboarding/ProgressBar'
import { useUserStore } from '@/stores/user.store'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'

const GOAL_OPTIONS = [
    'Clear, healthy skin',
    'Better hairstyle',
    'Beard growth & shaping',
    'Look more put-together',
    'Anti-aging',
    'Build a consistent routine',
]

const TIME_OPTIONS = [
    { value: '2min', label: '2 minutes', desc: 'Bare minimum' },
    { value: '5min', label: '5 minutes', desc: 'Quick & effective' },
    { value: '10min', label: '10 minutes', desc: 'Full routine' },
    { value: '15min+', label: '15+ minutes', desc: 'All-in' },
]

const BUDGET_OPTIONS = [
    { value: 'budget', label: 'Budget', desc: '$0–$30/month on products' },
    { value: 'midrange', label: 'Mid-range', desc: '$30–$80/month' },
    { value: 'premium', label: 'Premium', desc: '$80+/month' },
]

export default function Step5Goals() {
    const updateOnboarding = useUserStore((s) => s.updateOnboarding)
    const saveStep5 = useUserStore((s) => s.saveStep5)
    const stored = useUserStore((s) => s.onboarding)

    const [goals, setGoals] = useState<string[]>(stored.groomingGoals)
    const [time, setTime] = useState(stored.dailyTimeAvailable)
    const [budget, setBudget] = useState(stored.budgetRange)
    const btnScale = useSharedValue(1)
    const btnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))

    function toggleGoal(goal: string) {
        setGoals((prev) =>
            prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
        )
    }

    const canContinue = goals.length > 0 && time && budget

    async function handleContinue() {
        if (!canContinue) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        updateOnboarding({
            groomingGoals: goals,
            dailyTimeAvailable: time,
            budgetRange: budget,
        })
        try {
            await saveStep5()
        } catch { /* non-blocking */ }
        router.push('/(onboarding)/step-6-trial')
    }

    return (
        <View style={styles.container}>
            <OnboardingProgress step={5} total={6} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Goals — multi-select */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Text style={styles.title}>What do you want to achieve?</Text>
                    <Text style={styles.hint}>Select all that apply</Text>
                    {GOAL_OPTIONS.map((goal) => {
                        const selected = goals.includes(goal)
                        return (
                            <Pressable
                                key={goal}
                                style={[styles.option, selected && styles.optionActive]}
                                onPress={() => toggleGoal(goal)}
                            >
                                <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                                    {selected && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                                    {goal}
                                </Text>
                            </Pressable>
                        )
                    })}
                </Animated.View>

                {/* Time */}
                {goals.length > 0 ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>How much time can you spare daily?</Text>
                        {TIME_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.option, time === opt.value && styles.optionActive]}
                                onPress={() => setTime(opt.value)}
                            >
                                <View style={[styles.radio, time === opt.value && styles.radioActive]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.optionText, time === opt.value && styles.optionTextActive]}>
                                        {opt.label}
                                    </Text>
                                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </Animated.View>
                ) : null}

                {/* Budget */}
                {time ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>What's your grooming budget?</Text>
                        {BUDGET_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.option, budget === opt.value && styles.optionActive]}
                                onPress={() => setBudget(opt.value)}
                            >
                                <View style={[styles.radio, budget === opt.value && styles.radioActive]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.optionText, budget === opt.value && styles.optionTextActive]}>
                                        {opt.label}
                                    </Text>
                                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </Animated.View>
                ) : null}
            </ScrollView>

            <Animated.View style={btnAnimated}>
                <Pressable
                    style={[styles.continueBtn, !canContinue && styles.btnDisabled]}
                    onPress={handleContinue}
                    onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15 }) }}
                    onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }) }}
                    disabled={!canContinue}
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
    title: { ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.sm },
    hint: { ...Typography.small, color: Colors.text.tertiary, marginBottom: Spacing.md },
    question: { ...Typography.h3, color: Colors.text.primary, marginTop: Spacing.xl, marginBottom: Spacing.md },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 8,
        gap: 12,
    },
    optionActive: { borderColor: Colors.gold.primary, backgroundColor: Colors.overlay.gold },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.text.tertiary },
    radioActive: { borderColor: Colors.gold.primary, backgroundColor: Colors.gold.primary },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.text.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: { borderColor: Colors.gold.primary, backgroundColor: Colors.gold.primary },
    checkmark: { color: Colors.text.inverse, fontSize: 14, fontWeight: '700' },
    optionText: { ...Typography.body, color: Colors.text.secondary, flex: 1 },
    optionTextActive: { color: Colors.text.primary },
    optionDesc: { ...Typography.small, color: Colors.text.tertiary, marginTop: 2 },
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
