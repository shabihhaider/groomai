// hooks/useAffiliate.ts
// Phase 9 — React Query hooks for affiliate product recommendations + scan history

import { useQuery } from '@tanstack/react-query'
import { affiliateService } from '@/services/affiliate.service'
import { productService } from '@/services/product.service'
import { useUserStore } from '@/stores/user.store'

/**
 * Returns top affiliate product recommendations personalised to the user's
 * skin type, beard status, and budget. Data is instant (local filter — no network).
 */
export function useAffiliateRecommendations() {
    const profile = useUserStore((s) => s.profile)

    return useQuery({
        queryKey: ['affiliate-recommendations', profile?.skin_type, profile?.has_beard, profile?.budget_range],
        queryFn: () =>
            affiliateService.getRecommendationsForProfile({
                skin_type: profile?.skin_type,
                skin_concerns: profile?.skin_concerns,
                budget_range: profile?.budget_range,
                has_beard: profile?.has_beard,
            }),
        staleTime: Infinity,  // local data, never stale
        enabled: !!profile,
    })
}

/**
 * Returns the user's product scan history from Supabase.
 */
export function useProductScans() {
    return useQuery({
        queryKey: ['product-scans'],
        queryFn: () => productService.getScans(),
    })
}
