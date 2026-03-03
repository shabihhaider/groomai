// app/(tabs)/barber.tsx
// Phase 6 — Barber Translator: main discovery screen

import { useState, useMemo } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    FlatList,
    Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useUserStore } from '@/stores/user.store'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'
import { HAIRSTYLES, filterHairstyles, type Hairstyle } from '@/constants/hairstyles'
import { getHairstyleImage } from '@/constants/hairstyleImages'
import { useSavedHairstyleIds } from '@/hooks/useBarber'

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'trending', label: '🔥 Trending' },
    { id: 'short', label: 'Short' },
    { id: 'medium', label: 'Medium' },
    { id: 'long', label: 'Long' },
    { id: 'beard', label: 'Beard' },
    { id: 'combo', label: 'Combo' },
] as const

function StyleCard({ item, isSaved, isPremiumUser }: { item: Hairstyle; isSaved: boolean; isPremiumUser: boolean }) {
    const locked = item.isPremium && !isPremiumUser

    function handlePress() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (locked) {
            router.push('/paywall')
        } else {
            router.push({ pathname: '/hairstyle-detail', params: { slug: item.slug } })
        }
    }

    return (
        <Pressable style={styles.styleCard} onPress={handlePress}>
            {/* Thumbnail */}
            <View style={styles.thumbnailWrapper}>
                {(() => {
                    const localImg = getHairstyleImage(item.slug)
                    if (localImg?.front) {
                        return <Image source={localImg.front} style={styles.thumbnail} resizeMode="cover" />
                    } else if (item.thumbnailUrl) {
                        return <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
                    } else {
                        return (
                            <View style={styles.thumbnailPlaceholder}>
                                <Ionicons name="cut" size={28} color={Colors.gold.primary} />
                            </View>
                        )
                    }
                })()}
                {locked && (
                    <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={18} color="#fff" />
                    </View>
                )}
                {item.isTrending && !locked && (
                    <View style={styles.trendingBadge}>
                        <Text style={styles.trendingBadgeText}>🔥</Text>
                    </View>
                )}
                {isSaved && (
                    <View style={styles.savedDot} />
                )}
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                    {item.faceShapes.slice(0, 2).map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(' • ')}
                </Text>
                <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{item.category}</Text>
                </View>
            </View>
        </Pressable>
    )
}

