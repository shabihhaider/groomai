// app/skin-analysis.tsx
// Phase 7 — AI Skin Analysis: camera capture → Edge Function → results display

import { useState, useRef } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Ellipse } from 'react-native-svg'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useSkinAnalysis } from '@/hooks/useAI'
import { type SkinAnalysisResult } from '@/services/skin.service'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'

// ── Sub-screens ────────────────────────────────────────────────────────────

function PermissionScreen({ onRequest }: { onRequest: () => void }) {
    return (
        <View style={styles.centered}>
            <Ionicons name="camera" size={56} color={Colors.gold.primary} />
            <Text style={styles.permTitle}>Camera Access Needed</Text>
            <Text style={styles.permSubtext}>
                We need your camera to analyze your skin. Your photo is processed privately and never shared.
            </Text>
            <Pressable style={styles.allowBtn} onPress={onRequest}>
                <Text style={styles.allowBtnText}>Allow Camera</Text>
            </Pressable>
        </View>
    )
}

function AnalyzingScreen() {
    const steps = ['Analyzing skin texture...', 'Detecting concerns...', 'Building your report...']
    return (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.analyzingScreen}>
            <ActivityIndicator size="large" color={Colors.gold.primary} />
            <Text style={styles.analyzingTitle}>Analyzing your skin</Text>
            {steps.map((step, i) => (
                <Animated.Text
                    key={step}
                    entering={FadeInDown.delay(i * 600).duration(400)}
                    style={styles.analyzingStep}
                >
                    {step}
                </Animated.Text>
            ))}
        </Animated.View>
    )
}

function ScoreBar({ label, score, max = 10, color }: { label: string; score: number; max?: number; color: string }) {
    const pct = Math.min(score / max, 1)
    return (
        <View style={styles.scoreBarRow}>
            <Text style={styles.scoreBarLabel}>{label}</Text>
            <View style={styles.scoreBarTrack}>
                <View style={[styles.scoreBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.scoreBarValue, { color }]}>{score}</Text>
        </View>
    )
}

const SEVERITY_COLOR: Record<string, string> = {
    mild: Colors.gold.primary,
    moderate: '#FF9500',
    significant: '#FF3B30',
}

