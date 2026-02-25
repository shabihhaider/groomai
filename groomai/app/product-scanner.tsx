// app/product-scanner.tsx
// Phase 7 — Barcode Product Ingredient Scanner (premium-gated)
// Uses expo-camera CameraView (SDK 51+) — NOT expo-barcode-scanner (deprecated)

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
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useProductLookup } from '@/hooks/useAI'
import { type ProductAnalysis } from '@/services/product.service'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'

const VERDICT_CONFIG = {
    safe: { color: '#34C759', bg: '#34C75922', label: '✅ SAFE FOR YOU', icon: 'checkmark-circle' },
    caution: { color: '#FF9500', bg: '#FF950022', label: '⚠️ USE WITH CAUTION', icon: 'warning' },
    avoid: { color: '#FF3B30', bg: '#FF3B3022', label: '🚫 AVOID', icon: 'close-circle' },
} as const

const SEVERITY_COLOR = { mild: Colors.gold.primary, moderate: '#FF9500', high: '#FF3B30' }

// ── Results sub-screen ─────────────────────────────────────────────────────

function ProductResultScreen({
    analysis,
    onRescan,
}: {
    analysis: ProductAnalysis
    onRescan: () => void
}) {
    const verdict = VERDICT_CONFIG[analysis.verdict]
    const [showAllIngredients, setShowAllIngredients] = useState(false)

    return (
        <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            {/* Product header */}
            <LinearGradient colors={['rgba(201,168,76,0.08)', 'transparent']} style={styles.productHero}>
                <Text style={styles.productName} numberOfLines={2}>{analysis.productName ?? 'Scanned Product'}</Text>
                {analysis.brand && <Text style={styles.productBrand}>{analysis.brand}</Text>}
            </LinearGradient>

            {/* Verdict card */}
            <Animated.View entering={FadeInDown.duration(350)} style={styles.section}>
                <View style={[styles.verdictCard, { backgroundColor: verdict.bg, borderColor: verdict.color }]}>
                    <Text style={[styles.verdictLabel, { color: verdict.color }]}>{verdict.label}</Text>
                    <View style={styles.safetyScoreRow}>
                        <Text style={styles.safetyScoreLabel}>Safety Score</Text>
                        <Text style={[styles.safetyScoreValue, { color: verdict.color }]}>
                            {analysis.safetyScore}/10
                        </Text>
                    </View>
                    <View style={styles.safetyTrack}>
                        <View style={[styles.safetyTrackFill, {
                            width: `${analysis.safetyScore * 10}%`,
                            backgroundColor: verdict.color,
                        }]} />
                    </View>
                    <Text style={styles.verdictSummary}>{analysis.summary}</Text>
                </View>
            </Animated.View>

            {/* Good ingredients */}
            {analysis.goodIngredients?.length > 0 && (
                <Animated.View entering={FadeInDown.delay(80).duration(350)} style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Good Ingredients for You</Text>
                    {analysis.goodIngredients.map((ing, i) => (
                        <View key={i} style={styles.goodIngRow}>
                            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                            <Text style={styles.goodIngText}>{ing}</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* Flagged ingredients */}
            {analysis.flaggedIngredients?.length > 0 && (
                <Animated.View entering={FadeInDown.delay(120).duration(350)} style={styles.section}>
                    <Text style={styles.sectionTitle}>⚠️ Flagged for Your Skin</Text>
                    {analysis.flaggedIngredients.map((f, i) => (
                        <View key={i} style={styles.flagCard}>
                            <View style={styles.flagHeader}>
                                <Text style={styles.flagName}>{f.name}</Text>
                                <View style={[styles.severityBadge, {
                                    backgroundColor: SEVERITY_COLOR[f.severity] + '22',
                                    borderColor: SEVERITY_COLOR[f.severity],
                                }]}>
                                    <Text style={[styles.severityText, { color: SEVERITY_COLOR[f.severity] }]}>
                                        {f.severity}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.flagReason}>{f.reason}</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* Full ingredient list (expandable) */}
            {analysis.ingredients?.length > 0 && (
                <Animated.View entering={FadeInDown.delay(160).duration(350)} style={styles.section}>
                    <Pressable
                        style={styles.expandRow}
                        onPress={() => setShowAllIngredients(!showAllIngredients)}
                    >
                        <Text style={styles.sectionTitle}>
                            Full Ingredient List ({analysis.ingredients.length})
                        </Text>
                        <Ionicons
                            name={showAllIngredients ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={Colors.text.secondary}
                        />
                    </Pressable>
                    {showAllIngredients && analysis.ingredients.map((ing, i) => (
                        <View key={i} style={styles.ingRow}>
                            <View style={styles.ingLeft}>
                                <Ionicons
                                    name={ing.isFlagged ? 'warning' : 'checkmark-circle'}
                                    size={14}
                                    color={ing.isFlagged ? '#FF9500' : '#34C759'}
                                />
                                <Text style={styles.ingName}>{ing.name}</Text>
                            </View>
                            <Text style={styles.ingScore}>{ing.safetyScore}/10</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            <Pressable style={styles.rescanBtn} onPress={onRescan}>
                <Ionicons name="scan" size={18} color={Colors.gold.primary} />
                <Text style={styles.rescanBtnText}>Scan Another Product</Text>
            </Pressable>
        </ScrollView>
    )
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function ProductScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const [productNotFound, setProductNotFound] = useState(false)
    const productLookup = useProductLookup()

    if (!permission) {
        return <SafeAreaView style={styles.container}><ActivityIndicator color={Colors.gold.primary} style={{ flex: 1 }} /></SafeAreaView>
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                </Pressable>
                <View style={styles.centered}>
                    <Ionicons name="barcode" size={56} color={Colors.gold.primary} />
                    <Text style={styles.permTitle}>Camera Access Needed</Text>
                    <Text style={styles.permSubtext}>Point your camera at any grooming product barcode to check ingredients instantly.</Text>
                    <Pressable style={styles.allowBtn} onPress={requestPermission}>
                        <Text style={styles.allowBtnText}>Allow Camera</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        )
    }

    async function handleBarcodeScanned({ data: barcode }: BarcodeScanningResult) {
        if (scanned || productLookup.isPending) return
        setScanned(true)
        setProductNotFound(false)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

        productLookup.mutate(barcode, {
            onSuccess: () => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            },
            onError: (err: any) => {
                if (err?.code === 'not_found') {
                    setProductNotFound(true)
                } else if (err?.code === 'rate_limit_exceeded') {
                    Alert.alert('Daily Limit Reached', err.message)
                } else {
                    Alert.alert('Error', 'Could not analyze this product. Please try again.')
                }
                setScanned(false)
            },
        })
    }

    function resetScan() {
        setScanned(false)
        setProductNotFound(false)
        productLookup.reset()
    }

    if (productLookup.data) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <AnimatedScreen>
                    <View style={styles.headerBar}>
                        <Pressable style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
                        </Pressable>
                        <Text style={styles.headerTitle}>Ingredient Analysis</Text>
                        <View style={{ width: 40 }} />
                    </View>
                    <ProductResultScreen
                        analysis={productLookup.data.analysis}
                        onRescan={resetScan}
                    />
                </AnimatedScreen>
            </SafeAreaView>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.scanHeader}>
                <Pressable style={styles.backBtnDark} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </Pressable>
                <Text style={styles.scanHeaderTitle}>Ingredient Scanner</Text>
                <View style={{ width: 40 }} />
            </SafeAreaView>

            {/* Scan frame overlay */}
            <View style={styles.scanOverlay} pointerEvents="none">
                <View style={styles.scanFrame}>
                    {/* Corner brackets */}
                    {['tl', 'tr', 'bl', 'br'].map((corner) => (
                        <View
                            key={corner}
                            style={[
                                styles.corner,
                                corner.includes('t') ? styles.cornerTop : styles.cornerBottom,
                                corner.includes('l') ? styles.cornerLeft : styles.cornerRight,
                            ]}
                        />
                    ))}
                    {/* Animated scan line */}
                    {!productLookup.isPending && (
                        <Animated.View style={styles.scanLine} />
                    )}
                </View>
                <Text style={styles.scanHint}>
                    {productLookup.isPending
                        ? '🔍 Analyzing ingredients...'
                        : productNotFound
                            ? '❌ Product not in database. Try again.'
                            : 'Point camera at barcode'}
                </Text>
            </View>

            {productLookup.isPending && (
                <View style={styles.loadingPill}>
                    <ActivityIndicator size="small" color={Colors.gold.primary} />
                    <Text style={styles.loadingPillText}>Looking up product...</Text>
                </View>
            )}
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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    },
    headerTitle: { ...Typography.h3, color: Colors.text.primary },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: Colors.bg.secondary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    backBtnDark: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
    },

    // Scanner UI
    scanHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    scanHeaderTitle: { ...Typography.bodyMedium, color: '#fff', fontWeight: '700' },
    scanOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center',
    },
    scanFrame: {
        width: 260, height: 160,
        borderRadius: 8, overflow: 'hidden',
        position: 'relative',
    },
    corner: {
        position: 'absolute', width: 24, height: 24,
        borderColor: Colors.gold.primary,
    },
    cornerTop: { top: 0, borderTopWidth: 3 },
    cornerBottom: { bottom: 0, borderBottomWidth: 3 },
    cornerLeft: { left: 0, borderLeftWidth: 3 },
    cornerRight: { right: 0, borderRightWidth: 3 },
    scanLine: {
        position: 'absolute', left: 0, right: 0, top: '50%',
        height: 2, backgroundColor: Colors.gold.primary, opacity: 0.8,
    },
    scanHint: {
        ...Typography.body, color: 'rgba(255,255,255,0.9)',
        textAlign: 'center', marginTop: Spacing.xl,
    },
    loadingPill: {
        position: 'absolute', bottom: 80, left: '50%',
        transform: [{ translateX: -90 }],
        flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    },
    loadingPillText: { ...Typography.small, color: '#fff' },

    // Results
    resultsScroll: { paddingBottom: 80 },
    productHero: { padding: Spacing.lg },
    productName: { ...Typography.h2, color: Colors.text.primary },
    productBrand: { ...Typography.body, color: Colors.text.secondary, marginTop: 2 },
    section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    sectionTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.sm },
    verdictCard: {
        borderRadius: BorderRadius.lg, padding: Spacing.lg,
        borderWidth: 2, gap: Spacing.sm,
    },
    verdictLabel: { ...Typography.h3, fontWeight: '800' },
    safetyScoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    safetyScoreLabel: { ...Typography.body, color: Colors.text.secondary },
    safetyScoreValue: { fontSize: 28, fontWeight: '800' },
    safetyTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' },
    safetyTrackFill: { height: '100%', borderRadius: 4 },
    verdictSummary: { ...Typography.body, color: Colors.text.secondary, lineHeight: 22 },
    goodIngRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: 4 },
    goodIngText: { ...Typography.body, color: Colors.text.primary, flex: 1 },
    flagCard: {
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.md,
        padding: Spacing.md, marginBottom: Spacing.xs,
        borderWidth: 1, borderColor: Colors.bg.tertiary, gap: 4,
    },
    flagHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    flagName: { ...Typography.bodyMedium, color: Colors.text.primary, flex: 1 },
    severityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full, borderWidth: 1 },
    severityText: { ...Typography.caption, fontWeight: '700', textTransform: 'capitalize' },
    flagReason: { ...Typography.small, color: Colors.text.secondary, lineHeight: 18 },
    expandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    ingRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.bg.tertiary,
    },
    ingLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    ingName: { ...Typography.small, color: Colors.text.primary, flex: 1 },
    ingScore: { ...Typography.caption, color: Colors.text.tertiary },
    rescanBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.xs, marginHorizontal: Spacing.lg,
        paddingVertical: 14, borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: Colors.gold.muted,
    },
    rescanBtnText: { ...Typography.bodyMedium, color: Colors.gold.primary },
})
