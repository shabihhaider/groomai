// services/hairloss.service.ts
// Phase 9 — Hair Loss Photo Tracker service layer

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user.store'
import { analytics } from '@/lib/analytics'

export type AngleKey = 'top' | 'front' | 'back' | 'left' | 'right'

export interface HairLossLog {
    id: string
    photo_url: string
    photo_angle: AngleKey
    logged_date: string
    user_id: string
}

export const hairLossService = {
    async uploadSession(photos: Record<AngleKey, string | null>): Promise<void> {
        const store = useUserStore.getState()
        const userId = store.session?.user?.id
        if (!userId) throw new Error('Not authenticated')

        const today = new Date().toISOString().split('T')[0]
        const month = today.substring(0, 7)
        const uploads: Promise<void>[] = []

        for (const [angle, uri] of Object.entries(photos)) {
            if (!uri) continue
            uploads.push(
                (async () => {
                    const response = await fetch(uri)
                    const blob = await response.blob()
                    const fileName = `${userId}/${today}/${angle}.jpg`

                    const { error: uploadError } = await supabase.storage
                        .from('hair-loss-photos')
                        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

                    if (uploadError) throw uploadError

                    await supabase.from('hair_loss_logs').insert({
                        user_id: userId,
                        photo_url: fileName,
                        photo_angle: angle,
                        logged_date: today,
                    })
                })()
            )
        }

        await Promise.all(uploads)
        await supabase.rpc('increment_xp', { user_id: userId, amount: 75 })
        analytics.hairLossSessionCompleted(month)
    },

    async getLogs(): Promise<HairLossLog[]> {
        const userId = useUserStore.getState().session?.user?.id
        if (!userId) return []

        const { data, error } = await supabase
            .from('hair_loss_logs')
            .select('id, photo_url, photo_angle, logged_date, user_id')
            .eq('user_id', userId)
            .order('logged_date', { ascending: false })

        if (error) throw error

        // Private bucket — must use signed URLs
        const withUrls = await Promise.all(
            (data ?? []).map(async (log: any) => {
                const { data: signed } = await supabase.storage
                    .from('hair-loss-photos')
                    .createSignedUrl(log.photo_url, 3600)
                return { ...log, photo_url: signed?.signedUrl ?? log.photo_url }
            })
        )

        return withUrls as HairLossLog[]
    },

    async hasSessionThisMonth(): Promise<boolean> {
        const userId = useUserStore.getState().session?.user?.id
        if (!userId) return false

        const yearMonth = new Date().toISOString().substring(0, 7)
        const monthStart = `${yearMonth}-01`
        const monthEnd = `${yearMonth}-31`

        const { count } = await supabase
            .from('hair_loss_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('logged_date', monthStart)
            .lte('logged_date', monthEnd)

        return (count ?? 0) > 0
    },

    groupByMonth(logs: HairLossLog[]): Record<string, HairLossLog[]> {
        const groups: Record<string, HairLossLog[]> = {}
        for (const log of logs) {
            const month = log.logged_date.substring(0, 7)
            if (!groups[month]) groups[month] = []
            groups[month].push(log)
        }
        return groups
    },
}
