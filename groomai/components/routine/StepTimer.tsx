// components/routine/StepTimer.tsx
// Countdown timer per step — premium-gated

import { useState, useEffect, useCallback } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { BorderRadius } from '@/constants/spacing'

interface StepTimerProps {
    seconds: number
    onComplete?: () => void
}

export function StepTimer({ seconds, onComplete }: StepTimerProps) {
    const [remaining, setRemaining] = useState(seconds)
    const [active, setActive] = useState(false)
    const progress = useSharedValue(1)

    useEffect(() => {
        if (!active) return

        progress.value = withTiming(0, { duration: seconds * 1000 })

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setActive(false)
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                    onComplete?.()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [active])

    const handlePress = useCallback(() => {
        if (!active) {
            setRemaining(seconds)
            setActive(true)
            progress.value = 1
        } else {
            setActive(false)
            progress.value = 1
            setRemaining(seconds)
        }
    }, [active, seconds])

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }))

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60)
        const secs = s % 60
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
    }

    return (
        <Pressable style={styles.container} onPress={handlePress}>
            <View style={styles.track}>
                <Animated.View style={[styles.fill, progressStyle]} />
            </View>
            <View style={styles.labelRow}>
                <Ionicons
                    name={active ? 'pause' : 'timer-outline'}
                    size={14}
                    color={Colors.gold.primary}
                />
                <Text style={styles.label}>{formatTime(remaining)}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 6,
    },
    track: {
        height: 4,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    fill: {
        height: '100%',
        backgroundColor: Colors.gold.primary,
        borderRadius: 2,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    label: {
        ...Typography.caption,
        color: Colors.gold.primary,
    },
})
