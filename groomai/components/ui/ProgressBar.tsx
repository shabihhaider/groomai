import { useEffect } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated'
import { Colors } from '@/constants/colors'
import { BorderRadius } from '@/constants/spacing'

interface ProgressBarProps {
    progress: number // 0 to 1
    height?: number
    color?: string
    trackColor?: string
    style?: ViewStyle
    animated?: boolean
}

export function ProgressBar({
    progress,
    height = 8,
    color = Colors.gold.primary,
    trackColor = Colors.bg.tertiary,
    style,
    animated = true,
}: ProgressBarProps) {
    const animatedProgress = useSharedValue(0)

    useEffect(() => {
        const clampedProgress = Math.min(Math.max(progress, 0), 1)
        if (animated) {
            animatedProgress.value = withTiming(clampedProgress, {
                duration: 600,
                easing: Easing.out(Easing.cubic),
            })
        } else {
            animatedProgress.value = clampedProgress
        }
    }, [progress])

    const fillStyle = useAnimatedStyle(() => ({
        width: `${animatedProgress.value * 100}%`,
    }))

    return (
        <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }, style]}>
            <Animated.View
                style={[
                    styles.fill,
                    { backgroundColor: color, borderRadius: height / 2 },
                    fillStyle,
                ]}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        overflow: 'hidden',
        width: '100%',
    },
    fill: {
        height: '100%',
    },
})