export default function BarberScreen() {
    const profile = useUserStore((s) => s.profile)
    const isPremium = useSubscriptionStore((s) => s.isPremium)
    const { data: savedIds = [] } = useSavedHairstyleIds()

    const [query, setQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('all')

    const faceShape = profile?.face_shape

    const forYouStyles = useMemo(() => {
        if (!faceShape) return []
        return HAIRSTYLES.filter((h) => h.faceShapes.includes(faceShape as any) && !h.isPremium)
            .sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
            .slice(0, 8)
    }, [faceShape])

    const filteredStyles = useMemo(() => {
        return filterHairstyles(HAIRSTYLES, {
            query,
            category: activeCategory,
            faceShape: undefined,
        })
    }, [query, activeCategory])

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AnimatedScreen>
                {/* Fixed Hero & Filter Bar (Outside ScrollView to fix Android touch) */}
                <View style={{ zIndex: 20, elevation: 20 }}>
                    {/* Hero Header */}
                    <LinearGradient
                        colors={['rgba(201,168,76,0.10)', 'transparent']}
                        style={styles.heroGradient}
                    >
                        <Animated.View entering={FadeInDown.duration(400)}>
                            <Text style={styles.heroTitle}>Barber Translator</Text>
                            <Text style={styles.heroSubtitle}>Find your cut. Speak the language.</Text>
                        </Animated.View>
                    </LinearGradient>

                    {/* Search + Filter Bar */}
                    <View style={styles.stickyBar}>
                        {/* Search */}
                        <View style={styles.searchRow}>
                            <Ionicons name="search" size={18} color={Colors.text.tertiary} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search styles..."
                                placeholderTextColor={Colors.text.tertiary}
                                returnKeyType="search"
                            />
                            {query.length > 0 && (
                                <Pressable onPress={() => setQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
                                </Pressable>
                            )}
                        </View>

                        {/* Category chips */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.chipsScroll}
                            contentContainerStyle={styles.chipsContent}
                        >
                            {CATEGORIES.map((cat) => (
                                <Pressable
                                    key={cat.id}
                                    style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
                                    onPress={() => {
                                        Haptics.selectionAsync()
                                        setActiveCategory(cat.id)
                                        setQuery('')
                                    }}
                                >
                                    <Text style={[styles.chipText, activeCategory === cat.id && styles.chipTextActive]}>
                                        {cat.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Main Scroll Content */}
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                >

                    {/* For Your Face Shape — personalized section */}
                    {faceShape && forYouStyles.length > 0 && activeCategory === 'all' && !query && (
                        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>✨ Recommended for You</Text>
                                <Text style={styles.sectionSub}>
                                    {faceShape.charAt(0).toUpperCase() + faceShape.slice(1)} face shape
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.hScroll}
                            >
                                {forYouStyles.map((item, i) => (
                                    <Animated.View
                                        key={item.id}
                                        entering={FadeInUp.delay(i * 60).duration(300)}
                                    >
                                        <Pressable
                                            style={styles.forYouCard}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                                router.push({ pathname: '/hairstyle-detail', params: { slug: item.slug } })
                                            }}
                                        >
                                            <View style={styles.forYouThumb}>
                                                {(() => {
                                                    const localImg = getHairstyleImage(item.slug)
                                                    if (localImg?.front) {
                                                        return <Image source={localImg.front} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                    } else if (item.thumbnailUrl) {
                                                        return <Image source={{ uri: item.thumbnailUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                    } else {
                                                        return <Ionicons name="cut" size={22} color={Colors.gold.primary} />
                                                    }
                                                })()}
                                            </View>
                                            <Text style={styles.forYouName} numberOfLines={2}>{item.name}</Text>
                                            {item.isTrending && <Text style={styles.forYouTrending}>🔥 Trending</Text>}
                                        </Pressable>
                                    </Animated.View>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    )}

                    {/* Celebrity Photo AI (Premium) */}
                    {activeCategory === 'all' && !query && (
                        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
                            <Pressable
                                style={styles.aiCard}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                    if (isPremium) {
                                        router.push('/celebrity-breakdown')
                                    } else {
                                        router.push('/paywall')
                                    }
                                }}
                            >
                                <LinearGradient
                                    colors={['rgba(201,168,76,0.15)', 'rgba(201,168,76,0.05)']}
                                    style={styles.aiCardGradient}
                                >
                                    <View style={styles.aiCardLeft}>
                                        <Text style={styles.aiCardEmoji}>📸</Text>
                                        <View>
                                            <Text style={styles.aiCardTitle}>Celebrity Photo Breakdown</Text>
                                            <Text style={styles.aiCardSub}>Upload any celeb photo → get the barber script</Text>
                                        </View>
                                    </View>
                                    {!isPremium && (
                                        <View style={styles.proBadge}>
                                            <Text style={styles.proBadgeText}>PRO</Text>
                                        </View>
                                    )}
                                    <Ionicons name="chevron-forward" size={18} color={Colors.gold.primary} />
                                </LinearGradient>
                            </Pressable>
                        </Animated.View>
                    )}

                    {/* All Styles Grid */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {activeCategory === 'all'
                                ? 'All Styles'
                                : activeCategory === 'trending'
                                    ? '🔥 Trending Now'
                                    : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Cuts`}
                            <Text style={styles.styleCount}> ({filteredStyles.length})</Text>
                        </Text>

                        {filteredStyles.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="search" size={36} color={Colors.text.tertiary} />
                                <Text style={styles.emptyStateText}>No styles found for "{query}"</Text>
                            </View>
                        ) : (
                            <View style={styles.grid}>
                                {filteredStyles.map((item, i) => (
                                    <Animated.View
                                        key={item.id}
                                        entering={FadeInUp.delay(i * 30).duration(300)}
                                        style={styles.gridItem}
                                    >
                                        <StyleCard
                                            item={item}
                                            isSaved={savedIds.includes(item.id)}
                                            isPremiumUser={isPremium}
                                        />
                                    </Animated.View>
                                ))}
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </AnimatedScreen>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary },
    scroll: { paddingBottom: 120 },

    heroGradient: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    heroTitle: { ...Typography.h1, color: Colors.text.primary },
    heroSubtitle: { ...Typography.body, color: Colors.text.secondary, marginTop: 2 },

    stickyBar: {
        backgroundColor: Colors.bg.primary,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: Colors.bg.tertiary,
        zIndex: 10,
        elevation: 10,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        marginBottom: Spacing.sm,
        height: 44,
    },
    searchIcon: { marginRight: Spacing.xs },
    searchInput: {
        flex: 1,
        ...Typography.body,
        color: Colors.text.primary,
        height: '100%',
    },
    chipsScroll: { flexGrow: 0 },
    chipsContent: { gap: Spacing.xs, paddingRight: Spacing.sm },
    chip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        backgroundColor: Colors.bg.secondary,
    },
    chipActive: {
        borderColor: Colors.gold.primary,
        backgroundColor: Colors.overlay.gold,
    },
    chipText: { ...Typography.small, color: Colors.text.secondary },
    chipTextActive: { color: Colors.gold.primary, fontWeight: '700' },

    section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
    sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: Spacing.sm },
    sectionTitle: { ...Typography.h3, color: Colors.text.primary },
    sectionSub: { ...Typography.small, color: Colors.gold.primary },
    styleCount: { ...Typography.small, color: Colors.text.tertiary },

    // Horizontal "For You" scroll
    hScroll: { gap: Spacing.sm, paddingRight: Spacing.sm },
    forYouCard: {
        width: 120,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    forYouThumb: {
        width: '100%',
        height: 90,
        backgroundColor: Colors.overlay.gold,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forYouName: {
        ...Typography.small,
        color: Colors.text.primary,
        padding: Spacing.xs,
        fontWeight: '600',
    },
    forYouTrending: { ...Typography.caption, color: Colors.gold.primary, paddingHorizontal: Spacing.xs, paddingBottom: Spacing.xs },

    // AI celebrity card
    aiCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    aiCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    aiCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    aiCardEmoji: { fontSize: 28 },
    aiCardTitle: { ...Typography.bodyMedium, color: Colors.text.primary },
    aiCardSub: { ...Typography.caption, color: Colors.text.secondary, marginTop: 2 },
    proBadge: {
        backgroundColor: Colors.gold.primary,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    proBadgeText: { ...Typography.caption, color: Colors.text.inverse, fontWeight: '800', fontSize: 10 },

    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
    gridItem: { width: '47.5%' },
    styleCard: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
    },
    thumbnailWrapper: { position: 'relative', width: '100%', height: 130 },
    thumbnail: { width: '100%', height: '100%' },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.overlay.gold,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendingBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    trendingBadgeText: { fontSize: 12 },
    savedDot: {
        position: 'absolute',
        top: 6,
        left: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.gold.primary,
    },
    cardInfo: { padding: Spacing.sm },
    cardName: { ...Typography.bodyMedium, color: Colors.text.primary, marginBottom: 2 },
    cardMeta: { ...Typography.caption, color: Colors.text.secondary, marginBottom: Spacing.xs },
    categoryPill: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.bg.tertiary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    categoryPillText: { ...Typography.caption, color: Colors.text.tertiary, fontSize: 10, textTransform: 'capitalize' },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
    emptyStateText: { ...Typography.body, color: Colors.text.tertiary },
})
