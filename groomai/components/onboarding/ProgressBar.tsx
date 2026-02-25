import { View, StyleSheet, useWindowDimensions } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useEffect } from 'react'
import { Colors } from '@/constants/colors'

interface Props {
    step: number
    total: number
}

export function OnboardingProgress({ step, total }: Props) {
    const { width: screenWidth } = useWindowDimensions()
    const trackWidth = screenWidth - 48 // accounts for marginHorizontal: 24
    const targetWidth = (step / total) * trackWidth

    const animatedWidth = useSharedValue(0)

    useEffect(() => {
        animatedWidth.value = withSpring(targetWidth, { damping: 20, stiffness: 300 })
    }, [step, targetWidth])

    const animatedStyle = useAnimatedStyle(() => ({
        width: animatedWidth.value,
    }))

    return (
        <View style={styles.track}>
            <Animated.View style={[styles.fill, animatedStyle]} />
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        height: 3,
        backgroundColor: Colors.bg.tertiary,
        borderRadius: 2,
        marginHorizontal: 24,
        marginTop: 12,
    },
    fill: {
        height: 3,
        backgroundColor: Colors.gold.primary,
        borderRadius: 2,
    },
})
