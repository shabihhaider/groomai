import { useEffect } from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated'
import { Colors } from '@/constants/colors'
import { BorderRadius } from '@/constants/spacing'

interface SkeletonProps {
    width: number | `${number}%`
    height: number
    borderRadius?: number
    style?: ViewStyle
}

export function Skeleton({
    width,
    height,
    borderRadius = BorderRadius.sm,
    style,
}: SkeletonProps) {
    const progress = useSharedValue(0)

    useEffect(() => {
        progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true)
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            [Colors.bg.tertiary, '#2A2A2A']
        ),
    }))

    return (
        <Animated.View
            style={[
                { width, height, borderRadius },
                animatedStyle,
                style,
            ]}
        />
    )
}
