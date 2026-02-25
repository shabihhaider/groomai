// hooks/useBarber.ts
// React Query hooks for the Barber Translator feature

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { barberService, type HairstyleFilters } from '@/services/barber.service'
import { useUserStore } from '@/stores/user.store'
import { useMemo } from 'react'

// ── Hairstyle discovery ────────────────────────────────────────────────────

export function useHairstyles(filters: HairstyleFilters = {}) {
    // Hairstyle data is local — no async needed, but wrapped in useQuery for
    // consistent access pattern and future Supabase enrichment
    return useQuery({
        queryKey: ['hairstyles', filters],
        queryFn: () => barberService.getHairstyles(filters),
        staleTime: Infinity, // local constant never goes stale
    })
}

export function useHairstyleBySlug(slug: string | undefined) {
    return useQuery({
        queryKey: ['hairstyle', slug],
        queryFn: () => barberService.getHairstyleBySlug(slug!),
        enabled: !!slug,
        staleTime: Infinity,
    })
}

export function useFaceShapeHairstyles() {
    const profile = useUserStore((s) => s.profile)
    const faceShape = profile?.face_shape

    return useQuery({
        queryKey: ['hairstyles-face-shape', faceShape],
        queryFn: () =>
            faceShape ? barberService.getForFaceShape(faceShape) : [],
        staleTime: Infinity,
    })
}

export function useTrendingHairstyles() {
    return useQuery({
        queryKey: ['hairstyles-trending'],
        queryFn: () => barberService.getTrending(),
        staleTime: Infinity,
    })
}

// ── Saved hairstyles ───────────────────────────────────────────────────────

export function useSavedHairstyleIds() {
    const userId = useUserStore((s) => s.session?.user?.id)

    return useQuery({
        queryKey: ['saved-hairstyles', userId],
        queryFn: () => barberService.getSavedHairstyleIds(userId!),
        enabled: !!userId,
    })
}

export function useSaveHairstyle() {
    const queryClient = useQueryClient()
    const userId = useUserStore((s) => s.session?.user?.id)

    return useMutation({
        mutationFn: async (hairstyleId: string) => {
            if (!userId) throw new Error('Not authenticated')
            return barberService.saveHairstyle(userId, hairstyleId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-hairstyles'] })
        },
    })
}

export function useUnsaveHairstyle() {
    const queryClient = useQueryClient()
    const userId = useUserStore((s) => s.session?.user?.id)

    return useMutation({
        mutationFn: async (hairstyleId: string) => {
            if (!userId) throw new Error('Not authenticated')
            return barberService.unsaveHairstyle(userId, hairstyleId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-hairstyles'] })
        },
    })
}

// ── AI Celebrity Breakdown ─────────────────────────────────────────────────

export function useAnalyzeHairstyle() {
    return useMutation({
        mutationFn: (imageBase64: string) =>
            barberService.analyzeHairstylePhoto(imageBase64),
    })
}
