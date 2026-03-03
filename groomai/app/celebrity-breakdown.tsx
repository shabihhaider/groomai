// app/celebrity-breakdown.tsx
// Phase 6 — Premium: upload a celebrity photo, get a full barber script via GPT-4o

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
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useAnalyzeHairstyle } from '@/hooks/useBarber'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'
import { BarberCardModal } from '@/components/barber/BarberCardModal'
import { useSubscriptionStore } from '@/stores/subscription.store'

interface AnalysisResult {
    style_name: string
    description: string
    barber_script: string
    guard_numbers: Record<string, string>
    styling_product: string
    maintenance: string
}

export default function CelebrityBreakdownScreen() {
    const isPremium = useSubscriptionStore((s) => s.isPremium)
    const analyze = useAnalyzeHairstyle()
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [showCard, setShowCard] = useState(false)
    const [analysisError, setAnalysisError] = useState<string | null>(null)

    if (!isPremium) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnimatedScreen>
                    <View style={styles.headerBar}>
                        <Pressable style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                        </Pressable>
                        <View style={styles.proPill}>
                            <Ionicons name="diamond" size={12} color={Colors.gold.primary} />
                            <Text style={styles.proPillText}>PRO</Text>
                        </View>
                    </View>

                    <View style={styles.premiumGate}>
                        <Text style={styles.premiumTitle}>Premium Feature</Text>
                        <Text style={styles.premiumSubtitle}>
                            Celebrity Breakdown is available on Premium.
                        </Text>
                        <Pressable style={styles.upgradeBtn} onPress={() => router.push('/paywall')}>
                            <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
                        </Pressable>
                    </View>
                </AnimatedScreen>
            </SafeAreaView>
        )
    }

    async function pickImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow access to your photo library to use this feature.')
            return
        }

        const picked = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            base64: true,
        })

        if (picked.canceled || !picked.assets?.[0]) return
        const asset = picked.assets[0]

        if (!asset.base64) {
            Alert.alert('Error', 'Could not read image. Please try another photo.')
            return
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setResult(null)
        setAnalysisError(null)

        analyze.mutate(asset.base64, {
            onSuccess: (data) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setResult(data)
                setAnalysisError(null)
            },
            onError: (err: any) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                if (err?.code === 'rate_limit_exceeded') {
                    setAnalysisError(err.message)
                } else if (err?.code === 'ai_unavailable') {
                    setAnalysisError('AI is temporarily unavailable right now. Please try again in a few minutes.')
                } else {
                    setAnalysisError('Could not analyze this photo. Make sure it clearly shows a hairstyle from the front or 45° angle.')
                }
            },
        })
    }

    async function takePhoto() {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Camera access required', 'Please allow camera access to take a photo.')
            return
        }

        const picked = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            base64: true,
        })

        if (picked.canceled || !picked.assets?.[0]?.base64) return
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setResult(null)

        setAnalysisError(null)
        analyze.mutate(picked.assets[0].base64, {
            onSuccess: (data) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                setResult(data)
                setAnalysisError(null)
            },
            onError: (err: any) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                if (err?.code === 'rate_limit_exceeded') {
                    setAnalysisError(err.message)
                } else if (err?.code === 'ai_unavailable') {
                    setAnalysisError('AI is temporarily unavailable right now. Please try again in a few minutes.')
                } else {
                    setAnalysisError('Could not analyze this photo. Try another shot with better lighting and a clear view of the hairstyle.')
                }
            },
        })
    }

    // Build a synthetic hairstyle object for the BarberCardModal
    const syntheticHairstyle = result ? {
        id: 'ai-result',
        name: result.style_name,
        slug: 'ai-result',
        category: 'short' as const,
        faceShapes: [],
        hairTypes: [],
        description: result.description,
        barberScript: result.barber_script,
        guardNumbers: result.guard_numbers ?? {},
        stylingInstructions: result.styling_product ? `Product: ${result.styling_product}` : undefined,
        maintenanceFrequency: result.maintenance,
        isPremium: true,
        isTrending: false,
    } : null

    return (
        <>
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnimatedScreen>
                    {/* Header */}
                    <View style={styles.headerBar}>
                        <Pressable style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                        </Pressable>
                        <View style={styles.proPill}>
                            <Ionicons name="diamond" size={12} color={Colors.gold.primary} />
                            <Text style={styles.proPillText}>PRO</Text>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                        <LinearGradient
                            colors={['rgba(201,168,76,0.10)', 'transparent']}
                            style={styles.heroGradient}
                        >
                            <Animated.View entering={FadeInDown.duration(350)}>
                                <Text style={styles.title}>Celebrity Breakdown</Text>
                                <Text style={styles.subtitle}>
                                    Upload any photo of a hairstyle. AI will identify the cut and give you the exact barber script.
                                </Text>
                            </Animated.View>
                        </LinearGradient>

                        {/* Action buttons */}
                        <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.photoActions}>
                            <Pressable style={styles.photoBtn} onPress={pickImage} disabled={analyze.isPending}>
                                <View style={styles.photoBtnIcon}>
                                    <Ionicons name="images" size={28} color={Colors.gold.primary} />
                                </View>
                                <Text style={styles.photoBtnLabel}>Choose from Library</Text>
                                <Text style={styles.photoBtnSub}>Celebrity, influencer, or any photo</Text>
                            </Pressable>

                            <Pressable style={styles.photoBtn} onPress={takePhoto} disabled={analyze.isPending}>
                                <View style={styles.photoBtnIcon}>
                                    <Ionicons name="camera" size={28} color={Colors.gold.primary} />
                                </View>
                                <Text style={styles.photoBtnLabel}>Take a Photo</Text>
                                <Text style={styles.photoBtnSub}>Point at a magazine or screen</Text>
                            </Pressable>
                        </Animated.View>

                        {/* Loading state */}
                        {analyze.isPending && (
                            <Animated.View entering={FadeInDown.duration(300)} style={styles.loadingCard}>
                                <ActivityIndicator size="large" color={Colors.gold.primary} />
                                <Text style={styles.loadingTitle}>Analyzing hairstyle...</Text>
                                <Text style={styles.loadingSubtitle}>GPT-4o is reading the cut, reading the guard numbers, and writing your barber script.</Text>
                            </Animated.View>
                        )}

                        {/* Analysis Error — branded in-app error state */}
                        {analysisError && !analyze.isPending && (
                            <Animated.View entering={FadeInDown.duration(300)} style={styles.errorCard}>
                                <Ionicons name="alert-circle" size={36} color={Colors.error} />
                                <Text style={styles.errorTitle}>Analysis Failed</Text>
                                <Text style={styles.errorMessage}>{analysisError}</Text>
                                <View style={styles.errorActions}>
                                    <Pressable style={styles.retryBtn} onPress={() => { setAnalysisError(null); pickImage() }}>
                                        <Ionicons name="images" size={16} color={Colors.bg.primary} />
                                        <Text style={styles.retryBtnText}>Try Another Photo</Text>
                                    </Pressable>
                                    <Pressable style={styles.retryCameraBtn} onPress={() => { setAnalysisError(null); takePhoto() }}>
                                        <Ionicons name="camera" size={16} color={Colors.gold.primary} />
                                        <Text style={styles.retryCameraBtnText}>Take Photo</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.errorTips}>
                                    <Text style={styles.errorTipsTitle}>For best results:</Text>
                                    {['Clear, well-lit front or 45° angle photo', 'Avoid hats, hoods, or blurry images', 'Celebrity, influencer, or magazine photos work best'].map((tip, i) => (
                                        <View key={i} style={styles.errorTipRow}>
                                            <Ionicons name="checkmark" size={12} color={Colors.gold.primary} />
                                            <Text style={styles.errorTipText}>{tip}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>
                        )}

                        {/* Result */}
                        {result && !analyze.isPending && (
                            <Animated.View entering={FadeInUp.duration(400)} style={styles.resultSection}>
                                <View style={styles.resultHeader}>
                                    <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                                    <Text style={styles.resultHeaderText}>Analysis Complete</Text>
                                </View>

                                <Text style={styles.resultStyleName}>{result.style_name}</Text>
                                {result.description && (
                                    <Text style={styles.resultDescription}>{result.description}</Text>
                                )}

                                <View style={styles.resultDivider} />

                                {/* Barber Script */}
                                <Text style={styles.resultSectionLabel}>💬 What to say:</Text>
                                <View style={styles.scriptCard}>
                                    <Text style={styles.scriptText}>{result.barber_script}</Text>
                                </View>

                                {/* Guard Numbers */}
                                {result.guard_numbers && Object.keys(result.guard_numbers).length > 0 && (
                                    <>
                                        <Text style={[styles.resultSectionLabel, { marginTop: Spacing.md }]}>🔢 Guard Numbers:</Text>
                                        {Object.entries(result.guard_numbers).map(([k, v]) => (
                                            <View key={k} style={styles.guardRow}>
                                                <Text style={styles.guardKey}>{k.replace(/_/g, ' ')}</Text>
                                                <Text style={styles.guardValue}>{v}</Text>
                                            </View>
                                        ))}
                                    </>
                                )}

                                {result.maintenance && (
                                    <Text style={styles.maintenanceText}>🗓 {result.maintenance}</Text>
                                )}

                                {/* Generate card CTA */}
                                <Pressable
                                    style={styles.generateBtn}
                                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowCard(true) }}
                                >
                                    <LinearGradient
                                        colors={[Colors.gold.primary, Colors.gold.muted]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.generateBtnGradient}
                                    >
                                        <Ionicons name="card" size={18} color={Colors.bg.primary} />
                                        <Text style={styles.generateBtnText}>Generate Barber Card</Text>
                                    </LinearGradient>
                                </Pressable>

                                {/* Try another */}
                                <Pressable style={styles.tryAgainBtn} onPress={pickImage}>
                                    <Text style={styles.tryAgainText}>📷 Analyze another photo</Text>
                                </Pressable>
                            </Animated.View>
                        )}

                        {/* Tips */}
                        {!result && !analyze.isPending && (
                            <Animated.View entering={FadeInDown.delay(150).duration(350)} style={styles.tipsCard}>
                                <Text style={styles.tipsTitle}>Tips for best results</Text>
                                {[
                                    'Use a clear photo — front or 45° angle',
                                    'Celebrity photos, magazine cuts, or social media all work',
                                    'Avoid blurry, dark, or rear-facing photos',
                                    'Hats or hoods will confuse the AI',
                                ].map((tip, i) => (
                                    <View key={i} style={styles.tip}>
                                        <Ionicons name="checkmark" size={14} color={Colors.gold.primary} />
                                        <Text style={styles.tipText}>{tip}</Text>
                                    </View>
                                ))}
                            </Animated.View>
                        )}
                    </ScrollView>
                </AnimatedScreen>
            </SafeAreaView>

            {showCard && syntheticHairstyle && (
                <BarberCardModal
                    hairstyle={syntheticHairstyle}
                    onClose={() => setShowCard(false)}
                />
            )}
        </>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary },
    scroll: { paddingBottom: 60 },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.bg.secondary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    proPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.overlay.gold,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: BorderRadius.full,
        borderWidth: 1, borderColor: Colors.gold.muted,
    },
    proPillText: { ...Typography.caption, color: Colors.gold.primary, fontWeight: '700' },
    heroGradient: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    title: { ...Typography.h1, color: Colors.text.primary },
    subtitle: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22, marginTop: 4 },
    photoActions: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
    photoBtn: {
        flex: 1,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        gap: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    photoBtnIcon: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: Colors.overlay.gold,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    photoBtnLabel: { ...Typography.bodyMedium, color: Colors.text.primary, textAlign: 'center' },
    photoBtnSub: { ...Typography.caption, color: Colors.text.tertiary, textAlign: 'center' },
    loadingCard: {
        marginHorizontal: Spacing.lg,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    loadingTitle: { ...Typography.h3, color: Colors.text.primary },
    loadingSubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', lineHeight: 20 },
    resultSection: { paddingHorizontal: Spacing.lg },
    resultHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
    resultHeaderText: { ...Typography.bodyMedium, color: Colors.success, fontWeight: '700' },
    resultStyleName: { ...Typography.h2, color: Colors.text.primary, marginBottom: 4 },
    resultDescription: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22, marginBottom: Spacing.sm },
    resultDivider: { height: 1, backgroundColor: Colors.bg.tertiary, marginVertical: Spacing.md },
    resultSectionLabel: { ...Typography.label, color: Colors.text.secondary, marginBottom: Spacing.xs },
    scriptCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
        borderLeftWidth: 3,
        borderLeftColor: Colors.gold.primary,
    },
    scriptText: { ...Typography.body, color: Colors.text.primary, lineHeight: 24, fontStyle: 'italic' },
    guardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    guardKey: { ...Typography.small, color: Colors.text.secondary },
    guardValue: { ...Typography.small, color: Colors.text.primary, fontWeight: '700' },
    maintenanceText: { ...Typography.body, color: Colors.text.secondary, marginTop: Spacing.sm },
    generateBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.lg },
    generateBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, paddingVertical: 16,
    },
    generateBtnText: { ...Typography.h3, color: Colors.bg.primary, fontWeight: '800' },
    tryAgainBtn: { alignItems: 'center', paddingVertical: Spacing.md, marginTop: Spacing.xs },
    tryAgainText: { ...Typography.body, color: Colors.gold.primary },
    tipsCard: {
        marginHorizontal: Spacing.lg,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        gap: Spacing.sm,
    },
    tipsTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.xs },
    tip: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs },
    tipText: { ...Typography.body, color: Colors.text.secondary, flex: 1, lineHeight: 20 },
    // Error card styles
    errorCard: {
        marginHorizontal: Spacing.lg,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        alignItems: 'center',
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.error + '40',
    },
    errorTitle: { ...Typography.h3, color: Colors.text.primary, fontWeight: '700' },
    errorMessage: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
    errorActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, width: '100%' },
    retryBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, backgroundColor: Colors.gold.primary, borderRadius: BorderRadius.md, paddingVertical: 12,
    },
    retryBtnText: { ...Typography.bodyMedium, color: Colors.bg.primary, fontWeight: '700' },
    retryCameraBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, borderRadius: BorderRadius.md, paddingVertical: 12,
        borderWidth: 1, borderColor: Colors.gold.muted, backgroundColor: Colors.overlay.gold,
    },
    retryCameraBtnText: { ...Typography.bodyMedium, color: Colors.gold.primary, fontWeight: '700' },
    errorTips: { width: '100%', marginTop: Spacing.sm, gap: 6 },
    errorTipsTitle: { ...Typography.small, color: Colors.text.secondary, fontWeight: '600', marginBottom: 2 },
    errorTipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    errorTipText: { ...Typography.caption, color: Colors.text.tertiary },

    premiumGate: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
    premiumTitle: { ...Typography.h2, color: Colors.text.primary, textAlign: 'center' },
    premiumSubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
    upgradeBtn: {
        backgroundColor: Colors.gold.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: 14,
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.sm,
    },
    upgradeBtnText: { ...Typography.bodyMedium, color: Colors.bg.primary, fontWeight: '800' },
})
