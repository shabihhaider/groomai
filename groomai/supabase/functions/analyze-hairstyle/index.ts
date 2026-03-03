// supabase/functions/analyze-hairstyle/index.ts
// Phase 6 — Celebrity Photo AI Breakdown (GPT-4o Vision)
// Receives a base64 image, analyzes the hairstyle, returns structured barber data

import { OpenAI } from 'https://deno.land/x/openai@v4.52.2/mod.ts'
import { checkRateLimit, logAIUsage } from '../_shared/rateLimiter.ts'
import { jsonResponse } from '../_shared/responses.ts'
import { toPublicAIErrorBody } from '../_shared/aiErrors.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { imageBase64, userId, subscriptionStatus } = await req.json()

        if (!imageBase64 || typeof imageBase64 !== 'string') {
            return jsonResponse({ error: 'invalid_request', message: 'imageBase64 is required' }, 400, corsHeaders)
        }

        // Validate image isn't too large (base64 of ~5MB = ~6.7MB string)
        if (imageBase64.length > 7_000_000) {
            return jsonResponse(
                { error: 'image_too_large', message: 'Image too large. Please use a smaller photo.' },
                400,
                corsHeaders
            )
        }

        // ── Rate Limiting ──────────────────────────────────────────────
        if (userId) {
            const { allowed, remaining } = await checkRateLimit(
                userId,
                'analyze_hairstyle',
                subscriptionStatus ?? 'free'
            )
            if (!allowed) {
                return jsonResponse(
                    {
                        error: 'rate_limit_exceeded',
                        message: 'Daily limit reached for hairstyle analysis. Try again tomorrow.',
                        remaining: 0,
                    },
                    429,
                    corsHeaders
                )
            }
        }

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

        const prompt = `You are a professional barber and hairstyle expert. Analyze this photo and identify the hairstyle shown.

Return ONLY valid JSON with this exact structure:
{
  "style_name": "Official name of the haircut (e.g. Mid Fade + Textured Top)",
  "description": "Brief 1-2 sentence description of the style",
  "has_visible_hair": true,
  "barber_script": "Exact verbatim words to say to a barber to request this style. Should be conversational, specific, and professional. Include fade level, guard numbers mentioned naturally, and top length.",
  "guard_numbers": {
    "sides_bottom": "guard number or skin",
    "sides_mid": "guard number if fade",
    "top": "description like Scissor only or guard number"
  },
  "styling_product": "Recommended product type (e.g. matte clay, light pomade)",
  "maintenance": "How often to visit the barber (e.g. Every 3-4 weeks)"
}

If the photo does NOT clearly show a hairstyle or face, still return JSON but set has_visible_hair to false and barber_script to "Unable to identify a clear hairstyle in this photo. Please try a clearer image."
Return ONLY valid JSON, no other text.`

        let response
        try {
            response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`,
                                    detail: 'high',
                                },
                            },
                            {
                                type: 'text',
                                text: prompt,
                            },
                        ],
                    },
                ],
                max_tokens: 700,
                response_format: { type: 'json_object' },
            })
        } catch (err) {
            console.error('analyze-hairstyle OpenAI error:', err)
            return jsonResponse(toPublicAIErrorBody(err), 503, corsHeaders)
        }

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('Empty response from OpenAI')
        }

        const result = JSON.parse(content)

        // Log AI usage for rate limiting
        if (userId) {
            await logAIUsage(userId, 'analyze_hairstyle', {
                style_name: result.style_name ?? 'unknown',
            })
        }

        // Guard against photos with no visible hair
        if (result.has_visible_hair === false) {
            return jsonResponse(
                {
                    ...result,
                    barber_script: result.barber_script ?? 'Unable to identify a clear hairstyle in this photo.',
                },
                200,
                corsHeaders
            )
        }

        return jsonResponse(result, 200, corsHeaders)

    } catch (error) {
        console.error('analyze-hairstyle error:', error)
        return jsonResponse({ error: 'server_error', message: 'Request failed' }, 500, corsHeaders)
    }
})
