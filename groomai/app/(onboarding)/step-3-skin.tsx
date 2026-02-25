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

const SKIN_TYPE_OPTIONS = [
    { value: 'oily', label: 'Shiny all over', desc: 'Oily' },
    { value: 'dry', label: 'Tight or flaky', desc: 'Dry' },
    { value: 'combination', label: 'Shiny in T-zone, tight elsewhere', desc: 'Combination' },
    { value: 'normal', label: 'Generally comfortable', desc: 'Normal' },
    { value: 'sensitive', label: 'Easily irritated or red', desc: 'Sensitive' },
]

const CONCERN_OPTIONS = [
    'Acne / breakouts',
    'Dark spots / hyperpigmentation',
    'Anti-aging / wrinkles',
    'Dullness',
    'Redness / irritation',
    'Large pores',
]

export default function Step3Skin() {
    const updateOnboarding = useUserStore((s) => s.updateOnboarding)
    const saveStep3 = useUserStore((s) => s.saveStep3)
    const stored = useUserStore((s) => s.onboarding)
    const [skinType, setSkinType] = useState(stored.skinType)
    const [concerns, setConcerns] = useState<string[]>(stored.skinConcerns)
    const btnScale = useSharedValue(1)
    const btnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))

    function toggleConcern(concern: string) {
        setConcerns((prev) =>
            prev.includes(concern) ? prev.filter((c) => c !== concern) : [...prev, concern]
        )
    }

    async function handleContinue() {
        if (!skinType) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        updateOnboarding({ skinType, skinConcerns: concerns })
        try {
            await saveStep3()
        } catch { /* non-blocking */ }
        router.push('/(onboarding)/step-4-hair')
    }

    return (
        <View style={styles.container}>
            <OnboardingProgress step={3} total={6} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Text style={styles.title}>Tell us about your skin.</Text>
                </Animated.View>

                {/* Skin type */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                    <Text style={styles.question}>By midday, your skin usually feels...</Text>
                    {SKIN_TYPE_OPTIONS.map((opt) => (
                        <Pressable
                            key={opt.value}
                            style={[styles.option, skinType === opt.value && styles.optionActive]}
                            onPress={() => setSkinType(opt.value)}
                        >
                            <View style={[styles.radio, skinType === opt.value && styles.radioActive]} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.optionText, skinType === opt.value && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                                <Text style={styles.optionDesc}>{opt.desc}</Text>
                            </View>
                        </Pressable>
                    ))}
                </Animated.View>

                {/* Concerns — multi-select */}
                {skinType ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>What are your main skin concerns?</Text>
                        <Text style={styles.hint}>Select all that apply</Text>
                        {CONCERN_OPTIONS.map((concern) => {
                            const selected = concerns.includes(concern)
                            return (
                                <Pressable
                                    key={concern}
                                    style={[styles.option, selected && styles.optionActive]}
                                    onPress={() => toggleConcern(concern)}
                                >
                                    <View style={[styles.checkbox, selected && styles.checkboxActive]}>
                                        {selected && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                                        {concern}
                                    </Text>
                                </Pressable>
                            )
                        })}
                    </Animated.View>
                ) : null}
            </ScrollView>

            <Animated.View style={btnAnimated}>
                <Pressable
                    style={[styles.continueBtn, !skinType && styles.btnDisabled]}
                    onPress={handleContinue}
                    onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15 }) }}
                    onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }) }}
                    disabled={!skinType}
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
    title: { ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.lg },
    question: { ...Typography.h3, color: Colors.text.primary, marginTop: Spacing.lg, marginBottom: Spacing.md },
    hint: { ...Typography.small, color: Colors.text.tertiary, marginBottom: Spacing.sm },
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
