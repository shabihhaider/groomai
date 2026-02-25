import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Colors } from '@/constants/colors'
import { BorderRadius } from '@/constants/spacing'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
    label: string
    onPress: () => void
    variant?: ButtonVariant
    loading?: boolean
    disabled?: boolean
    size?: ButtonSize
    fullWidth?: boolean
    icon?: React.ReactNode
}

export function Button({
    label,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    size = 'md',
    fullWidth = true,
    icon,
}: ButtonProps) {
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    function handlePressIn() {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 })
    }

    function handlePressOut() {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 })
    }

    function handlePress() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress()
    }

    const isDisabled = disabled || loading

    return (
        <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
            <Pressable
                style={[
                    styles.base,
                    variantStyles[variant],
                    sizeStyles[size],
                    isDisabled && styles.disabled,
                ]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
            >
                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? Colors.text.inverse : Colors.gold.primary}
                    />
                ) : (
                    <>
                        {icon}
                        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
                    </>
                )}
            </Pressable>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    fullWidth: { width: '100%' },
    base: {
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    disabled: { opacity: 0.4 },
    label: { fontSize: 16, fontWeight: '600' },
})

const variantStyles = StyleSheet.create({
    primary: { backgroundColor: Colors.gold.primary },
    secondary: { backgroundColor: Colors.bg.tertiary, borderWidth: 1, borderColor: Colors.gold.muted },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: Colors.error + '20' },
})

const labelStyles = StyleSheet.create({
    primary: { color: Colors.text.inverse },
    secondary: { color: Colors.text.primary },
    ghost: { color: Colors.gold.primary },
    danger: { color: Colors.error },
})

const sizeStyles = StyleSheet.create({
    sm: { height: 40, paddingHorizontal: 16 },
    md: { height: 52, paddingHorizontal: 24 },
    lg: { height: 60, paddingHorizontal: 32 },
})
