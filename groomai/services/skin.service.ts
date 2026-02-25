// services/skin.service.ts
// Phase 7 — Skin Analysis service layer

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user.store'

export interface SkinConcern {
    name: string
    severity: 'mild' | 'moderate' | 'significant'
    score: number
    tip: string
}

export interface Recommendation {
    type: 'product' | 'habit' | 'ingredient'
    title: string
    description: string
}

export interface SkinAnalysisResult {
    skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive'
    concerns: SkinConcern[]
    overallScore: number
    summary: string
    recommendations: Recommendation[]
    error?: string
    remaining?: number
}

export interface SkinAnalysisLog {
    id: string
    photo_url: string | null
    analysis_result: SkinAnalysisResult
    detected_skin_type: string
    detected_concerns: string[]
    confidence_score: number | null
    analyzed_at: string
}

export const skinService = {
    async analyze(imageBase64: string): Promise<SkinAnalysisResult> {
        const store = useUserStore.getState()
        const userId = store.session?.user?.id
        const subscriptionStatus = store.profile?.subscription_status ?? 'free'

        if (!userId) throw new Error('Not authenticated')

        const { data, error } = await supabase.functions.invoke('analyze-skin', {
            body: { userId, imageBase64, subscriptionStatus },
        })

        if (error) throw error
        if (data?.error === 'rate_limit_exceeded') {
            throw Object.assign(new Error(data.message), { code: 'rate_limit_exceeded' })
        }
        return data as SkinAnalysisResult
    },

    async getLogs(): Promise<SkinAnalysisLog[]> {
        const userId = useUserStore.getState().session?.user?.id
        if (!userId) return []

        const { data, error } = await supabase
            .from('skin_analysis_logs')
            .select('id, photo_url, analysis_result, detected_skin_type, detected_concerns, confidence_score, analyzed_at')
            .eq('user_id', userId)
            .order('analyzed_at', { ascending: false })
            .limit(10)

        if (error) throw error
        return data ?? []
    },
}
