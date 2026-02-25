// supabase/functions/_shared/rateLimiter.ts
// Shared rate limiter for all AI Edge Functions
// @ts-ignore: Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

const DAILY_LIMITS = {
    skin_analysis: { free: 0, trial: 1, premium: 3, lifetime: 5 },
    generate_routine: { free: 0, trial: 1, premium: 5, lifetime: 10 },
    analyze_product: { free: 0, trial: 2, premium: 10, lifetime: 20 },
    analyze_hairstyle: { free: 0, trial: 1, premium: 5, lifetime: 10 },
} as const

type Feature = keyof typeof DAILY_LIMITS
type SubscriptionTier = keyof typeof DAILY_LIMITS[Feature]

export async function checkRateLimit(
    userId: string,
    feature: Feature,
    subscriptionStatus: string
): Promise<{ allowed: boolean; remaining: number }> {
    const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const today = new Date().toISOString().split('T')[0]
    const tier = subscriptionStatus as SubscriptionTier
    const limit = DAILY_LIMITS[feature]?.[tier] ?? 0

    const { count } = await admin
        .from('ai_usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('feature', feature)
        .eq('used_date', today)

    const used = count ?? 0
    return { allowed: used < limit, remaining: Math.max(0, limit - used) }
}

export async function logAIUsage(
    userId: string,
    feature: Feature,
    meta?: Record<string, unknown>
): Promise<void> {
    const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await admin.from('ai_usage_logs').insert({
        user_id: userId,
        feature,
        meta: meta ?? null,
    })
}
