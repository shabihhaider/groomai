import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { useUserStore } from '@/stores/user.store'
import { useSubscriptionStore } from '@/stores/subscription.store'
import { AnimatedScreen } from '@/components/ui/AnimatedScreen'
import { Avatar } from '@/components/ui/Avatar'
import { useAffiliateRecommendations } from '@/hooks/useAffiliate'
import { AffiliateProductCard } from '@/components/ui/AffiliateProductCard'

export default function ProfileScreen() {
    const profile = useUserStore((s) => s.profile)
    const isPremium = useSubscriptionStore((s) => s.isPremium)
    const affiliateRecs = useAffiliateRecommendations()
    const signOutScale = useSharedValue(1)

    const signOutAnimated = useAnimatedStyle(() => ({
        transform: [{ scale: signOutScale.value }],
    }))

    async function handleSignOut() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut()
                    useUserStore.getState().reset()
                    useSubscriptionStore.getState().reset()
                    queryClient.clear() // Wipe all cached queries from previous user
                    // Navigate to auth welcome screen
                    router.replace('/(auth)/welcome')
                },
            },
        ])
    }

    const subscriptionLabel = isPremium ? 'Premium' : 'Free Plan'
    const skinType = profile?.skin_type ? profile.skin_type.charAt(0).toUpperCase() + profile.skin_type.slice(1) : 'Not set'

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <AnimatedScreen>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
                        <Avatar name={profile?.full_name} size={64} />
                        <View style={styles.headerInfo}>
                            <Text style={styles.name}>{profile?.full_name || 'No name set'}</Text>
                            <View style={[
                                styles.subscriptionBadge,
                                isPremium ? styles.subscriptionBadgePremium : styles.subscriptionBadgeFree,
                            ]}>
                                {isPremium && <Ionicons name="diamond" size={11} color={Colors.gold.primary} style={{ marginRight: 3 }} />}
                                <Text style={[
                                    styles.subscriptionText,
                                    { color: isPremium ? Colors.gold.primary : Colors.text.secondary },
                                ]}>{subscriptionLabel}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Profile</Text>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Ionicons name="water-outline" size={18} color={Colors.text.secondary} />
                                <Text style={styles.infoLabel}>Skin Type</Text>
                                <Text style={styles.infoValue}>{skinType}</Text>
                            </View>
                            <View style={styles.infoDivider} />
                            <View style={styles.infoRow}>
                                <Ionicons name="cut-outline" size={18} color={Colors.text.secondary} />
                                <Text style={styles.infoLabel}>Face Shape</Text>
                                <Text style={styles.infoValue}>{profile?.face_shape || 'Not set'}</Text>
                            </View>
                            <View style={styles.infoDivider} />
                            <View style={styles.infoRow}>
                                <Ionicons name="sparkles-outline" size={18} color={Colors.text.secondary} />
                                <Text style={styles.infoLabel}>Total XP</Text>
                                <Text style={styles.infoValue}>{(profile?.total_xp ?? 0).toLocaleString()}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
                        <Text style={styles.sectionTitle}>Settings</Text>
                        <View style={styles.infoCard}>
                            <Pressable
                                style={styles.settingsRow}
                                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                            >
                                <Ionicons name="notifications-outline" size={18} color={Colors.text.secondary} />
                                <Text style={styles.settingsLabel}>Notifications</Text>
                                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
                            </Pressable>
                            <View style={styles.infoDivider} />
                            <Pressable
                                style={styles.settingsRow}
                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/paywall') }}
                            >
                                <Ionicons name="card-outline" size={18} color={isPremium ? Colors.gold.primary : Colors.text.secondary} />
                                <Text style={styles.settingsLabel}>Subscription</Text>
                                {!isPremium && (
                                    <View style={styles.upgradePill}>
                                        <Text style={styles.upgradeText}>Upgrade</Text>
                                    </View>
                                )}
                                <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
                            </Pressable>
                        </View>
                    </Animated.View>

                    {affiliateRecs.data?.length ? (
                        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.section}>
                            <Text style={styles.sectionTitle}>My Kit</Text>
                            <View style={styles.kitList}>
                                {affiliateRecs.data.slice(0, 3).map((product) => (
                                    <AffiliateProductCard
                                        key={product.id}
                                        product={product}
                                        source="profile_kit"
                                        compact
                                    />
                                ))}
                            </View>
                        </Animated.View>
                    ) : null}

                    <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: Spacing.lg }}>
                        <Animated.View style={signOutAnimated}>
                            <Pressable
                                style={styles.signOutBtn}
                                onPress={handleSignOut}
                                onPressIn={() => { signOutScale.value = withSpring(0.96, { damping: 15 }) }}
                                onPressOut={() => { signOutScale.value = withSpring(1, { damping: 15 }) }}
                            >
                                <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                                <Text style={styles.signOutText}>Sign Out</Text>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </ScrollView>
            </AnimatedScreen>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg.primary },
    scroll: { padding: Spacing.lg, paddingBottom: 120 },
    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
    headerInfo: { flex: 1 },
    name: { ...Typography.h2, color: Colors.text.primary, marginBottom: Spacing.xs },
    subscriptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
    },
    subscriptionBadgePremium: {
        backgroundColor: Colors.gold.primary + '22',
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    subscriptionBadgeFree: {
        backgroundColor: Colors.bg.tertiary,
        borderWidth: 1,
        borderColor: Colors.text.tertiary + '40',
    },
    subscriptionText: { ...Typography.caption, fontWeight: '700' },
    upgradePill: {
        backgroundColor: Colors.gold.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.xs,
    },
    upgradeText: {
        ...Typography.caption,
        color: Colors.text.inverse,
        fontWeight: '700',
        fontSize: 10,
    },
    section: { marginBottom: Spacing.lg },
    sectionTitle: { ...Typography.h3, color: Colors.text.primary, marginBottom: Spacing.sm },
    infoCard: {
        backgroundColor: Colors.bg.secondary, borderRadius: BorderRadius.lg, overflow: 'hidden',
        borderWidth: 1, borderColor: Colors.bg.tertiary,
    },
    infoRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md,
    },
    infoLabel: { ...Typography.body, color: Colors.text.secondary, flex: 1 },
    infoValue: { ...Typography.bodyMedium, color: Colors.text.primary },
    infoDivider: { height: 1, backgroundColor: Colors.bg.tertiary, marginHorizontal: Spacing.md },
    settingsRow: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md,
    },
    settingsLabel: { ...Typography.body, color: Colors.text.primary, flex: 1 },
    kitList: { gap: Spacing.xs },
    signOutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
        paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: Colors.error + '40',
    },
    signOutText: { ...Typography.body, color: Colors.error, fontWeight: '600' },
})
