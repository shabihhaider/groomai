// components/ui/AffiliateProductCard.tsx
// Reusable affiliate product card — used in routine steps, skin analysis results, home tab

import { Pressable, View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { affiliateService } from '@/services/affiliate.service'
import { Colors } from '@/constants/colors'
import { Typography } from '@/constants/typography'
import { Spacing, BorderRadius } from '@/constants/spacing'
import { type AffiliateProduct } from '@/constants/affiliateProducts'

interface AffiliateProductCardProps {
    product: AffiliateProduct
    source: string
    /** Compact = inline row used in routine step */
    compact?: boolean
}

export function AffiliateProductCard({ product, source, compact }: AffiliateProductCardProps) {
    function handlePress() {
        affiliateService.openAffiliateLink(product, source)
    }

    if (compact) {
        return (
            <Pressable
                style={({ pressed }) => [styles.compact, pressed && { opacity: 0.75 }]}
                onPress={handlePress}
            >
                <Text style={styles.compactEmoji}>💡</Text>
                <View style={styles.compactBody}>
                    <Text style={styles.compactBrand}>{product.brand}</Text>
                    <Text style={styles.compactName} numberOfLines={1}>{product.name}</Text>
                </View>
                <Text style={styles.compactPrice}>{product.price}</Text>
                <Ionicons name="open-outline" size={14} color={Colors.gold.primary} />
            </Pressable>
        )
    }

    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
            onPress={handlePress}
        >
            <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={Colors.gold.primary} />
                <Text style={styles.rating}>{product.rating}</Text>
                <Text style={styles.reviewCount}>({product.reviewCount.toLocaleString()})</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.cardInfo}>
                    <Text style={styles.brand}>{product.brand}</Text>
                    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.price}>{product.price}</Text>
                </View>
                <View style={styles.ctaBtn}>
                    <Text style={styles.ctaText}>Shop</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.bg.primary} />
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    compact: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.sm, padding: Spacing.sm,
        borderWidth: 1, borderColor: Colors.gold.muted + '44',
        marginTop: Spacing.xs,
    },
    compactEmoji: { fontSize: 14 },
    compactBody: { flex: 1 },
    compactBrand: { ...Typography.caption, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    compactName: { ...Typography.small, color: Colors.text.primary },
    compactPrice: { ...Typography.small, color: Colors.gold.primary, fontWeight: '600', marginRight: 2 },

    card: {
        backgroundColor: Colors.bg.secondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        borderWidth: 1, borderColor: Colors.bg.tertiary,
        gap: 6,
    },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    rating: { ...Typography.caption, color: Colors.gold.primary, fontWeight: '700' },
    reviewCount: { ...Typography.caption, color: Colors.text.tertiary },
    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    cardInfo: { flex: 1, gap: 2 },
    brand: { ...Typography.caption, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
    name: { ...Typography.bodyMedium, color: Colors.text.primary },
    price: { ...Typography.body, color: Colors.gold.primary, fontWeight: '600', marginTop: 2 },
    ctaBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.gold.primary, borderRadius: BorderRadius.sm,
        paddingHorizontal: 12, paddingVertical: 6,
    },
    ctaText: { ...Typography.small, color: Colors.bg.primary, fontWeight: '700' },
})
