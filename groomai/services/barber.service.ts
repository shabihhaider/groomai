// services/barber.service.ts
// Barber Translator feature — hairstyle CRUD + saved hairstyles

import { supabase } from '@/lib/supabase'
import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { HAIRSTYLES, filterHairstyles, type Hairstyle, type FaceShape } from '@/constants/hairstyles'
import { useUserStore } from '@/stores/user.store'

export interface HairstyleFilters {
    query?: string
    category?: string
    faceShape?: string
    isPremiumUser?: boolean
}

export const barberService = {
    // ── Fetch & Filter ──────────────────────────────────────────────────────

    getHairstyles(filters: HairstyleFilters = {}): Hairstyle[] {
        return filterHairstyles(HAIRSTYLES, filters)
    },

    getHairstyleBySlug(slug: string): Hairstyle | undefined {
        return HAIRSTYLES.find((h) => h.slug === slug)
    },

    getHairstyleById(id: string): Hairstyle | undefined {
        return HAIRSTYLES.find((h) => h.id === id)
    },

    getForFaceShape(faceShape: string): Hairstyle[] {
        return HAIRSTYLES.filter((h) => h.faceShapes.includes(faceShape as FaceShape))
            .sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0))
    },

    getTrending(): Hairstyle[] {
        return HAIRSTYLES.filter((h) => h.isTrending)
    },

    // ── Saved Hairstyles ────────────────────────────────────────────────────

    async getSavedHairstyleIds(userId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('saved_hairstyles')
            .select('hairstyle_id')
            .eq('user_id', userId)

        if (error) throw error
        return (data ?? []).map((row: any) => row.hairstyle_id)
    },

    async saveHairstyle(userId: string, hairstyleId: string): Promise<void> {
        const { error } = await supabase
            .from('saved_hairstyles')
            .upsert(
                { user_id: userId, hairstyle_id: hairstyleId },
                { onConflict: 'user_id,hairstyle_id' }
            )
        if (error) throw error
    },

    async unsaveHairstyle(userId: string, hairstyleId: string): Promise<void> {
        const { error } = await supabase
            .from('saved_hairstyles')
            .delete()
            .eq('user_id', userId)
            .eq('hairstyle_id', hairstyleId)
        if (error) throw error
    },

    // ── Analytics ──────────────────────────────────────────────────────────

    /** Fire-and-forget view count increment */
    incrementViewCount(slug: string): void {
        supabase
            .rpc('increment_hairstyle_view', { hairstyle_slug: slug })
            .then(
                () => { },
                (error) => console.error('Failed to increment view count', error)
            )
    },

    // ── Celebrity AI Breakdown ──────────────────────────────────────────────

    async analyzeHairstylePhoto(imageBase64: string): Promise<{
        style_name: string
        description: string
        barber_script: string
        guard_numbers: Record<string, string>
        styling_product: string
        maintenance: string
    }> {
        const store = useUserStore.getState()
        const userId = store.session?.user?.id
        const subscriptionStatus = store.profile?.subscription_status ?? 'free'

        return await invokeEdgeFunction('analyze-hairstyle', {
            imageBase64,
            userId,
            subscriptionStatus,
        })
    },
}
