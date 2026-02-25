import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { authService } from '@/services/auth.service'

export default function WelcomeScreen() {
    const [loading, setLoading] = useState<'google' | 'apple' | null>(null)
    const appleBtnScale = useSharedValue(1)
    const appleBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: appleBtnScale.value }] }))
    const googleBtnScale = useSharedValue(1)
    const googleBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: googleBtnScale.value }] }))
    const emailBtnScale = useSharedValue(1)
    const emailBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: emailBtnScale.value }] }))

    async function handleGoogleSignIn() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setLoading('google')
        try {
            await authService.signInWithGoogle()
        } catch (err: any) {
            Alert.alert('Google Sign-In', err.message || 'Something went wrong')
        } finally {
            setLoading(null)
        }
    }

    async function handleAppleSignIn() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setLoading('apple')
        try {
            await authService.signInWithApple()
        } catch (err: any) {
            if (err.code === 'ERR_REQUEST_CANCELED') return
            Alert.alert('Apple Sign-In', err.message || 'Something went wrong')
        } finally {
            setLoading(null)
        }
    }

    return (
        <AnimatedScreen>
        <View style={styles.container}>
            {/* Logo area */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.logoArea}>
                <View style={styles.logoCircle}>
                    <Ionicons name="diamond" size={48} color={Colors.gold.primary} />
                </View>
                <Text style={styles.appName}>GroomAI</Text>
            </Animated.View>

            {/* Headline */}
            <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.headlineArea}>
                <Text style={styles.headline}>Your Daily Edge.</Text>
                <Text style={styles.subtext}>Personalized grooming.{'\n'}Built for you.</Text>
            </Animated.View>

            {/* Auth buttons */}
            <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.buttonArea}>
                {/* Apple — iOS only */}
                {Platform.OS === 'ios' && (
                    <Animated.View style={appleBtnAnimated}>
                    <Pressable
                        style={[styles.button, styles.appleBtn]}
                        onPress={handleAppleSignIn}
                        onPressIn={() => { appleBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                        onPressOut={() => { appleBtnScale.value = withSpring(1, { damping: 15 }) }}
                        disabled={loading !== null}
                    >
                        {loading === 'apple' ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Continue with Apple</Text>
                            </>
                        )}
                    </Pressable>
                    </Animated.View>
                )}

                {/* Google */}
                <Animated.View style={googleBtnAnimated}>
                <Pressable
                    style={[styles.button, styles.googleBtn]}
                    onPress={handleGoogleSignIn}
                    onPressIn={() => { googleBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                    onPressOut={() => { googleBtnScale.value = withSpring(1, { damping: 15 }) }}
                    disabled={loading !== null}
                >
                    {loading === 'google' ? (
                        <ActivityIndicator color="#0A0A0A" />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={20} color="#0A0A0A" />
                            <Text style={[styles.buttonText, { color: '#0A0A0A' }]}>Continue with Google</Text>
                        </>
                    )}
                </Pressable>
                </Animated.View>

                {/* Email */}
                <Animated.View style={emailBtnAnimated}>
                <Pressable
                    style={[styles.button, styles.emailBtn]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(auth)/sign-up') }}
                    onPressIn={() => { emailBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                    onPressOut={() => { emailBtnScale.value = withSpring(1, { damping: 15 }) }}
                >
                    <Ionicons name="mail-outline" size={20} color={Colors.gold.primary} />
                    <Text style={[styles.buttonText, { color: Colors.gold.primary }]}>
                        Continue with Email
                    </Text>
                </Pressable>
                </Animated.View>
            </Animated.View>

            {/* Sign in link */}
            <Animated.View entering={FadeInDown.delay(800).duration(600)}>
                <Pressable onPress={() => router.push('/(auth)/sign-in')}>
                    <Text style={styles.signInLink}>
                        Already have an account? <Text style={styles.signInBold}>Sign In</Text>
                    </Text>
                </Pressable>
            </Animated.View>
        </View>
        </AnimatedScreen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    logoArea: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.overlay.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    appName: {
        ...Typography.h2,
        color: Colors.gold.primary,
        letterSpacing: 2,
    },
    headlineArea: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    headline: {
        ...Typography.display,
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtext: {
        ...Typography.body,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonArea: {
        width: '100%',
        gap: 12,
        marginBottom: Spacing.lg,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: BorderRadius.md,
        gap: 10,
    },
    appleBtn: {
        backgroundColor: '#FFFFFF',
    },
    googleBtn: {
        backgroundColor: '#FFFFFF',
    },
    emailBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    signInLink: {
        ...Typography.small,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    signInBold: {
        color: Colors.gold.primary,
        fontWeight: '600',
    },
})
