// app/hair-loss-tracker.tsx
// Phase 9 — Hair Loss Photo Tracker (premium-gated)
// 5-angle photo session → review → save → timeline view with month comparison

import { useState, useRef, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import Constants from 'expo-constants'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle } from 'react-native-svg'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import {
    hairLossService,
    type HairLossLog,
    type AngleKey,
} from '@/services/hairloss.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'
import { useSubscriptionStore } from '@/stores/subscription.store'

// ── Angle definitions ──────────────────────────────────────────────────────

const ANGLES = [
    { key: 'top' as AngleKey, label: 'Top of Head', icon: '⬆️', instruction: 'Point camera straight down at your crown' },
    { key: 'front' as AngleKey, label: 'Front Hairline', icon: '🧍', instruction: 'Face camera directly — look forward' },
    { key: 'back' as AngleKey, label: 'Back / Crown', icon: '⬇️', instruction: 'Point camera at the back of your head' },
    { key: 'left' as AngleKey, label: 'Left Temple', icon: '◀️', instruction: 'Show your left side profile' },
    { key: 'right' as AngleKey, label: 'Right Temple', icon: '▶️', instruction: 'Show your right side profile' },
] as const

// ── Monthly reminder ───────────────────────────────────────────────────────

async function scheduleMonthlyReminder() {
    // expo-notifications push API is removed from Expo Go in SDK 53.
    // Use lazy require so the module never loads in Expo Go — only runs in dev/prod builds.
    if (Constants.appOwnership === 'expo') return
    try {
        const Notifications = require('expo-notifications')
        const { status } = await Notifications.requestPermissionsAsync()
        if (status !== 'granted') return

        await Notifications.cancelAllScheduledNotificationsAsync()
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📸 Time for your monthly hair check',
                body: "Log this month's photos to track your progress.",
                data: { screen: 'hair-loss-tracker' },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                day: 1,
                hour: 10,
                minute: 0,
                repeats: true,
            },
        })
    } catch (e) {
        console.warn('Could not schedule hair loss reminder:', e)
    }
}

// ── Review & Save sub-screen ───────────────────────────────────────────────

function ReviewScreen({
    photos,
    onSave,
    onRetake,
    saving,
}: {
    photos: Partial<Record<AngleKey, string>>
    onSave: () => void
    onRetake: () => void
    saving: boolean
}) {
    return (
        <ScrollView contentContainerStyle={styles.reviewScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.reviewTitle}>Review Your Photos</Text>
            <Text style={styles.reviewSubtitle}>Make sure each angle is clear before saving</Text>

            <View style={styles.photoGrid}>
                {ANGLES.map((angle) => {
                    const uri = photos[angle.key]
                    return (
                        <View key={angle.key} style={styles.photoCell}>
                            {uri ? (
                                <Image source={{ uri }} style={styles.reviewPhoto} />
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Text style={styles.photoPlaceholderText}>{angle.icon}</Text>
                                </View>
                            )}
                            <Text style={styles.photoLabel}>{angle.label}</Text>
                        </View>
                    )
                })}
            </View>

            <Text style={styles.reviewNote}>
                📅 Saved to {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>

            <View style={styles.reviewActions}>
                <Pressable style={styles.retakeBtn} onPress={onRetake} disabled={saving}>
                    <Ionicons name="refresh" size={18} color={Colors.text.secondary} />
                    <Text style={styles.retakeBtnText}>Retake</Text>
                </Pressable>
                <Pressable
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={onSave}
                    disabled={saving}
                >
                    <LinearGradient
                        colors={[Colors.gold.primary, Colors.gold.muted]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.saveBtnGradient}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color={Colors.bg.primary} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={18} color={Colors.bg.primary} />
                                <Text style={styles.saveBtnText}>Save This Month's Log</Text>
                            </>
                        )}
                    </LinearGradient>
                </Pressable>
            </View>
        </ScrollView>
    )
}

