// hooks/useHabits.ts
// React Query hooks for habit tracking — streaks, badges, weekly activity

import { useQuery } from '@tanstack/react-query'
import { habitService, badgeService } from '@/services/habit.service'
import { useUserStore } from '@/stores/user.store'
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns'

// ── Get user's streak data ──
export function useStreak() {
    const userId = useUserStore((s) => s.session?.user?.id)

    return useQuery({
        queryKey: ['streak', userId],
        queryFn: () => habitService.getStreak(userId!),
        enabled: !!userId,
    })
}

// ── Get user's earned badges with badge details ──
export function useUserBadges() {
    const userId = useUserStore((s) => s.session?.user?.id)

    return useQuery({
        queryKey: ['user-badges', userId],
        queryFn: () => badgeService.getUserBadges(userId!),
        enabled: !!userId,
    })
}

// ── Get all badges (master list) ──
export function useAllBadges() {
    return useQuery({
        queryKey: ['all-badges'],
        queryFn: async () => {
            const { supabase } = await import('@/lib/supabase')
            const { data, error } = await supabase.from('badges').select('*').order('created_at')
            if (error) throw error
            return data ?? []
        },
    })
}

// ── Get weekly activity (last 12 weeks) ──
export function useWeeklyActivity() {
    const userId = useUserStore((s) => s.session?.user?.id)

    return useQuery({
        queryKey: ['weekly-activity', userId],
        queryFn: async () => {
            if (!userId) return []
            const end = format(new Date(), 'yyyy-MM-dd')
            const start = format(subWeeks(new Date(), 12), 'yyyy-MM-dd')
            return habitService.getWeeklyActivity(userId, start, end)
        },
        enabled: !!userId,
    })
}

// ── Helper: compute completion ratio for a routine from today's logs ──
export function getCompletionRatio(
    routineSteps: { id: string }[],
    todayLogs: { routine_step_id: string; completed: boolean }[]
) {
    if (!routineSteps.length) return { completed: 0, total: 0 }

    const stepIds = new Set(routineSteps.map((s) => s.id))
    const completedCount = todayLogs.filter(
        (log) => stepIds.has(log.routine_step_id) && log.completed
    ).length

    return { completed: completedCount, total: routineSteps.length }
}
