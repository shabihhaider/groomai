// supabase/functions/analyze-product/index.ts
// Phase 7 — Product Ingredient Scanner AI Analysis
// Accepts: { userId, subscriptionStatus, productName, brand, category, ingredientsRaw, userProfile }
// Returns: PersonalizedProductAnalysis JSON

// @ts-ignore: Deno import
import { OpenAI } from 'https://deno.land/x/openai@v4.52.2/mod.ts'
// @ts-ignore: Deno import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, logAIUsage } from '../_shared/rateLimiter.ts'
import { jsonResponse } from '../_shared/responses.ts'
import { toPublicAIErrorBody } from '../_shared/aiErrors.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

declare const Deno: any

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const {
            userId,
            subscriptionStatus = 'free',
            productName,
            brand,
            category,
            ingredientsRaw,
            barcode,
            userProfile,
        } = await req.json()

        if (!userId || !ingredientsRaw) {
            return jsonResponse(
                { error: 'invalid_request', message: 'userId and ingredientsRaw are required' },
                400,
                corsHeaders
            )
        }

        // Rate limit check
        const { allowed, remaining } = await checkRateLimit(userId, 'analyze_product', subscriptionStatus)
        if (!allowed) {
            return jsonResponse(
                {
                    error: 'rate_limit_exceeded',
                    message: 'Daily product scan limit reached. Upgrade to Premium for more scans.',
                    remaining: 0,
                },
                429,
                corsHeaders
            )
        }

        const admin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const openaiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openaiKey) {
            return jsonResponse(
                {
                    error: 'ai_unavailable',
                    code: 'ai_missing_key',
                    message: 'AI is temporarily unavailable.',
                    retryable: false,
                },
                503,
                corsHeaders
            )
        }

        const openai = new OpenAI({ apiKey: openaiKey })

        const skinProfile = userProfile?.skinType ?? 'normal'
        const concerns = Array.isArray(userProfile?.skinConcerns)
            ? userProfile.skinConcerns.join(', ')
            : 'none specified'

        let response
        try {
            response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: `Analyze these grooming product ingredients for a man with ${skinProfile} skin and these concerns: ${concerns}.

Product: ${productName ?? 'Unknown'} by ${brand ?? 'Unknown'}
Category: ${category ?? 'grooming product'}
Ingredients: ${ingredientsRaw}

Return ONLY valid JSON:
{
  "safetyScore": 1-10,
  "verdict": "safe|caution|avoid",
  "flaggedIngredients": [
    { "name": "ingredient", "reason": "why bad for their skin type", "severity": "mild|moderate|high" }
  ],
  "goodIngredients": ["list of beneficial ingredients for their skin"],
  "summary": "1-2 sentence verdict in plain English, personalized to their skin type",
  "ingredients": [
    { "name": "ingredient name", "function": "what it does", "safetyScore": 1-10, "isFlagged": true/false, "flagReason": "why if flagged" }
  ]
}

Common flags for oily skin: comedogenic oils (coconut oil, cocoa butter, palm oil), heavy silicones, isopropyl myristate.
Common flags for sensitive skin: alcohol denat, synthetic fragrance, parabens, methylisothiazolinone.
Common flags for acne_prone skin: isopropyl myristate, sodium lauryl sulfate, petrolatum, lanolin.
Common flags for dry skin: alcohol denat, sodium lauryl sulfate, retinol (without buffer).
Be specific and helpful. Only flag ingredients truly problematic for this user's profile.`,
                    },
                ],
                max_tokens: 1200,
                response_format: { type: 'json_object' },
            })
        } catch (err) {
            console.error('analyze-product OpenAI error:', err)
            return jsonResponse(toPublicAIErrorBody(err), 503, corsHeaders)
        }

        const analysis = JSON.parse(response.choices[0].message.content!)

        // Save to product_scans table
        await admin.from('product_scans').insert({
            user_id: userId,
            barcode: barcode ?? null,
            product_name: productName ?? null,
            brand: brand ?? null,
            ingredients_raw: ingredientsRaw,
            safety_score: analysis.safetyScore,
            verdict: analysis.verdict,
            analysis_result: analysis,
        }).then(() => { }) // fire-and-forget

        // Log AI usage
        await logAIUsage(userId, 'analyze_product', { product: productName, verdict: analysis.verdict })

        // Award XP on first-ever product scan
        const { count } = await admin
            .from('product_scans')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        if ((count ?? 0) <= 1) {
            await admin.rpc('increment_xp', { user_id: userId, amount: 100 })
        }

        return jsonResponse(
            { ...analysis, productName, brand, barcode, remaining: remaining - 1 },
            200,
            corsHeaders
        )
    } catch (error) {
        console.error('analyze-product error:', error)
        return jsonResponse({ error: 'server_error', message: 'Request failed' }, 500, corsHeaders)
    }
})
