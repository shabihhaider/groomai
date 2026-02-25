import { useState } from 'react'
import {
    View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { router } from 'expo-router'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { supabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'

export default function SignUpScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null)
    const signUpBtnScale = useSharedValue(1)
    const signUpBtnAnimated = useAnimatedStyle(() => ({ transform: [{ scale: signUpBtnScale.value }] }))

    async function handleGoogleSignIn() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSocialLoading('google')
        try {
            await authService.signInWithGoogle()
        } catch (err: any) {
            Alert.alert('Google Sign-In', err.message || 'Something went wrong')
        } finally {
            setSocialLoading(null)
        }
    }

    async function handleAppleSignIn() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        setSocialLoading('apple')
        try {
            await authService.signInWithApple()
        } catch (err: any) {
            if (err.code === 'ERR_REQUEST_CANCELED') return
            Alert.alert('Apple Sign-In', err.message || 'Something went wrong')
        } finally {
            setSocialLoading(null)
        }
    }

    async function handleSignUp() {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please enter your email and password.')
            return
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.')
            return
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.')
            return
        }

        setLoading(true)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: 'groomai://auth/confirm',
                },
            })
            if (error) throw error
            // Auth state change listener in root layout handles navigation
        } catch (err: any) {
            Alert.alert('Sign Up Error', err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {/* Back button */}
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
                </Pressable>

                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Start your grooming journey</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.form}>
                    {/* Email */}
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor={Colors.text.tertiary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password (min 6 characters)"
                            placeholderTextColor={Colors.text.tertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={Colors.text.tertiary}
                            />
                        </Pressable>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colors.text.tertiary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm password"
                            placeholderTextColor={Colors.text.tertiary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />
                    </View>

                    {/* Sign Up button */}
                    <Animated.View style={signUpBtnAnimated}>
                        <Pressable
                            style={[styles.primaryBtn, loading && styles.btnDisabled]}
                            onPress={handleSignUp}
                            onPressIn={() => { signUpBtnScale.value = withSpring(0.96, { damping: 15 }) }}
                            onPressOut={() => { signUpBtnScale.value = withSpring(1, { damping: 15 }) }}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.text.inverse} />
                            ) : (
                                <Text style={styles.primaryBtnText}>Create Account</Text>
                            )}
                        </Pressable>
                    </Animated.View>
                </Animated.View>

                {/* Divider */}
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Social buttons */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.socialArea}>
                    {Platform.OS === 'ios' && (
                        <Pressable
                            style={[styles.socialBtn, { backgroundColor: '#FFFFFF' }]}
                            onPress={handleAppleSignIn}
                            disabled={socialLoading !== null || loading}
                        >
                            {socialLoading === 'apple' ? (
                                <ActivityIndicator color="#000000" />
                            ) : (
                                <>
                                    <Ionicons name="logo-apple" size={20} color="#000000" />
                                    <Text style={[styles.socialBtnText, { color: '#000000' }]}>Apple</Text>
                                </>
                            )}
                        </Pressable>
                    )}
                    <Pressable
                        style={[styles.socialBtn, { backgroundColor: '#FFFFFF' }]}
                        onPress={handleGoogleSignIn}
                        disabled={socialLoading !== null || loading}
                    >
                        {socialLoading === 'google' ? (
                            <ActivityIndicator color="#000000" />
                        ) : (
                            <>
                                <Ionicons name="logo-google" size={20} color="#000000" />
                                <Text style={[styles.socialBtnText, { color: '#000000' }]}>Google</Text>
                            </>
                        )}
                    </Pressable>
                </Animated.View>

                {/* Sign in link */}
                <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
                    <Text style={styles.switchLink}>
                        Already have an account? <Text style={styles.switchBold}>Sign In</Text>
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary },
    scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: 40 },
    backBtn: { marginBottom: Spacing.lg },
    title: { ...Typography.h1, color: Colors.text.primary, marginBottom: 4 },
    subtitle: { ...Typography.body, color: Colors.text.secondary, marginBottom: Spacing.xl },
    form: { gap: 14 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bg.input,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: { marginRight: 12 },
    input: {
        flex: 1,
        color: Colors.text.primary,
        fontSize: 16,
    },
    primaryBtn: {
        height: 56,
        backgroundColor: Colors.gold.primary,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    btnDisabled: { opacity: 0.6 },
    primaryBtnText: {
        color: Colors.text.inverse,
        fontSize: 16,
        fontWeight: '700',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.bg.tertiary },
    dividerText: { ...Typography.small, color: Colors.text.tertiary, marginHorizontal: 16 },
    socialArea: { flexDirection: 'row', gap: 12, marginBottom: Spacing.lg },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: BorderRadius.md,
        gap: 8,
    },
    socialBtnText: { fontSize: 15, fontWeight: '600' },
    switchLink: { ...Typography.small, color: Colors.text.secondary, textAlign: 'center' },
    switchBold: { color: Colors.gold.primary, fontWeight: '600' },
})
