// supabase/functions/analyze-skin/index.ts
// Phase 7 — AI Skin Analysis via GPT-4o Vision
// Accepts: { userId, imageBase64, subscriptionStatus }
// Returns: SkinAnalysisResult JSON

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
        const { userId, imageBase64, subscriptionStatus = 'free' } = await req.json()

        if (!userId || !imageBase64) {
            return new Response(
                JSON.stringify({ error: 'userId and imageBase64 are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Rate limit check
        const { allowed, remaining } = await checkRateLimit(userId, 'skin_analysis', subscriptionStatus)
        if (!allowed) {
            return new Response(
                JSON.stringify({
                    error: 'rate_limit_exceeded',
                    message: `Daily skin analysis limit reached for your plan. Upgrade to Premium for more analyses.`,
                    remaining: 0,
                }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const admin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Upload selfie to Supabase Storage
        // NOTE: Use fetch on data URI to get a Blob — Buffer is Node.js-only and unavailable in Deno
        const dataUri = `data:image/jpeg;base64,${imageBase64}`
        const blobResponse = await fetch(dataUri)
        const blob = await blobResponse.blob()
        const fileName = `${userId}/${Date.now()}.jpg`

        const { error: uploadError } = await admin.storage
            .from('skin-analysis')
            .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })

        const photoUrl = uploadError
            ? null
            : admin.storage.from('skin-analysis').getPublicUrl(fileName).data.publicUrl

        // GPT-4o Vision analysis
        const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') ?? '' })

        const prompt = `You are a professional dermatologist AI assistant. Analyze this selfie for men's skin health.

Return ONLY valid JSON with this exact structure:
{
  "skinType": "oily|dry|combination|normal|sensitive",
  "concerns": [
    { "name": "concern name", "severity": "mild|moderate|significant", "score": 0-10, "tip": "one actionable tip" }
  ],
  "overallScore": 0-100,
  "summary": "2-sentence friendly summary of their skin",
  "recommendations": [
    { "type": "product|habit|ingredient", "title": "name", "description": "why it helps" }
  ]
}

Max 4 concerns. Max 3 recommendations.
Be encouraging and constructive, never harsh.
If image quality is too low or face is not clearly visible, return:
{ "error": "low_quality", "skinType": "normal", "concerns": [], "overallScore": 0, "summary": "Image quality was too low for accurate analysis. Please take another photo in better lighting.", "recommendations": [] }`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' },
                        },
                        { type: 'text', text: prompt },
                    ],
                },
            ],
            max_tokens: 800,
            response_format: { type: 'json_object' },
        })

        const result = JSON.parse(response.choices[0].message.content!)

        // Save to skin_analysis_logs
        await admin.from('skin_analysis_logs').insert({
            user_id: userId,
            photo_url: photoUrl,
            analysis_result: result,
            detected_skin_type: result.skinType,
            detected_concerns: result.concerns?.map((c: any) => c.name) ?? [],
            confidence_score: result.overallScore ? result.overallScore / 10 : null,
            recommendations: result.recommendations?.map((r: any) => r.title) ?? [],
        })

        // Log AI usage
        await logAIUsage(userId, 'skin_analysis', { model: 'gpt-4o' })

        // Award XP on first-ever skin analysis
        const { count } = await admin
            .from('skin_analysis_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)

        if ((count ?? 0) <= 1) {
            await admin.rpc('increment_xp', { user_id: userId, amount: 100 })
        }

        return new Response(JSON.stringify({ ...result, remaining: remaining - 1 }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('analyze-skin error:', error)
        return new Response(
            JSON.stringify({ error: 'Analysis failed', details: error instanceof Error ? error.message : String(error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
