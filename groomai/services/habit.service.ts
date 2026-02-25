import { supabase } from '@/lib/supabase'

export const habitService = {
    async getTodayLogs(userId: string) {
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('logged_date', today)

        if (error) throw error
        return data ?? []
    },

    async completeStep(userId: string, stepId: string) {
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('habit_logs')
            .upsert(
                {
                    user_id: userId,
                    routine_step_id: stepId,
                    logged_date: today,
                    completed: true,
                    completed_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,routine_step_id,logged_date' }
            )
            .select()
            .single()

        if (error) throw error

        // Award XP for completing a step (+10)
        await habitService.awardXP(userId, 10)

        return data
    },

    async uncompleteStep(userId: string, stepId: string) {
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('habit_logs')
            .upsert(
                {
                    user_id: userId,
                    routine_step_id: stepId,
                    logged_date: today,
                    completed: false,
                    completed_at: null,
                },
                { onConflict: 'user_id,routine_step_id,logged_date' }
            )
            .select()
            .single()

        if (error) throw error

        // Deduct XP (-10, GREATEST(0,...) in SQL prevents going negative)
        await habitService.awardXP(userId, -10)

        return data
    },

    async awardXP(userId: string, amount: number) {
        const { error } = await supabase.rpc('increment_xp', {
            user_id: userId,
            amount,
        })
        if (error) throw error
    },

    async getStreak(userId: string) {
        const { data, error } = await supabase
            .from('streaks')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) throw error
        return data
    },

    async getWeeklyActivity(userId: string, startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('habit_logs')
            .select('logged_date, completed')
            .eq('user_id', userId)
            .eq('completed', true)
            .gte('logged_date', startDate)
            .lte('logged_date', endDate)

        if (error) throw error
        return data ?? []
    },

    async getTotalCheckins(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('habit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('completed', true)

        if (error) throw error
        return count ?? 0
    },
}

export const badgeService = {
    async checkAndAward(userId: string): Promise<{ slug: string; name: string; description: string; xp_reward: number; rarity: string } | null> {
        // 1. Get user stats
        const [streak, profile, totalCheckins, earnedBadges] = await Promise.all([
            supabase.from('streaks').select('*').eq('user_id', userId).single(),
            supabase.from('profiles').select('level, total_xp').eq('id', userId).single(),
            habitService.getTotalCheckins(userId),
            supabase.from('user_badges').select('badge_id').eq('user_id', userId),
        ])

        const streakData = streak.data
        const profileData = profile.data
        const earnedBadgeIds = new Set((earnedBadges.data ?? []).map((b) => b.badge_id))

        // 2. Get all badges
        const { data: allBadges } = await supabase.from('badges').select('*')
        if (!allBadges) return null

        // 3. Check each badge's unlock condition
        for (const badge of allBadges) {
            if (earnedBadgeIds.has(badge.id)) continue // Already earned

            const condition = badge.unlock_condition as { type: string; value?: number | string } | null
            if (!condition) continue

            let earned = false

            switch (condition.type) {
                case 'streak':
                    earned = (streakData?.current_streak ?? 0) >= (condition.value as number)
                    break
                case 'checkin_count':
                    earned = totalCheckins >= (condition.value as number)
                    break
                case 'level':
                    earned = (profileData?.level ?? 1) >= (condition.value as number)
                    break
                // Feature and special badges are awarded by their respective services
                default:
                    break
            }

            if (earned) {
                // Insert badge
                const { error } = await supabase
                    .from('user_badges')
                    .insert({ user_id: userId, badge_id: badge.id })

                if (error) {
                    // Probably a duplicate — skip
                    if (error.code === '23505') continue
                    throw error
                }

                // Award badge XP
                if (badge.xp_reward > 0) {
                    await habitService.awardXP(userId, badge.xp_reward)
                }

                return {
                    slug: badge.slug,
                    name: badge.name,
                    description: badge.description,
                    xp_reward: badge.xp_reward,
                    rarity: badge.rarity,
                }
            }
        }

        return null
    },

    async getUserBadges(userId: string) {
        const { data, error } = await supabase
            .from('user_badges')
            .select('*, badges(*)')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })

        if (error) throw error
        return data ?? []
    },

    async markSeen(userId: string, badgeId: string) {
        const { error } = await supabase
            .from('user_badges')
            .update({ is_seen: true })
            .eq('user_id', userId)
            .eq('badge_id', badgeId)

        if (error) throw error
    },
}
