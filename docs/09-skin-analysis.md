# AI Skin Analysis

## Overview
Premium feature. User takes a selfie, AI analyzes their skin and returns a personalized report: detected skin type, concerns, severity scores, and product recommendations. This feature makes users feel the app genuinely understands them.

---

## Important Honesty Disclaimer (Build Into UI)
Always show: *"This analysis is for guidance only — not a medical diagnosis."*
This protects against liability and sets correct user expectations.

---

## Technical Approach

Two-layer analysis:
1. **Google ML Kit (on-device)** — Face detection, landmark detection, basic analysis. Fast, free, private.
2. **GPT-4o Vision (server-side via Supabase Edge Function)** — Deep analysis of skin texture, tone, concerns. Premium quality but costs ~$0.01–0.03 per analysis.

---

## Screen Flow

```
[Camera permission check]
       ↓
[Selfie capture screen]
  - Front-facing camera
  - Face oval guide overlay
  - "Hold still, good lighting helps"
  - [Take Photo] button
       ↓
[Preview + confirm]
  - "This photo will not be shared"
  - [Analyze My Skin] / [Retake]
       ↓
[Analyzing screen — animated]
  - Lottie scanning animation
  - "Analyzing skin texture..."
  - "Detecting concerns..."
  - "Building your report..."
  (~3-5 second wait)
       ↓
[Results screen]
```

---

## Selfie Capture Screen (`app/skin-analysis.tsx`)

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRef, useState } from 'react'
import Animated, { FadeIn } from 'react-native-reanimated'

export default function SkinAnalysisScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [photo, setPhoto] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<SkinAnalysisResult | null>(null)
  const cameraRef = useRef<CameraView>(null)

  if (!permission?.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSubtext}>
          We need camera access to analyze your skin. Your photo is processed privately and never shared.
        </Text>
        <Button onPress={requestPermission} label="Allow Camera" />
      </View>
    )
  }

  async function takePhoto() {
    const shot = await cameraRef.current?.takePictureAsync({
      quality: 0.8,
      base64: true,
      exif: false  // Don't capture location metadata
    })
    if (shot) setPhoto(shot.base64!)
  }

  async function analyzePhoto() {
    if (!photo) return
    setAnalyzing(true)
    
    try {
      const result = await analyzeSkin(photo)
      await saveSkinLog(photo, result)
      setResult(result)
    } catch (e) {
      // Show error state
    } finally {
      setAnalyzing(false)
    }
  }

  if (analyzing) return <SkinAnalyzingScreen />
  if (result) return <SkinResultsScreen result={result} />
  if (photo) return <PhotoPreviewScreen photo={photo} onConfirm={analyzePhoto} onRetake={() => setPhoto(null)} />

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} facing="front" style={StyleSheet.absoluteFill} />
      
      {/* Face guide oval */}
      <View style={styles.overlay}>
        <Svg height="100%" width="100%">
          <Ellipse
            cx="50%" cy="45%" rx="35%" ry="42%"
            stroke="#C9A84C" strokeWidth="2"
            strokeDasharray="8,4"
            fill="transparent"
          />
        </Svg>
      </View>

      <View style={styles.guide}>
        <Text style={styles.guideText}>Position your face in good lighting</Text>
      </View>

      <View style={styles.captureArea}>
        <Pressable style={styles.captureBtn} onPress={takePhoto}>
          <View style={styles.captureBtnInner} />
        </Pressable>
      </View>
    </View>
  )
}
```

---

## Skin Analysis Service

```typescript
// services/skin.service.ts
import { supabase } from '@/lib/supabase'

export interface SkinAnalysisResult {
  skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive'
  concerns: SkinConcern[]
  overallScore: number  // 1-100 (higher = healthier skin)
  recommendations: Recommendation[]
  summary: string
}

export interface SkinConcern {
  name: string
  severity: 'mild' | 'moderate' | 'significant'
  score: number  // 0-10
  tip: string
}

export interface Recommendation {
  type: 'product' | 'habit' | 'ingredient'
  title: string
  description: string
  affiliateUrl?: string
}

export async function analyzeSkin(base64Image: string): Promise<SkinAnalysisResult> {
  const { data, error } = await supabase.functions.invoke('analyze-skin', {
    body: { imageBase64: base64Image }
  })

  if (error) throw error
  return data as SkinAnalysisResult
}

export async function saveSkinLog(
  base64Image: string,
  result: SkinAnalysisResult,
  userId: string
) {
  // Upload photo to Supabase Storage
  // NOTE: Buffer is a Node.js-only global and is NOT reliably available in React Native.
  // Use fetch() on the data URI to get a Blob — this is the correct cross-platform approach.
  const fileName = `${userId}/${Date.now()}.jpg`
  const response = await fetch(`data:image/jpeg;base64,${base64Image}`)
  const blob = await response.blob()

  const { data: uploadData } = await supabase.storage
    .from('skin-analysis')
    .upload(fileName, blob, { contentType: 'image/jpeg' })

  const photoUrl = supabase.storage.from('skin-analysis').getPublicUrl(fileName).data.publicUrl

  // Save analysis result
  await supabase.from('skin_analysis_logs').insert({
    user_id: userId,
    photo_url: photoUrl,
    analysis_result: result,
    detected_skin_type: result.skinType,
    detected_concerns: result.concerns.map(c => c.name),
    confidence_score: result.overallScore / 10,
    recommendations: result.recommendations.map(r => r.title)
  })
}
```

---

## Supabase Edge Function

```typescript
// supabase/functions/analyze-skin/index.ts
import { OpenAI } from 'openai'

Deno.serve(async (req) => {
  const { imageBase64 } = await req.json()
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

  const prompt = `
    You are a professional dermatologist AI assistant. Analyze this selfie for skin health.
    
    Return ONLY a JSON object with this exact structure:
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
    If image quality is too low or face is not clearly visible, return { "error": "low_quality" }.
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } },
        { type: 'text', text: prompt }
      ]
    }],
    max_tokens: 800,
    response_format: { type: 'json_object' }
  })

  const result = JSON.parse(response.choices[0].message.content!)
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
})
```

---

## Results Screen

```
┌──────────────────────────────────┐
│  Your Skin Report                │
│  Analyzed • [Date]               │
│                                  │
│  Skin Type: Combination          │
│  Overall Health Score:           │
│  ████████░░  74/100              │
│                                  │
│  "[Name], your skin is in good   │
│   overall health. Focus on       │
│   controlling the T-zone..."     │
└──────────────────────────────────┘

[Concerns]
  T-Zone Oiliness     ■■■■■■■░░░  7/10 Moderate
  Pore Visibility     ■■■■■░░░░░  5/10 Mild
  Occasional Breakout ■■■░░░░░░░  3/10 Mild

[Recommendations]
  💧 Use a BHA toner (salicylic acid) → [Shop CeraVe →]
  ☀️ Apply SPF 30 daily, even indoors
  🧴 Avoid heavy, oil-based moisturizers

[Skin History] ← Premium
  [This Analysis] [1 month ago] [2 months ago]
  Comparison chart showing score trend
```

---

## Skin History Comparison (Premium)

```tsx
// components/skin/SkinHistory.tsx
import { LineChart } from 'recharts' // or Victory Native

export function SkinHistoryChart({ logs }: { logs: SkinAnalysisLog[] }) {
  const data = logs.map(log => ({
    date: format(new Date(log.analyzed_at), 'MMM d'),
    score: log.analysis_result.overallScore
  }))

  return (
    <LineChart
      data={data}
      width={340}
      height={180}
    >
      {/* Gold line, dark background, minimal axes */}
    </LineChart>
  )
}
```
