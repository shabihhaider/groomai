// supabase/functions/revenuecat-webhook/index.ts
// Deploy: supabase functions deploy revenuecat-webhook
// Set secret: supabase secrets set REVENUECAT_WEBHOOK_SECRET=<your_secret>

// @ts-ignore: Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: any;

Deno.serve(async (req: Request) => {
    // ── 1. Auth verification ──
    const authHeader = req.headers.get('Authorization')
    const expectedSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
        return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const event = body.event

    if (!event?.id || !event?.app_user_id) {
        return new Response('Invalid payload', { status: 400 })
    }

    const admin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── 2. Idempotency — skip already-processed events ──
    const { error: insertError } = await admin
        .from('webhook_events')
        .insert({
            provider: 'revenuecat',
            event_id: event.id,
            event_type: event.type,
            payload: body,
            status: 'received',
        })

    if (insertError?.code === '23505') {
        // Duplicate key — already processed
        return new Response('Already processed', { status: 200 })
    }

    // ── 3. Handle event types ──
    try {
        if (event.type === 'INITIAL_PURCHASE' || event.type === 'RENEWAL') {
            await admin
                .from('profiles')
                .update({
                    subscription_status: 'premium',
                    revenuecat_customer_id: event.app_user_id,
                    subscription_expires_at: event.expiration_at_ms
                        ? new Date(event.expiration_at_ms).toISOString()
                        : null,
                })
                .eq('id', event.app_user_id)
        }

        if (event.type === 'CANCELLATION' || event.type === 'EXPIRATION') {
            await admin
                .from('profiles')
                .update({
                    subscription_status: 'free',
                    subscription_expires_at: null,
                    revenuecat_customer_id: event.app_user_id,
                })
                .eq('id', event.app_user_id)
        }

        if (event.type === 'NON_RENEWING_PURCHASE') {
            await admin
                .from('profiles')
                .update({
                    subscription_status: 'lifetime',
                    subscription_expires_at: null,
                    revenuecat_customer_id: event.app_user_id,
                })
                .eq('id', event.app_user_id)
        }

        // Mark event as processed
        await admin
            .from('webhook_events')
            .update({ status: 'processed', processed_at: new Date().toISOString() })
            .eq('provider', 'revenuecat')
            .eq('event_id', event.id)

        return new Response('OK', { status: 200 })
    } catch (err) {
        // Mark event as error
        await admin
            .from('webhook_events')
            .update({
                status: 'error',
                error_message: err instanceof Error ? err.message : 'Unknown error',
            })
            .eq('provider', 'revenuecat')
            .eq('event_id', event.id)

        return new Response('Internal error', { status: 500 })
    }
})
