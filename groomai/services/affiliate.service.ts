// services/affiliate.service.ts
// Phase 9 — Affiliate product recommendation engine + click tracking

import { Linking } from 'react-native'
import * as Haptics from 'expo-haptics'
import { supabase } from '@/lib/supabase'
import { analytics } from '@/lib/analytics'
import {
    AFFILIATE_PRODUCTS,
    AFFILIATES_ENABLED,
    DISPLAY_GROUP_ORDER,
    type AffiliateProduct,
    type ProductDisplayGroup,
} from '@/constants/affiliateProducts'
import { useUserStore } from '@/stores/user.store'

/** A group of products for a display section (e.g. "Skincare Essentials") */
export interface ProductGroup {
    group: ProductDisplayGroup
    products: AffiliateProduct[]
}

export const affiliateService = {
    /** Whether affiliate links are live (approved by networks). */
    get isEnabled(): boolean {
        return AFFILIATES_ENABLED
    },

    /**
     * Get personalized product recommendations filtered by
     * the user's skin type, budget, and whether they have a beard.
     */
    getRecommendationsForProfile(profile: {
        skin_type?: string | null
        skin_concerns?: string[] | null
        budget_range?: string | null
        has_beard?: boolean | null
    }): AffiliateProduct[] {
        const skinType = profile.skin_type ?? 'normal'

        return AFFILIATE_PRODUCTS.filter((product) => {
            // Must suit their skin type or be universal
            const suitableForSkin =
                product.suitableFor.includes(skinType) ||
                product.suitableFor.includes('all')

            // Must not be excluded
            const notExcluded = !product.notSuitableFor.includes(skinType)

            // Beard products only if user has a beard
            if (
                (product.category === 'beard_oil' || product.category === 'beard_balm') &&
                !profile.has_beard
            ) {
                return false
            }

            return suitableForSkin && notExcluded
        })
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)
    },

    /**
     * Get personalized recommendations grouped by display category.
     * Each group contains the top products for that category, filtered
     * by the user's skin type/beard/budget. Groups with 0 matching
     * products are omitted. Groups appear in DISPLAY_GROUP_ORDER.
     */
    getGroupedRecommendations(profile: {
        skin_type?: string | null
        skin_concerns?: string[] | null
        budget_range?: string | null
        has_beard?: boolean | null
    }): ProductGroup[] {
        const skinType = profile.skin_type ?? 'normal'

        // Filter all products for this user
        const suitable = AFFILIATE_PRODUCTS.filter((product) => {
            const suitableForSkin =
                product.suitableFor.includes(skinType) ||
                product.suitableFor.includes('all')
            const notExcluded = !product.notSuitableFor.includes(skinType)

            // Beard products only if user has a beard
            if (
                (product.category === 'beard_oil' || product.category === 'beard_balm') &&
                !profile.has_beard
            ) {
                return false
            }

            return suitableForSkin && notExcluded
        }).sort((a, b) => b.rating - a.rating)

        // Bucket into display groups
        const grouped = new Map<ProductDisplayGroup, AffiliateProduct[]>()
        for (const product of suitable) {
            const existing = grouped.get(product.displayGroup) ?? []
            // Max 3 per group — keeps UI clean
            if (existing.length < 3) {
                existing.push(product)
                grouped.set(product.displayGroup, existing)
            }
        }

        // Return in defined order, omit empty groups
        return DISPLAY_GROUP_ORDER
            .filter((g) => grouped.has(g))
            .map((g) => ({ group: g, products: grouped.get(g)! }))
    },

    /**
     * Find a product matching a routine step by keyword.
     * Used to show inline affiliate suggestions in routine steps.
     */
    getProductForRoutineStep(
        stepTitle: string,
        skinType: string
    ): AffiliateProduct | undefined {
        const title = stepTitle.toLowerCase()

        return AFFILIATE_PRODUCTS.find(
            (p) =>
                (p.routineKeywords ?? []).some((kw) => title.includes(kw)) &&
                (p.suitableFor.includes(skinType) || p.suitableFor.includes('all'))
        )
    },

    /**
     * Track an affiliate click in the database (fire-and-forget).
     */
    trackClick(
        userId: string,
        product: AffiliateProduct,
        source: string
    ): void {
        supabase
            .from('affiliate_clicks')
            .insert({
                user_id: userId,
                product_id: product.id,
                product_name: product.name,
                affiliate_url: product.amazonUrl,
                source,
            })
            .then(
                () => { },
                (error) => console.error('Failed to log affiliate click', error)
            )

        analytics.affiliateLinkClicked(
            product.id,
            product.name,
            source,
            useUserStore.getState().profile?.skin_type ?? undefined
        )
    },

    /**
     * Track click then open the affiliate URL.
     * When AFFILIATES_ENABLED is false, link opening is silently skipped.
     */
    async openAffiliateLink(
        product: AffiliateProduct,
        source: string
    ): Promise<void> {
        if (!AFFILIATES_ENABLED) return // Links not live yet

        const userId = useUserStore.getState().session?.user?.id
        if (userId) this.trackClick(userId, product, source)

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        const canOpen = await Linking.canOpenURL(product.amazonUrl)
        if (canOpen) Linking.openURL(product.amazonUrl)
    },
}
