// components/tracker/XPToast.tsx
// Floating "+N XP ⚡" animated toast using Reanimated

import { useEffect } from 'react'
import { Text, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withSpring,
    withDelay,
    withTiming,
    runOnJS,
} from 'react-native-reanimated'
import { Colors } from '@/constants/colors'

interface XPToastProps {
    amount: number
    onDone?: () => void
}

export function XPToast({ amount, onDone }: XPToastProps) {
    const translateY = useSharedValue(0)
    const opacity = useSharedValue(1)

    useEffect(() => {
        translateY.value = withSequence(
            withSpring(-40, { damping: 8, stiffness: 200 }),
            withDelay(800, withTiming(-80, { duration: 400 }))
        )
        opacity.value = withDelay(
            900,
            withTiming(0, { duration: 300 }, (finished) => {
                if (finished && onDone) {
                    runOnJS(onDone)()
                }
            })
        )
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }))

    return (
        <Animated.View style={[styles.toast, animatedStyle]}>
            <Text style={styles.text}>+{amount} XP ⚡</Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: Colors.gold.primary + '30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    text: {
        color: Colors.gold.light,
        fontSize: 16,
        fontWeight: '700',
    },
})