function ResultsScreen({ result, onReset }: { result: SkinAnalysisResult; onReset: () => void }) {
    const scoreColor = result.overallScore >= 70 ? '#34C759' : result.overallScore >= 40 ? '#FF9500' : '#FF3B30'
    const recIcons: Record<string, string> = { product: '🧴', habit: '💡', ingredient: '🔬' }

    return (
        <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient colors={['rgba(201,168,76,0.10)', 'transparent']} style={styles.resultsHero}>
                <Text style={styles.resultsTitle}>Your Skin Report</Text>
                <Text style={styles.resultsDate}>Analyzed {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
            </LinearGradient>

            {/* Overall Score */}
            <Animated.View entering={FadeInDown.duration(350)} style={styles.scoreCard}>
                <View style={styles.scoreRow}>
                    <View>
                        <Text style={styles.skinTypeLabel}>Skin Type</Text>
                        <Text style={styles.skinTypeValue}>{result.skinType.charAt(0).toUpperCase() + result.skinType.slice(1)}</Text>
                    </View>
                    <View style={styles.scoreCircle}>
                        <Text style={[styles.scoreNumber, { color: scoreColor }]}>{result.overallScore}</Text>
                        <Text style={styles.scoreMax}>/100</Text>
                    </View>
                </View>
                <View style={styles.scoreTrack}>
                    <View style={[styles.scoreTrackFill, { width: `${result.overallScore}%`, backgroundColor: scoreColor }]} />
                </View>
                <Text style={styles.summaryText}>{result.summary}</Text>
            </Animated.View>

            {/* Medical Disclaimer — REQUIRED */}
            <Animated.View entering={FadeInDown.delay(60).duration(350)} style={styles.disclaimerBar}>
                <Ionicons name="information-circle" size={14} color={Colors.text.tertiary} />
                <Text style={styles.disclaimerText}>
                    This analysis is for guidance only — not a medical diagnosis.
                </Text>
            </Animated.View>

            {/* Concerns */}
            {result.concerns.length > 0 && (
                <Animated.View entering={FadeInDown.delay(100).duration(350)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Detected Concerns</Text>
                    {result.concerns.map((c, i) => (
                        <View key={i} style={styles.concernCard}>
                            <View style={styles.concernHeader}>
                                <Text style={styles.concernName}>{c.name}</Text>
                                <View style={[styles.severityBadge, { backgroundColor: SEVERITY_COLOR[c.severity] + '22', borderColor: SEVERITY_COLOR[c.severity] }]}>
                                    <Text style={[styles.severityText, { color: SEVERITY_COLOR[c.severity] }]}>{c.severity}</Text>
                                </View>
                            </View>
                            <ScoreBar label="" score={c.score} color={SEVERITY_COLOR[c.severity]} />
                            {c.tip && <Text style={styles.concernTip}>💡 {c.tip}</Text>}
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
                <Animated.View entering={FadeInDown.delay(150).duration(350)} style={styles.section}>
                    <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
                    {result.recommendations.map((r, i) => (
                        <View key={i} style={styles.recCard}>
                            <Text style={styles.recEmoji}>{recIcons[r.type] ?? '✅'}</Text>
                            <View style={styles.recBody}>
                                <Text style={styles.recTitle}>{r.title}</Text>
                                <Text style={styles.recDesc}>{r.description}</Text>
                            </View>
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* Retry */}
            <Pressable style={styles.retakeBtn} onPress={onReset}>
                <Ionicons name="camera" size={18} color={Colors.gold.primary} />
                <Text style={styles.retakeBtnText}>Analyze Again</Text>
            </Pressable>
        </ScrollView>
    )
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function SkinAnalysisScreen() {
    const [permission, requestPermission] = useCameraPermissions()
    const [photo, setPhoto] = useState<string | null>(null)
    const [result, setResult] = useState<SkinAnalysisResult | null>(null)
    const cameraRef = useRef<CameraView>(null)
    const analyze = useSkinAnalysis()

    if (!permission) {
        return <SafeAreaView style={styles.container}><ActivityIndicator color={Colors.gold.primary} /></SafeAreaView>
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                </Pressable>
                <PermissionScreen onRequest={requestPermission} />
            </SafeAreaView>
        )
    }

    async function takePhoto() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        const shot = await cameraRef.current?.takePictureAsync({ quality: 0.85, base64: true, exif: false, skipProcessing: false })
        if (shot?.base64) setPhoto(shot.base64)
    }

    async function analyzePhoto() {
        if (!photo) return
        analyze.mutate(photo, {
            onSuccess: (data) => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                if (data?.error === 'low_quality') {
                    Alert.alert('Retake Photo', data.summary || 'Image quality was too low. Please take another photo in better lighting.')
                    setPhoto(null)
                    return
                }
                setResult(data)
            },
            onError: (err: any) => {
                if (err?.code === 'rate_limit_exceeded') {
                    Alert.alert('Daily Limit Reached', err.message)
                } else if (err?.code === 'ai_unavailable') {
                    Alert.alert('AI Temporarily Unavailable', 'Please try again in a few minutes.')
                } else {
                    Alert.alert('Analysis Failed', 'Please take another photo in better lighting.')
                }
                setPhoto(null)
            },
        })
    }

    if (analyze.isPending) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnalyzingScreen />
            </SafeAreaView>
        )
    }

    if (result) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnimatedScreen>
                    <View style={styles.headerBar}>
                        <Pressable style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                        </Pressable>
                    </View>
                    <ResultsScreen result={result} onReset={() => { setResult(null); setPhoto(null) }} />
                </AnimatedScreen>
            </SafeAreaView>
        )
    }

    if (photo) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Image source={{ uri: `data:image/jpeg;base64,${photo}` }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                <View style={styles.previewOverlay}>
                    <Text style={styles.previewPrivacyNote}>📵 This photo is analyzed privately and never stored in plain view</Text>
                    <View style={styles.previewActions}>
                        <Pressable style={styles.retakeButton} onPress={() => setPhoto(null)}>
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={styles.retakeText}>Retake</Text>
                        </Pressable>
                        <Pressable style={styles.analyzeButton} onPress={analyzePhoto}>
                            <LinearGradient colors={[Colors.gold.primary, Colors.gold.muted]} style={styles.analyzeGradient}>
                                <Ionicons name="sparkles" size={20} color={Colors.bg.primary} />
                                <Text style={styles.analyzeText}>Analyze My Skin</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        )
    }

    // Camera viewfinder
    return (
        <View style={styles.container}>
            <CameraView ref={cameraRef} facing="front" style={StyleSheet.absoluteFill} />

            {/* Face oval guide */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <Svg height="100%" width="100%">
                    <Ellipse
                        cx="50%" cy="42%"
                        rx="35%" ry="40%"
                        stroke={Colors.gold.primary}
                        strokeWidth={2}
                        strokeDasharray="8,4"
                        fill="transparent"
                    />
                </Svg>
            </View>

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.cameraHeader}>
                <Pressable style={styles.backBtnDark} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </Pressable>
                <Text style={styles.cameraTitle}>AI Skin Analysis</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            {/* Guide text */}
            <View style={styles.cameraGuide}>
                <Text style={styles.cameraGuideText}>Position your face in the oval · Good lighting helps</Text>
            </View>

            {/* Capture button */}
            <View style={styles.captureRow}>
                <Pressable style={styles.captureBtn} onPress={takePhoto}>
                    <View style={styles.captureBtnInner} />
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
    permTitle: { ...Typography.h2, color: Colors.text.primary, textAlign: 'center' },
    permSubtext: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
    allowBtn: {
        backgroundColor: Colors.gold.primary, borderRadius: BorderRadius.md,
        paddingVertical: 14, paddingHorizontal: Spacing.xl,
    },
    allowBtnText: { ...Typography.bodyMedium, color: Colors.bg.primary, fontWeight: '700' },

    headerBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.bg.secondary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    backBtnDark: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Camera UI
    cameraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg },
    cameraTitle: { ...Typography.bodyMedium, color: '#fff', fontWeight: '700' },
    cameraGuide: { position: 'absolute', top: '70%', left: 0, right: 0, alignItems: 'center' },
    cameraGuideText: { ...Typography.small, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
    captureRow: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
    captureBtn: {
        width: 72, height: 72, borderRadius: 36,
        borderWidth: 4, borderColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },
    captureBtnInner: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#fff',
    },

    // Preview
    previewOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        padding: Spacing.lg,
        paddingBottom: 60,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    previewPrivacyNote: { ...Typography.small, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: Spacing.lg },
    previewActions: { flexDirection: 'row', gap: Spacing.sm },
    retakeButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, paddingVertical: 14,
        borderRadius: BorderRadius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    retakeText: { ...Typography.bodyMedium, color: '#fff' },
    analyzeButton: { flex: 2, borderRadius: BorderRadius.md, overflow: 'hidden' },
    analyzeGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, paddingVertical: 14,
    },
    analyzeText: { ...Typography.bodyMedium, color: Colors.bg.primary, fontWeight: '700' },

    // Analyzing state
    analyzingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
    analyzingTitle: { ...Typography.h2, color: Colors.text.primary, marginTop: Spacing.md },
    analyzingStep: { ...Typography.body, color: Colors.text.secondary },

    // Results
    resultsScroll: { paddingBottom: 80 },
    resultsHero: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
    resultsTitle: { ...Typography.h1, color: Colors.text.primary },
    resultsDate: { ...Typography.small, color: Colors.text.tertiary, marginTop: 2 },
    scoreCard: {
        marginHorizontal: Spacing.lg, padding: Spacing.lg,
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.bg.tertiary, gap: Spacing.sm, marginBottom: Spacing.sm,
    },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    skinTypeLabel: { ...Typography.small, color: Colors.text.tertiary },
    skinTypeValue: { ...Typography.h2, color: Colors.text.primary },
    scoreCircle: { flexDirection: 'row', alignItems: 'baseline' },
    scoreNumber: { fontSize: 36, fontWeight: '800' },
    scoreMax: { ...Typography.small, color: Colors.text.tertiary },
    scoreTrack: { height: 6, backgroundColor: Colors.bg.tertiary, borderRadius: 3, overflow: 'hidden' },
    scoreTrackFill: { height: '100%', borderRadius: 3 },
    summaryText: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },

    disclaimerBar: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
        padding: Spacing.sm,
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.sm,
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    disclaimerText: { ...Typography.caption, color: Colors.text.tertiary, flex: 1 },

    section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    sectionTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.sm },
    concernCard: {
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.sm,
        borderWidth: 1, borderColor: Colors.bg.tertiary, gap: 6,
    },
    concernHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    concernName: { ...Typography.bodyMedium, color: Colors.text.primary },
    severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1 },
    severityText: { ...Typography.caption, fontWeight: '700', textTransform: 'capitalize' },
    scoreBarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    scoreBarLabel: { ...Typography.caption, color: Colors.text.tertiary, width: 0 },
    scoreBarTrack: { flex: 1, height: 6, backgroundColor: Colors.bg.tertiary, borderRadius: 3, overflow: 'hidden' },
    scoreBarFill: { height: '100%', borderRadius: 3 },
    scoreBarValue: { ...Typography.small, fontWeight: '700', minWidth: 18, textAlign: 'right' },
    concernTip: { ...Typography.small, color: Colors.text.secondary, lineHeight: 18 },
    recCard: {
        flexDirection: 'row', gap: Spacing.sm,
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.sm,
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    recEmoji: { fontSize: 22, marginTop: 1 },
    recBody: { flex: 1, gap: 2 },
    recTitle: { ...Typography.bodyMedium, color: Colors.text.primary },
    recDesc: { ...Typography.small, color: Colors.text.secondary, lineHeight: 18 },
    retakeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, marginHorizontal: Spacing.lg,
        paddingVertical: 14, borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: Colors.gold.muted,
    },
    retakeBtnText: { ...Typography.bodyMedium, color: Colors.gold.primary },
})