// ── Timeline sub-screen ────────────────────────────────────────────────────

function TimelineView({ logs }: { logs: HairLossLog[] }) {
    const grouped = hairLossService.groupByMonth(logs)
    const months = Object.keys(grouped).sort().reverse()
    const [selectedAngle, setSelectedAngle] = useState<AngleKey>('top')
    const [compareLeft, setCompareLeft] = useState(months[0] ?? '')
    const [compareRight, setCompareRight] = useState(months[1] ?? months[0] ?? '')

    if (months.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📸</Text>
                <Text style={styles.emptyTitle}>No photos yet</Text>
                <Text style={styles.emptySubtitle}>Complete your first session to start tracking</Text>
            </View>
        )
    }

    function getPhotoForMonth(month: string, angle: AngleKey): string | undefined {
        return grouped[month]?.find((l) => l.photo_angle === angle)?.photo_url
    }

    return (
        <ScrollView contentContainerStyle={styles.timelineScroll} showsVerticalScrollIndicator={false}>
            {/* Angle Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.angleSelector} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.xs }}>
                {ANGLES.map((angle) => (
                    <Pressable
                        key={angle.key}
                        style={[styles.angleChip, selectedAngle === angle.key && styles.angleChipActive]}
                        onPress={() => setSelectedAngle(angle.key)}
                    >
                        <Text style={styles.angleChipEmoji}>{angle.icon}</Text>
                        <Text style={[styles.angleChipText, selectedAngle === angle.key && styles.angleChipTextActive]}>
                            {angle.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Side-by-side comparison */}
            <Text style={styles.sectionLabel}>Compare</Text>
            <View style={styles.comparison}>
                {([compareLeft, compareRight] as const).map((month, side) => {
                    const url = getPhotoForMonth(month, selectedAngle)
                    return (
                        <View key={side} style={styles.comparisonSide}>
                            <Text style={styles.comparisonMonth}>
                                {month ? new Date(month + '-15').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                            </Text>
                            {url ? (
                                <Image source={{ uri: url }} style={styles.comparisonPhoto} />
                            ) : (
                                <View style={styles.comparisonPlaceholder}>
                                    <Ionicons name="camera" size={28} color={Colors.text.tertiary} />
                                </View>
                            )}
                        </View>
                    )
                })}
            </View>

            {/* Month scrubber */}
            <Text style={styles.sectionLabel}>Sessions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
                {months.map((month) => {
                    const url = getPhotoForMonth(month, selectedAngle)
                    const isLeft = month === compareLeft
                    const isRight = month === compareRight
                    return (
                        <Pressable
                            key={month}
                            style={[
                                styles.monthThumb,
                                isLeft && styles.monthThumbLeft,
                                isRight && styles.monthThumbRight,
                            ]}
                            onPress={() => {
                                if (!isLeft) setCompareLeft(month)
                                else setCompareRight(month)
                            }}
                        >
                            {url ? (
                                <Image source={{ uri: url }} style={styles.thumbPhoto} />
                            ) : (
                                <View style={[styles.thumbPhoto, { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg.tertiary }]}>
                                    <Text>❓</Text>
                                </View>
                            )}
                            <Text style={styles.thumbLabel}>
                                {new Date(month + '-15').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                            </Text>
                            {isLeft && <Text style={styles.thumbTag}>L</Text>}
                            {isRight && <Text style={[styles.thumbTag, styles.thumbTagRight]}>R</Text>}
                        </Pressable>
                    )
                })}
            </ScrollView>

            <Text style={styles.trendText}>
                {months.length >= 6
                    ? '📊 6+ months tracked! Look closely at your earliest vs latest photos — consistent tracking gives you the clearest picture of change over time.'
                    : months.length >= 3
                    ? '📈 Great progress! With 3+ months of data, start comparing your first session to today. Look at hairline edges and crown density.'
                    : months.length === 2
                    ? '📅 2 sessions logged! One more month and you can start spotting real trends. Consistency is everything.'
                    : '📸 First session saved! Come back next month for your second log. Early detection starts with regular tracking.'}
            </Text>
        </ScrollView>
    )
}

// ── Main Screen ────────────────────────────────────────────────────────────

type ScreenState = 'home' | 'camera' | 'review' | 'timeline'

export default function HairLossTrackerScreen() {
    const isPremium = useSubscriptionStore((s) => s.isPremium)
    const [permission, requestPermission] = useCameraPermissions()
    const [screen, setScreen] = useState<ScreenState>('home')
    const [currentAngleIndex, setCurrentAngleIndex] = useState(0)
    const [capturedPhotos, setCapturedPhotos] = useState<Partial<Record<AngleKey, string>>>({})
    const cameraRef = useRef<CameraView>(null)
    const queryClient = useQueryClient()

    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['hair-loss-logs'],
        queryFn: () => hairLossService.getLogs(),
    })

    const { data: hasSession = false } = useQuery({
        queryKey: ['hair-loss-this-month'],
        queryFn: () => hairLossService.hasSessionThisMonth(),
    })

    const saveMutation = useMutation({
        mutationFn: () =>
            hairLossService.uploadSession(capturedPhotos as Record<AngleKey, string | null>),
        onSuccess: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            await queryClient.invalidateQueries({ queryKey: ['hair-loss-logs'] })
            await queryClient.invalidateQueries({ queryKey: ['hair-loss-this-month'] })
            setScreen('timeline')
        },
        onError: () => {
            Alert.alert('Save Failed', 'Could not save photos. Please try again.')
        },
    })

    useEffect(() => {
        scheduleMonthlyReminder()
    }, [])

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
                        <Ionicons name="lock-closed" size={48} color={Colors.gold.primary} />
                        <Text style={styles.premiumTitle}>Premium Feature</Text>
                        <Text style={styles.premiumSubtitle}>
                            Hair Loss Tracker is available on Premium.
                        </Text>
                        <Pressable
                            style={styles.upgradeBtn}
                            onPress={() => router.push('/paywall')}
                        >
                            <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
                        </Pressable>
                    </View>
                </AnimatedScreen>
            </SafeAreaView>
        )
    }

    async function captureCurrentAngle() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        const photo = await cameraRef.current?.takePictureAsync({
            quality: 0.85,
            base64: false,
            exif: false,
        })
        if (!photo) return

        const currentAngle = ANGLES[currentAngleIndex]
        setCapturedPhotos((prev) => ({ ...prev, [currentAngle.key]: photo.uri }))

        if (currentAngleIndex < ANGLES.length - 1) {
            setTimeout(() => setCurrentAngleIndex((i) => i + 1), 400)
        } else {
            setScreen('review')
        }
    }

    function startSession() {
        if (!permission?.granted) {
            requestPermission()
            return
        }
        setCapturedPhotos({})
        setCurrentAngleIndex(0)
        setScreen('camera')
    }

    // ── Home screen ──────────────────────────────────────────────────────────
    if (screen === 'home') {
        const grouped = hairLossService.groupByMonth(logs)
        const sessions = Object.keys(grouped).sort().reverse()
        const latestMonth = sessions[0]
        const latestPhotos = latestMonth ? grouped[latestMonth] : []

        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnimatedScreen>
                    <ScrollView contentContainerStyle={styles.homeScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.headerBar}>
                            <Pressable style={styles.backBtn} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                            </Pressable>
                            <Text style={styles.headerTitle}>Hair Loss Tracker</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <LinearGradient colors={['rgba(201,168,76,0.08)', 'transparent']} style={styles.hero}>
                            <Text style={styles.heroLine}>Track your progress monthly.</Text>
                            <Text style={styles.heroLine2}>Early detection is key. 🔍</Text>
                        </LinearGradient>

                        {/* Stats row */}
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statNum}>{sessions.length}</Text>
                                <Text style={styles.statLabel}>Sessions</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statNum}>
                                    {latestMonth
                                        ? new Date(latestMonth + '-15').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                                        : '—'}
                                </Text>
                                <Text style={styles.statLabel}>Last Logged</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                                <Text style={styles.statNum}>{sessions.length * 5}</Text>
                                <Text style={styles.statLabel}>Photos</Text>
                            </View>
                        </View>

                        {/* Latest photos stripe */}
                        {latestPhotos.length > 0 && (
                            <View style={styles.latestSection}>
                                <Text style={styles.sectionLabel}>Latest — {new Date(latestMonth + '-15').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs, paddingHorizontal: Spacing.lg }}>
                                    {latestPhotos.map((log) => (
                                        <View key={log.id} style={styles.latestPhotoCell}>
                                            <Image source={{ uri: log.photo_url }} style={styles.latestPhoto} />
                                            <Text style={styles.latestPhotoLabel}>{log.photo_angle}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* CTA */}
                        {hasSession ? (
                            <View style={styles.alreadyDone}>
                                <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                                <Text style={styles.alreadyDoneText}>This month is logged ✅</Text>
                                <Text style={styles.nextSession}>
                                    Next session: {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </Text>
                            </View>
                        ) : (
                            <Pressable style={styles.logCTA} onPress={startSession}>
                                <LinearGradient
                                    colors={[Colors.gold.primary, Colors.gold.muted]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.logCTAGradient}
                                >
                                    <Ionicons name="camera" size={22} color={Colors.bg.primary} />
                                    <Text style={styles.logCTAText}>Log This Month's Photos</Text>
                                </LinearGradient>
                            </Pressable>
                        )}

                        {/* Timeline CTA */}
                        {sessions.length > 0 && (
                            <Pressable style={styles.timelineBtn} onPress={() => setScreen('timeline')}>
                                <Ionicons name="time" size={18} color={Colors.gold.primary} />
                                <Text style={styles.timelineBtnText}>View Full Timeline</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
                            </Pressable>
                        )}
                    </ScrollView>
                </AnimatedScreen>
            </SafeAreaView>
        )
    }

    // ── Camera screen ─────────────────────────────────────────────────────────
    if (screen === 'camera') {
        const currentAngle = ANGLES[currentAngleIndex]
        return (
            <View style={styles.container}>
                <CameraView
                    ref={cameraRef}
                    facing="back"
                    style={StyleSheet.absoluteFill}
                />

                {/* Guide overlay for top angle */}
                {currentAngle.key === 'top' && (
                    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                        <Svg height="100%" width="100%">
                            <Circle cx="50%" cy="50%" r="35%" stroke={Colors.gold.primary} strokeWidth={2} strokeDasharray="8,4" fill="transparent" />
                        </Svg>
                    </View>
                )}

                {/* Header with progress */}
                <SafeAreaView edges={['top']} style={styles.camHeader}>
                    <Pressable style={styles.backBtnDark} onPress={() => setScreen('home')}>
                        <Ionicons name="close" size={22} color="#fff" />
                    </Pressable>
                    <View style={styles.progressDots}>
                        {ANGLES.map((a, i) => (
                            <View
                                key={a.key}
                                style={[
                                    styles.dot,
                                    i < currentAngleIndex && styles.dotDone,
                                    i === currentAngleIndex && styles.dotActive,
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={styles.camStep}>{currentAngleIndex + 1}/{ANGLES.length}</Text>
                </SafeAreaView>

                {/* Instruction */}
                <Animated.View entering={FadeIn.duration(300)} style={styles.instruction}>
                    <Text style={styles.instructionIcon}>{currentAngle.icon}</Text>
                    <Text style={styles.instructionLabel}>{currentAngle.label}</Text>
                    <Text style={styles.instructionText}>{currentAngle.instruction}</Text>
                </Animated.View>

                {/* Capture */}
                <View style={styles.captureRow}>
                    <Pressable style={styles.captureBtn} onPress={captureCurrentAngle}>
                        <View style={styles.captureBtnInner} />
                    </Pressable>
                </View>
            </View>
        )
    }

    // ── Review screen ─────────────────────────────────────────────────────────
    if (screen === 'review') {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnimatedScreen>
                    <ReviewScreen
                        photos={capturedPhotos}
                        saving={saveMutation.isPending}
                        onSave={() => saveMutation.mutate()}
                        onRetake={() => {
                            setCapturedPhotos({})
                            setCurrentAngleIndex(0)
                            setScreen('camera')
                        }}
                    />
                </AnimatedScreen>
            </SafeAreaView>
        )
    }

    // ── Timeline screen ────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AnimatedScreen>
                <View style={styles.headerBar}>
                    <Pressable style={styles.backBtn} onPress={() => setScreen('home')}>
                        <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Photo Timeline</Text>
                    <View style={{ width: 40 }} />
                </View>
                <TimelineView logs={logs} />
            </AnimatedScreen>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary },
    homeScroll: { paddingBottom: 60 },
    headerBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    headerTitle: { ...Typography.h3, color: Colors.text.primary },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.bg.secondary, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    proPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.overlay.gold, paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.gold.muted,
    },
    proPillText: { ...Typography.caption, color: Colors.gold.primary, fontWeight: '700' },
    backBtnDark: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
    },

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

    hero: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
    heroLine: { ...Typography.h2, color: Colors.text.primary },
    heroLine2: { ...Typography.body, color: Colors.text.secondary, marginTop: 2 },

    statsRow: {
        flexDirection: 'row', justifyContent: 'space-evenly',
        marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md,
        padding: Spacing.md, borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    stat: { alignItems: 'center', gap: 2 },
    statNum: { ...Typography.h2, color: Colors.gold.primary },
    statLabel: { ...Typography.caption, color: Colors.text.tertiary },
    statDivider: { width: 1, backgroundColor: Colors.bg.tertiary },

    latestSection: { marginBottom: Spacing.lg },
    sectionLabel: { ...Typography.h3, color: Colors.text.primary, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
    latestPhotoCell: { alignItems: 'center', gap: 4 },
    latestPhoto: { width: 80, height: 80, borderRadius: 8, backgroundColor: Colors.bg.tertiary },
    latestPhotoLabel: { ...Typography.caption, color: Colors.text.tertiary, textTransform: 'capitalize' },

    alreadyDone: {
        marginHorizontal: Spacing.lg, padding: Spacing.lg,
        backgroundColor: '#34C75922', borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: '#34C75944',
        alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md,
    },
    alreadyDoneText: { ...Typography.bodyMedium, color: '#34C759' },
    nextSession: { ...Typography.small, color: Colors.text.tertiary },

    logCTA: { marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: Spacing.md },
    logCTAGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, paddingVertical: 18,
    },
    logCTAText: { ...Typography.h3, color: Colors.bg.primary, fontWeight: '800' },

    timelineBtn: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        marginHorizontal: Spacing.lg, paddingVertical: 14,
        borderWidth: 1, borderColor: Colors.bg.tertiary, borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.lg, justifyContent: 'space-between',
    },
    timelineBtnText: { ...Typography.bodyMedium, color: Colors.gold.primary, flex: 1, marginLeft: Spacing.xs },

    // Camera
    camHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg },
    progressDots: { flexDirection: 'row', gap: 6 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
    dotDone: { backgroundColor: '#34C759' },
    dotActive: { backgroundColor: Colors.gold.primary, width: 20, borderRadius: 5 },
    camStep: { ...Typography.small, color: 'rgba(255,255,255,0.8)' },
    instruction: {
        position: 'absolute', bottom: 180, left: Spacing.xl, right: Spacing.xl,
        alignItems: 'center', gap: 4,
    },
    instructionIcon: { fontSize: 32, marginBottom: 4 },
    instructionLabel: { ...Typography.h3, color: '#fff', fontWeight: '700' },
    instructionText: { ...Typography.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
    captureRow: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
    captureBtn: {
        width: 72, height: 72, borderRadius: 36,
        borderWidth: 4, borderColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },
    captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },

    // Review
    reviewScroll: { paddingHorizontal: Spacing.lg, paddingBottom: 60, gap: Spacing.md, paddingTop: Spacing.md },
    reviewTitle: { ...Typography.h2, color: Colors.text.primary },
    reviewSubtitle: { ...Typography.body, color: Colors.text.secondary },
    photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    photoCell: { width: '30%', alignItems: 'center', gap: 4 },
    reviewPhoto: { width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: Colors.bg.tertiary },
    photoPlaceholder: {
        width: '100%', aspectRatio: 1, borderRadius: 8,
        backgroundColor: Colors.bg.secondary, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    photoPlaceholderText: { fontSize: 24 },
    photoLabel: { ...Typography.caption, color: Colors.text.tertiary, textTransform: 'capitalize' },
    reviewNote: { ...Typography.small, color: Colors.text.tertiary, textAlign: 'center' },
    reviewActions: { flexDirection: 'row', gap: Spacing.sm },
    retakeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, paddingVertical: 14, paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.bg.tertiary,
        backgroundColor: Colors.bg.secondary,
    },
    retakeBtnText: { ...Typography.bodyMedium, color: Colors.text.secondary },
    saveBtn: { flex: 1, borderRadius: BorderRadius.md, overflow: 'hidden' },
    saveBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, paddingVertical: 14,
    },
    saveBtnText: { ...Typography.bodyMedium, color: Colors.bg.primary, fontWeight: '700' },

    // Timeline
    timelineScroll: { paddingBottom: 60 },
    angleSelector: {},
    angleChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: BorderRadius.full, borderWidth: 1,
        borderColor: Colors.bg.tertiary, backgroundColor: Colors.bg.secondary,
    },
    angleChipActive: { borderColor: Colors.gold.muted, backgroundColor: Colors.overlay.gold },
    angleChipEmoji: { fontSize: 14 },
    angleChipText: { ...Typography.small, color: Colors.text.secondary },
    angleChipTextActive: { color: Colors.gold.primary, fontWeight: '700' },
    comparison: {
        flexDirection: 'row', marginHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg,
    },
    comparisonSide: { flex: 1, gap: 6 },
    comparisonMonth: { ...Typography.small, color: Colors.text.tertiary, textAlign: 'center' },
    comparisonPhoto: { width: '100%', aspectRatio: 1, borderRadius: BorderRadius.md, backgroundColor: Colors.bg.tertiary },
    comparisonPlaceholder: {
        width: '100%', aspectRatio: 1, borderRadius: BorderRadius.md,
        backgroundColor: Colors.bg.secondary, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    monthThumb: { alignItems: 'center', gap: 4, opacity: 0.6 },
    monthThumbLeft: { opacity: 1, transform: [{ scale: 1.05 }] },
    monthThumbRight: { opacity: 1, transform: [{ scale: 1.05 }] },
    thumbPhoto: { width: 70, height: 70, borderRadius: 8, backgroundColor: Colors.bg.tertiary },
    thumbLabel: { ...Typography.caption, color: Colors.text.secondary },
    thumbTag: {
        position: 'absolute', top: 4, left: 4,
        backgroundColor: Colors.gold.primary,
        borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1,
    },
    thumbTagRight: { left: undefined, right: 4, backgroundColor: '#5E8DFF' },
    trendText: {
        ...Typography.small, color: Colors.text.tertiary,
        marginHorizontal: Spacing.lg, marginTop: Spacing.lg,
        lineHeight: 20, textAlign: 'center',
    },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
    emptyEmoji: { fontSize: 52 },
    emptyTitle: { ...Typography.h2, color: Colors.text.primary },
    emptySubtitle: { ...Typography.body, color: Colors.text.secondary, textAlign: 'center' },
})
