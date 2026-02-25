// supabase/functions/generate-routine/index.ts
// Phase 7 — AI Routine Generator (Premium only)
// Accepts: { userId, subscriptionStatus, profile }
// Returns: { morning: Step[], night: Step[] }

// @ts-ignore: Deno import
import { OpenAI } from 'https://deno.land/x/openai@v4.52.2/mod.ts'
// @ts-ignore: Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, logAIUsage } from '../_shared/rateLimiter.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

declare const Deno: any

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { userId, subscriptionStatus = 'free', profile } = await req.json()

        if (!userId || !profile) {
            return new Response(
                JSON.stringify({ error: 'userId and profile are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Rate limit check — routine generation counts as 3 calls
        const { allowed, remaining } = await checkRateLimit(userId, 'generate_routine', subscriptionStatus)
        if (!allowed) {
            return new Response(
                JSON.stringify({
                    error: 'rate_limit_exceeded',
                    message: 'Daily routine generation limit reached. Try again tomorrow.',
                    remaining: 0,
                }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') ?? '' })
        const admin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: `Create a personalized daily grooming routine for a man with the following profile:
- Face shape: ${profile.face_shape ?? 'unknown'}
- Skin type: ${profile.skin_type ?? 'normal'}
- Skin concerns: ${Array.isArray(profile.skin_concerns) ? profile.skin_concerns.join(', ') : 'none'}
- Hair type: ${profile.hair_type ?? 'straight'}
- Hair concerns: ${Array.isArray(profile.hair_concerns) ? profile.hair_concerns.join(', ') : 'none'}
- Has beard: ${profile.has_beard ?? false}
- Beard style: ${profile.beard_style ?? 'none'}
- Time available: ${profile.daily_time_available ?? '5min'}
- Budget: ${profile.budget_range ?? 'mid'}
- Goals: ${Array.isArray(profile.grooming_goals) ? profile.grooming_goals.join(', ') : 'general grooming'}

Return ONLY valid JSON with this exact structure:
{
  "morning": [
    {
      "title": "step name",
      "description": "brief clear instruction (1-2 sentences)",
      "category": "face|hair|beard|body",
      "duration_seconds": 60,
      "product_suggestion": "specific product name or type"
    }
  ],
  "night": [ ...same structure... ]
}

Rules:
- Morning: max 5 steps, prioritize face care and hair styling
- Night: max 4 steps, prioritize skin recovery and beard care if applicable
- Match steps precisely to their time_available constraint (2min = 2 steps max, 5min = 3-4 steps, 10min+ = full routine)
- Match budget: budget=drugstore brands, mid=mid-range, premium=luxury
- If has_beard is true, include beard care steps
- Be specific about products, not generic
- Only return the JSON object, nothing else`,
                },
            ],
            temperature: 0.6,
            max_tokens: 1200,
            response_format: { type: 'json_object' },
        })

        const routine = JSON.parse(response.choices[0].message.content!)

        // Log AI usage
        await logAIUsage(userId, 'generate_routine', { model: 'gpt-4o', profile_hash: userId })

        return new Response(JSON.stringify({ ...routine, remaining: remaining - 1 }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('generate-routine error:', error)
        return new Response(
            JSON.stringify({ error: 'Routine generation failed', details: error instanceof Error ? error.message : String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
