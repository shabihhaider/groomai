import { View, StyleSheet, ViewStyle } from 'react-native'
import { Colors } from '@/constants/colors'
import { BorderRadius, Spacing } from '@/constants/spacing'

type CardVariant = 'default' | 'elevated' | 'gold' | 'glass'

interface CardProps {
    children: React.ReactNode
    variant?: CardVariant
    style?: ViewStyle
}

export function Card({ children, variant = 'default', style }: CardProps) {
    return (
        <View style={[styles.base, variantStyles[variant], style]}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        overflow: 'hidden',
    },
})

const variantStyles = StyleSheet.create({
    default: {
        backgroundColor: Colors.bg.secondary,
    },
    elevated: {
        backgroundColor: Colors.bg.tertiary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    gold: {
        backgroundColor: Colors.bg.secondary,
        borderWidth: 1,
        borderColor: Colors.gold.muted,
    },
    glass: {
        backgroundColor: Colors.bg.secondary,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
})
