import { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { useSubscription } from '@/hooks/useSubscription'

const DISMISS_KEY = 'trial_warning_dismissed_at'
const DISMISS_HOURS = 24

const LOSING_FEATURES = [
    'AR Hairstyle Try-On',
    'Skin Analysis',
    'Product Scanner',
    'Hair Loss Tracker',
    'Full Barber Library',
]

export function TrialWarningBanner() {
    const { isTrialing, trialDaysLeft, isTrialExpired } = useSubscription()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!isTrialing || trialDaysLeft > 2) return

        // Check if dismissed recently
        AsyncStorage.getItem(DISMISS_KEY).then((val) => {
            if (val) {
                const dismissedAt = Number(val)
                const hoursSince = (Date.now() - dismissedAt) / 3600000
                if (hoursSince < DISMISS_HOURS) return
            }
            setVisible(true)
        })
    }, [isTrialing, trialDaysLeft])

    function handleDismiss() {
        AsyncStorage.setItem(DISMISS_KEY, String(Date.now()))
        setVisible(false)
    }

    function handleUpgrade() {
        setVisible(false)
        router.push('/paywall')
    }

    if (!visible) return null

    const dayText = isTrialExpired
        ? 'Your free trial has ended'
        : `Your free trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'}`

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={handleDismiss}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconRow}>
                        <Ionicons name="time-outline" size={32} color={Colors.gold.primary} />
                    </View>

                    <Text style={styles.title}>{dayText}</Text>

                    <Text style={styles.subtitle}>You'll lose access to:</Text>
                    {LOSING_FEATURES.map((f) => (
                        <View key={f} style={styles.featureRow}>
                            <Ionicons name="close-circle" size={16} color={Colors.error} />
                            <Text style={styles.featureText}>{f}</Text>
                        </View>
                    ))}

                    <Pressable style={styles.upgradeBtn} onPress={handleUpgrade}>
                        <Text style={styles.upgradeBtnText}>Keep My Premium →</Text>
                    </Pressable>

                    <Pressable style={styles.laterBtn} onPress={handleDismiss}>
                        <Text style={styles.laterBtnText}>Maybe Later</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    card: {
        width: '100%',
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    iconRow: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        ...Typography.h2,
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.text.secondary,
        marginBottom: Spacing.md,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    featureText: {
        ...Typography.body,
        color: Colors.text.tertiary,
    },
    upgradeBtn: {
        marginTop: Spacing.lg,
        height: 52,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gold.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    upgradeBtnText: {
        color: '#0A0A0A',
        fontSize: 16,
        fontWeight: '700',
    },
    laterBtn: {
        marginTop: Spacing.sm,
        alignItems: 'center',
        paddingVertical: 10,
    },
    laterBtnText: {
        ...Typography.small,
        color: Colors.text.tertiary,
    },
})
