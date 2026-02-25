import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { OnboardingProgress } from '@/components/onboarding/ProgressBar'
import { useUserStore } from '@/stores/user.store'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'

export default function Step1Basics() {
    const updateOnboarding = useUserStore((s) => s.updateOnboarding)
    const saveStep1 = useUserStore((s) => s.saveStep1)
    const storedName = useUserStore((s) => s.onboarding.fullName)
    const [name, setName] = useState(storedName)
    const btnScale = useSharedValue(1)
    const btnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }))

    async function handleContinue() {
        if (!name.trim()) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        updateOnboarding({ fullName: name.trim() })
        try {
            await saveStep1()
        } catch { /* non-blocking — profile saves will retry */ }
        router.push('/(onboarding)/step-2-face')
    }

    return (
        <View style={styles.container}>
            <OnboardingProgress step={1} total={6} />

            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Text style={styles.question}>What should we call you?</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                    <TextInput
                        style={styles.input}
                        placeholder="Your first name"
                        placeholderTextColor={Colors.text.tertiary}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={handleContinue}
                    />
                </Animated.View>

                {/* Live greeting */}
                {name.trim().length > 0 && (
                    <Animated.View entering={FadeIn.duration(400)}>
                        <Text style={styles.greeting}>
                            Nice to meet you, <Text style={styles.goldName}>{name.trim()}</Text> 👋
                        </Text>
                    </Animated.View>
                )}
            </View>

            <Animated.View style={btnAnimated}>
                <Pressable
                    style={[styles.continueBtn, !name.trim() && styles.btnDisabled]}
                    onPress={handleContinue}
                    onPressIn={() => { btnScale.value = withSpring(0.96, { damping: 15 }) }}
                    onPressOut={() => { btnScale.value = withSpring(1, { damping: 15 }) }}
                    disabled={!name.trim()}
                >
                    <Text style={styles.continueBtnText}>Continue →</Text>
                </Pressable>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary, paddingTop: 60 },
    content: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xxl },
    question: { ...Typography.h1, color: Colors.text.primary, marginBottom: Spacing.xl },
    input: {
        height: 60,
        backgroundColor: Colors.bg.input,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        paddingHorizontal: 20,
        fontSize: 20,
        color: Colors.text.primary,
        marginBottom: Spacing.lg,
    },
    greeting: {
        ...Typography.h3,
        color: Colors.text.secondary,
    },
    goldName: { color: Colors.gold.primary },
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
