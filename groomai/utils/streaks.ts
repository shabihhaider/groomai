// utils/streaks.ts
// Streak logic — compare today vs last_active_date, handle day boundaries with date-fns

import { supabase } from '@/lib/supabase'
import { format, subDays, isEqual, parseISO } from 'date-fns'

export async function updateStreak(userId: string) {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    const { data: streak, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error || !streak) return null

    let newStreak = streak.current_streak

    if (streak.last_active_date === today) {
        // Already updated today — no change
        return streak
    } else if (streak.last_active_date === yesterday) {
        // Consecutive day — increment
        newStreak = streak.current_streak + 1
    } else {
        // Streak broken — restart
        newStreak = 1
    }

    const longestStreak = Math.max(newStreak, streak.longest_streak)

    const { data: updatedStreak, error: updateError } = await supabase
        .from('streaks')
        .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_active_date: today,
            streak_started_at: newStreak === 1 ? today : streak.streak_started_at,
            total_days_completed: streak.total_days_completed + 1,
        })
        .eq('user_id', userId)
        .select()
        .single()

    if (updateError) throw updateError

    // Sync to profiles for quick access
    await supabase
        .from('profiles')
        .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_checkin_date: today,
        })
        .eq('id', userId)

    return updatedStreak
}

export function getStreakStatus(lastActiveDate: string | null): 'active' | 'at_risk' | 'broken' {
    if (!lastActiveDate) return 'broken'

    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    if (lastActiveDate === today) return 'active'
    if (lastActiveDate === yesterday) return 'at_risk'
    return 'broken'
}

export function getDaysUntilMilestone(currentStreak: number): { milestone: number; remaining: number } | null {
    const milestones = [7, 14, 30, 60, 100]
    const nextMilestone = milestones.find((m) => m > currentStreak)
    if (!nextMilestone) return null
    return { milestone: nextMilestone, remaining: nextMilestone - currentStreak }
}
