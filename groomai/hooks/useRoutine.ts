// hooks/useRoutine.ts
// React Query hooks for routines — fetching, step completion, seeding

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routineService } from '@/services/routine.service'
import { habitService, badgeService } from '@/services/habit.service'
import { useUserStore } from '@/stores/user.store'
import { updateStreak } from '@/utils/streaks'
import { router } from 'expo-router'

// ── Fetch user's active routines ──
export function useRoutines() {
    const userId = useUserStore((s) => s.session?.user?.id)

    return useQuery({
        queryKey: ['routines', userId],
        queryFn: () => routineService.getRoutines(userId!),
        enabled: !!userId,
    })
}

// ── Fetch steps for a specific routine ──
export function useRoutineSteps(routineId: string | undefined) {
    return useQuery({
        queryKey: ['routine-steps', routineId],
        queryFn: () => routineService.getRoutineSteps(routineId!),
        enabled: !!routineId,
    })
}

// ── Fetch today's habit logs ──
export function useTodayLogs() {
    const userId = useUserStore((s) => s.session?.user?.id)

    return useQuery({
        queryKey: ['today-logs', userId],
        queryFn: () => habitService.getTodayLogs(userId!),
        enabled: !!userId,
    })
}

// ── Complete a step ──
export function useCompleteStep() {
    const queryClient = useQueryClient()
    const userId = useUserStore((s) => s.session?.user?.id)

    return useMutation({
        mutationFn: async (stepId: string) => {
            if (!userId) throw new Error('Not authenticated')
            return habitService.completeStep(userId, stepId)
        },
        onSuccess: async () => {
            // Invalidate today's logs + profile to reflect XP
            queryClient.invalidateQueries({ queryKey: ['today-logs'] })
            queryClient.invalidateQueries({ queryKey: ['profile'] })

            if (!userId) return

            // Update streak
            await updateStreak(userId)
            queryClient.invalidateQueries({ queryKey: ['streak'] })

            // Check for badge unlock — callers handle navigation
            const badge = await badgeService.checkAndAward(userId)
            if (badge) {
                router.push({
                    pathname: '/badge-unlock',
                    params: {
                        name: badge.name,
                        description: badge.description,
                        xpReward: String(badge.xp_reward),
                        rarity: badge.rarity,
                        slug: badge.slug,
                    },
                })
                queryClient.invalidateQueries({ queryKey: ['user-badges'] })
            }
        },
    })
}

// ── Uncomplete a step ──
export function useUncompleteStep() {
    const queryClient = useQueryClient()
    const userId = useUserStore((s) => s.session?.user?.id)

    return useMutation({
        mutationFn: async (stepId: string) => {
            if (!userId) throw new Error('Not authenticated')
            return habitService.uncompleteStep(userId, stepId)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['today-logs'] })
            queryClient.invalidateQueries({ queryKey: ['profile'] })
        },
    })
}

// ── Seed default routines ──
export function useSeedRoutines() {
    const queryClient = useQueryClient()
    const userId = useUserStore((s) => s.session?.user?.id)
    const skinType = useUserStore((s) => s.profile?.skin_type)

    return useMutation({
        mutationFn: async () => {
            if (!userId) throw new Error('Not authenticated')
            return routineService.seedDefaultRoutines(userId, skinType ?? 'normal')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] })
        },
    })
}

// ── Create custom routine (premium) ──
export function useCreateRoutine() {
    const queryClient = useQueryClient()
    const userId = useUserStore((s) => s.session?.user?.id)

    return useMutation({
        mutationFn: async (data: { name: string; type: 'morning' | 'night' | 'custom' }) => {
            if (!userId) throw new Error('Not authenticated')
            return routineService.createRoutine(userId, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] })
        },
    })
}
