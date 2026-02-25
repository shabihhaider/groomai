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

const HAIR_TEXTURE = [
    { value: 'straight', label: 'Straight', icon: '|' },
    { value: 'wavy', label: 'Wavy', icon: '∿' },
    { value: 'curly', label: 'Curly', icon: '∞' },
    { value: 'coily', label: 'Coily', icon: '⊛' },
]

const THICKNESS_OPTIONS = [
    { value: 'fine', label: 'Fine', desc: 'Can barely feel it between fingers' },
    { value: 'medium', label: 'Medium', desc: 'Average thickness' },
    { value: 'thick', label: 'Thick', desc: 'Coarse, very noticeable' },
]

const BEARD_OPTIONS = [
    { value: 'maintained', label: 'Yes, and I actively maintain it' },
    { value: 'unmaintained', label: "Yes, but I don't know how" },
    { value: 'none', label: 'No beard' },
]

const HAIR_CONCERN_OPTIONS = [
    'Thinning / hair loss',
    'Dandruff',
    'Dry / brittle',
    'Oily scalp',
    'None',
]

export default function Step4Hair() {
    const updateOnboarding = useUserStore((s) => s.updateOnboarding)
    const saveStep4 = useUserStore((s) => s.saveStep4)
    const stored = useUserStore((s) => s.onboarding)

    const [hairType, setHairType] = useState(stored.hairType)
    const [thickness, setThickness] = useState(stored.hairThickness)
    const [beard, setBeard] = useState('')
    const [hairConcerns, setHairConcerns] = useState<string[]>(stored.hairConcerns)
    const btnScale = useSharedValue(1)
    const btnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))

    function toggleConcern(concern: string) {
        if (concern === 'None') {
            setHairConcerns(['None'])
            return
        }
        setHairConcerns((prev) => {
            const filtered = prev.filter((c) => c !== 'None')
            return filtered.includes(concern) ? filtered.filter((c) => c !== concern) : [...filtered, concern]
        })
    }

    const canContinue = hairType && thickness && beard

    async function handleContinue() {
        if (!canContinue) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        updateOnboarding({
            hairType,
            hairThickness: thickness,
            hasBeard: beard !== 'none',
            hairConcerns: hairConcerns.filter((c) => c !== 'None'),
        })
        try {
            await saveStep4()
        } catch { /* non-blocking */ }
        router.push('/(onboarding)/step-5-goals')
    }

    return (
        <View style={styles.container}>
            <OnboardingProgress step={4} total={6} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Text style={styles.title}>Now, your hair.</Text>
                </Animated.View>

                {/* Hair texture — cards */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                    <Text style={styles.question}>What's your natural hair texture?</Text>
                    <View style={styles.cardRow}>
                        {HAIR_TEXTURE.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.card, hairType === opt.value && styles.cardActive]}
                                onPress={() => setHairType(opt.value)}
                            >
                                <Text style={styles.cardIcon}>{opt.icon}</Text>
                                <Text style={[styles.cardLabel, hairType === opt.value && styles.cardLabelActive]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>

                {/* Thickness */}
                {hairType ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>How thick is each strand?</Text>
                        {THICKNESS_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.option, thickness === opt.value && styles.optionActive]}
                                onPress={() => setThickness(opt.value)}
                            >
                                <View style={[styles.radio, thickness === opt.value && styles.radioActive]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.optionText, thickness === opt.value && styles.optionTextActive]}>
                                        {opt.label}
                                    </Text>
                                    <Text style={styles.optionDesc}>{opt.desc}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </Animated.View>
                ) : null}

                {/* Beard */}
                {thickness ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>Do you have a beard?</Text>
                        {BEARD_OPTIONS.map((opt) => (
                            <Pressable
                                key={opt.value}
                                style={[styles.option, beard === opt.value && styles.optionActive]}
                                onPress={() => setBeard(opt.value)}
                            >
                                <View style={[styles.radio, beard === opt.value && styles.radioActive]} />
                                <Text style={[styles.optionText, beard === opt.value && styles.optionTextActive]}>
                                    {opt.label}
                                </Text>
                            </Pressable>
                        ))}
                    </Animated.View>
                ) : null}

                {/* Hair concerns */}
                {beard ? (
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <Text style={styles.question}>Any hair concerns?</Text>
                        <Text style={styles.hint}>Select all that apply</Text>
                        {HAIR_CONCERN_OPTIONS.map((concern) => {
                            const selected = hairConcerns.includes(concern)
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
    title: { ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.lg },
    question: { ...Typography.h3, color: Colors.text.primary, marginTop: Spacing.lg, marginBottom: Spacing.md },
    hint: { ...Typography.small, color: Colors.text.tertiary, marginBottom: Spacing.sm },
    cardRow: { flexDirection: 'row', gap: 10 },
    card: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    cardActive: { borderColor: Colors.gold.primary, backgroundColor: Colors.overlay.gold },
    cardIcon: { fontSize: 28, color: Colors.text.secondary },
    cardLabel: { ...Typography.small, color: Colors.text.secondary },
    cardLabelActive: { color: Colors.gold.primary, fontWeight: '600' },
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
