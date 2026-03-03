// hooks/useAI.ts
// React Query hooks for all Phase 7 AI features

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { skinService } from '@/services/skin.service'
import { productService } from '@/services/product.service'
import { supabase } from '@/lib/supabase'
import { invokeEdgeFunction } from '@/lib/edgeFunctions'
import { useUserStore } from '@/stores/user.store'

// ── Skin Analysis ──────────────────────────────────────────────────────────

export function useSkinAnalysis() {
    return useMutation({
        mutationFn: (imageBase64: string) => skinService.analyze(imageBase64),
    })
}

export function useSkinAnalysisLogs() {
    return useQuery({
        queryKey: ['skin-analysis-logs'],
        queryFn: () => skinService.getLogs(),
    })
}

// ── Product Scanner ────────────────────────────────────────────────────────

export function useProductLookup() {
    return useMutation({
        mutationFn: async (barcode: string) => {
            const product = await productService.lookupBarcode(barcode)
            if (!product.found) {
                throw Object.assign(new Error('Product not found in database'), { code: 'not_found' })
            }
            const analysis = await productService.analyzeIngredients({
                barcode,
                ...product,
            })
            return { product, analysis }
        },
    })
}

export function useProductScans() {
    return useQuery({
        queryKey: ['product-scans'],
        queryFn: () => productService.getScans(),
    })
}

// ── AI Routine Generator ───────────────────────────────────────────────────

export function useGenerateRoutine() {
    const profile = useUserStore((s) => s.profile)
    const userId = useUserStore((s) => s.session?.user?.id)

    return useMutation({
        mutationFn: async () => {
            const subscriptionStatus = profile?.subscription_status ?? 'free'
            return await invokeEdgeFunction<{ morning: any[]; night: any[]; remaining?: number }>('generate-routine', {
                userId,
                subscriptionStatus,
                profile,
            })
        },
    })
}

export function useSaveGeneratedRoutine() {
    const queryClient = useQueryClient()
    const userId = useUserStore((s) => s.session?.user?.id)

    return useMutation({
        mutationFn: async (steps: { type: 'morning' | 'night'; steps: any[] }[]) => {
            if (!userId) throw new Error('Not authenticated')

            const insertedRoutines = []
            for (const { type, steps: routineSteps } of steps) {
                // Create routine
                const { data: routine, error: routineError } = await supabase
                    .from('routines')
                    .insert({ user_id: userId, name: `AI ${type.charAt(0).toUpperCase() + type.slice(1)} Routine`, type, is_ai_generated: true })
                    .select('id')
                    .single()
                if (routineError) throw routineError

                // Insert steps
                const stepRows = routineSteps.map((s: any, i: number) => ({
                    routine_id: routine.id,
                    step_order: i + 1,
                    title: s.title,
                    description: s.description,
                    category: s.category ?? 'face',
                    duration_seconds: s.duration_seconds ?? 60,
                }))
                const { error: stepsError } = await supabase.from('routine_steps').insert(stepRows)
                if (stepsError) throw stepsError

                insertedRoutines.push(routine)
            }
            return insertedRoutines
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] })
        },
    })
}
