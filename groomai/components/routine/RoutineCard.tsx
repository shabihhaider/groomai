// components/routine/RoutineCard.tsx
import { useEffect } from 'react'
import { Text, Pressable, StyleSheet } from 'react-native'
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'

interface RoutineCardProps {
    name: string
    type: 'morning' | 'night' | 'custom'
    completed: number
    total: number
    index: number
    onPress: () => void
}

export function RoutineCard({ name, type, completed, total, index, onPress }: RoutineCardProps) {
    const progress = total > 0 ? completed / total : 0
    const isComplete = completed === total && total > 0
    const icon = type === 'morning' ? 'sunny' : type === 'night' ? 'moon' : 'list'

    // Animated progress bar
    const animatedWidth = useSharedValue(0)
    useEffect(() => {
        animatedWidth.value = withTiming(progress, {
            duration: 700,
            easing: Easing.out(Easing.cubic),
        })
    }, [progress])

    const progressFillStyle = useAnimatedStyle(() => ({
        width: `${animatedWidth.value * 100}%`,
    }))

    // Press spring scale
    const scale = useSharedValue(1)
    const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

    function handlePressIn() {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 })
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
    function handlePressOut() {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 })
    }

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).duration(400)}
            style={scaleStyle}
        >
            <Pressable
                style={[
                    styles.card,
                    isComplete && styles.cardComplete,
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {/* Icon */}
                <Animated.View style={[styles.iconCircle, isComplete && styles.iconCircleComplete]}>
                    <Ionicons
                        name={icon as any}
                        size={24}
                        color={isComplete ? Colors.success : Colors.gold.primary}
                    />
                </Animated.View>

                {/* Info */}
                <Text style={styles.title}>{name}</Text>
                <Text style={[styles.subtitle, isComplete && styles.subtitleComplete]}>
                    {isComplete ? '✓ Complete' : `${completed}/${total} steps`}
                </Text>

                {/* Animated progress bar */}
                <Animated.View style={styles.progressTrack}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                backgroundColor: isComplete ? Colors.success : Colors.gold.primary,
                            },
                            progressFillStyle,
                        ]}
                    />
                </Animated.View>
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.bg.tertiary,
        minHeight: 160,
    },
    cardComplete: {
        borderColor: Colors.success + '50',
        backgroundColor: '#0f1f0f',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.overlay.gold,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    iconCircleComplete: {
        backgroundColor: Colors.success + '20',
    },
    title: {
        ...Typography.h3,
        color: Colors.text.primary,
        marginBottom: 4,
    },
    subtitle: {
        ...Typography.small,
        color: Colors.text.secondary,
        marginBottom: Spacing.sm,
    },
    subtitleComplete: {
        color: Colors.success,
        fontWeight: '600',
    },
    progressTrack: {
        height: 6,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 'auto',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
})
