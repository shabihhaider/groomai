import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Colors } from '@/constants/colors'
import { BorderRadius } from '@/constants/spacing'

type BadgeVariant = 'common' | 'rare' | 'epic' | 'legendary' | 'gold' | 'success' | 'error'

interface BadgeProps {
    label: string
    variant?: BadgeVariant
    style?: ViewStyle
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
    common: { bg: Colors.rarity.common + '25', text: Colors.rarity.common },
    rare: { bg: Colors.rarity.rare + '25', text: Colors.rarity.rare },
    epic: { bg: Colors.rarity.epic + '25', text: Colors.rarity.epic },
    legendary: { bg: Colors.gold.primary + '25', text: Colors.gold.primary },
    gold: { bg: Colors.gold.primary + '25', text: Colors.gold.primary },
    success: { bg: Colors.success + '25', text: Colors.success },
    error: { bg: Colors.error + '25', text: Colors.error },
}

export function Badge({ label, variant = 'gold', style }: BadgeProps) {
    const colors = VARIANT_COLORS[variant]

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
})
