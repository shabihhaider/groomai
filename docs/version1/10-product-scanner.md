# Product Ingredient Scanner

## Overview
Premium feature. User scans the barcode of any grooming product at the store or at home. The app tells them if the ingredients are safe for their specific skin type, flags any harmful ingredients, and gives a clear Safe / Caution / Avoid verdict. Think: a personal dermatologist in your pocket at Boots or Sephora.

---

## What Makes This Useful (vs Generic)

Most ingredient checkers tell you if an ingredient is "generally" harmful. Ours cross-references ingredients against the **user's personal skin profile** — so oily-skin users get flagged for comedogenic oils, sensitive-skin users get flagged for alcohol and fragrances, etc.

---

## Data Source for Ingredients

Use the **Open Food Facts / Open Beauty Facts API** (free, open source) for product lookup by barcode. It covers hundreds of thousands of cosmetic and grooming products.

```
Base URL: https://world.openbeautyfacts.org/api/v0/product/{barcode}.json
```

For ingredient safety data, use **EWG Skin Deep Database** or a self-maintained ingredient safety JSON file (safer for reliability).

---

## Screen Flow

```
[Barber Tab → Product Scanner icon]
       ↓
[Scanner Screen]
  - Live camera with barcode frame overlay
  - "Point at any grooming product barcode"
       ↓
[Barcode detected — auto-capture]
  - Haptic + sound feedback
  - Shows "Looking up product..."
       ↓
[Results screen]
  OR
[Product not found → Manual search]
```

---

## Scanner Screen (`app/product-scanner.tsx`)

> **Note:** `expo-barcode-scanner` was removed in Expo SDK 51. Barcode scanning is now handled by `expo-camera`'s `CameraView` with the `onBarcodeScanned` prop. Do NOT import from `expo-barcode-scanner`.

```tsx
// Uses expo-camera (SDK 51+) — expo-barcode-scanner is deprecated and removed
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera'
import { useState } from 'react'
import * as Haptics from 'expo-haptics'

export default function ProductScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProductAnalysis | null>(null)

  if (!permission) return null // Still loading

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSubtext}>
          Point your camera at any grooming product barcode to check ingredients.
        </Text>
        <Button onPress={requestPermission} label="Allow Camera" />
      </View>
    )
  }

  async function handleBarcodeScanned({ data: barcode }: BarcodeScanningResult) {
    if (scanned || loading) return
    setScanned(true)
    setLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      const analysis = await analyzeProduct(barcode)
      setResult(analysis)
      await saveProductScan(barcode, analysis)
    } catch {
      // Show manual search fallback
    } finally {
      setLoading(false)
    }
  }

  if (result) return <ProductResultScreen result={result} onRescan={() => { setScanned(false); setResult(null) }} />

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Scanning overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanFrame}>
          {/* Animated scan line */}
          <AnimatedScanLine />
          {/* Corner brackets */}
          <CornerBrackets />
        </View>
        <Text style={styles.hint}>
          {loading ? 'Analyzing product...' : 'Point camera at barcode'}
        </Text>
      </View>
    </View>
  )
}
```

---

## Product Analysis Service

```typescript
// services/product.service.ts
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user.store'

export interface ProductAnalysis {
  barcode: string
  productName: string
  brand: string
  category: string
  ingredients: Ingredient[]
  safetyScore: number         // 1-10
  verdict: 'safe' | 'caution' | 'avoid'
  flaggedIngredients: FlaggedIngredient[]
  goodIngredients: string[]
  summary: string
}

export interface Ingredient {
  name: string
  function: string
  safetyScore: number         // EWG 1-10 (1=safest)
  isFlagged: boolean
  flagReason?: string
}

export interface FlaggedIngredient {
  name: string
  reason: string
  severity: 'mild' | 'moderate' | 'high'
}

export async function analyzeProduct(barcode: string): Promise<ProductAnalysis> {
  // Step 1: Fetch product from Open Beauty Facts
  const productRes = await fetch(
    `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`
  )
  const productData = await productRes.json()

  if (productData.status === 0) {
    throw new Error('Product not found')
  }

  const product = productData.product
  const ingredientsList = product.ingredients_text || ''

  // Step 2: Send ingredients + user profile to Edge Function for personalized analysis
  const { data, error } = await supabase.functions.invoke('analyze-product', {
    body: {
      productName: product.product_name,
      brand: product.brands,
      category: product.categories,
      ingredientsRaw: ingredientsList,
      userProfile: {
        skinType: useUserStore.getState().profile?.skin_type,
        skinConcerns: useUserStore.getState().profile?.skin_concerns
      }
    }
  })

  if (error) throw error
  return { ...data, barcode } as ProductAnalysis
}
```

---

## Edge Function: Product Analysis

```typescript
// supabase/functions/analyze-product/index.ts
import { OpenAI } from 'openai'
import { INGREDIENT_SAFETY_DB } from './ingredientDb.ts'

Deno.serve(async (req) => {
  const { productName, brand, ingredientsRaw, userProfile } = await req.json()
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `
        Analyze these grooming product ingredients for a man with ${userProfile.skinType} skin
        and these concerns: ${userProfile.skinConcerns?.join(', ')}.
        
        Product: ${productName} by ${brand}
        Ingredients: ${ingredientsRaw}
        
        Return ONLY this JSON:
        {
          "ingredients": [
            { "name": "ingredient", "function": "what it does", "safetyScore": 1-10, "isFlagged": true/false, "flagReason": "why if flagged" }
          ],
          "safetyScore": 1-10,
          "verdict": "safe|caution|avoid",
          "flaggedIngredients": [
            { "name": "ingredient", "reason": "why bad for their skin type", "severity": "mild|moderate|high" }
          ],
          "goodIngredients": ["list of beneficial ingredients for their skin"],
          "summary": "1-2 sentence verdict in plain English"
        }
        
        Focus on ingredients problematic for ${userProfile.skinType} skin specifically.
        Common flags for oily skin: comedogenic oils (coconut, cocoa butter), heavy silicones
        Common flags for sensitive skin: alcohol, synthetic fragrance, parabens
        Common flags for acne_prone skin: isopropyl myristate, sodium lauryl sulfate
      `
    }],
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  })

  const result = JSON.parse(response.choices[0].message.content!)
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
})
```

---

## Results Screen

```
┌───────────────────────────────────┐
│  CeraVe Foaming Facial Cleanser   │
│  CeraVe                           │
└───────────────────────────────────┘

Verdict:
  ✅  SAFE FOR YOU
  Safety Score: 9/10

  "Great choice for combination skin. 
   No comedogenic ingredients detected."

Good Ingredients:
  ✅ Niacinamide — reduces pores, controls oil
  ✅ Hyaluronic Acid — gentle hydration
  ✅ Ceramides — strengthens skin barrier

Flagged Ingredients:
  ⚠️ Sodium Lauryl Sulfate — Mild concern
     Can be drying with twice-daily use

Full Ingredient List (expandable)
  [Show all 18 ingredients ↓]

[Save Product] [📤 Share]  [↩ Scan Another]
```

---

## Ingredient Safety Reference (`constants/ingredients.ts`)

Build a local reference file for the most common grooming ingredients to reduce API calls:

```typescript
export const COMMON_INGREDIENTS: Record<string, {
  safeScore: number
  badFor: string[]
  goodFor: string[]
  function: string
}> = {
  'sodium lauryl sulfate': {
    safeScore: 6,
    badFor: ['sensitive', 'dry'],
    goodFor: ['oily'],
    function: 'Surfactant / cleanser'
  },
  'isopropyl myristate': {
    safeScore: 4,
    badFor: ['acne_prone', 'oily'],
    goodFor: [],
    function: 'Emollient'
  },
  'niacinamide': {
    safeScore: 10,
    badFor: [],
    goodFor: ['oily', 'combination', 'acne_prone'],
    function: 'Pore minimizer, oil control'
  },
  'hyaluronic acid': {
    safeScore: 10,
    badFor: [],
    goodFor: ['dry', 'normal', 'sensitive', 'combination'],
    function: 'Humectant / hydrator'
  },
  'fragrance': {
    safeScore: 4,
    badFor: ['sensitive', 'acne_prone'],
    goodFor: [],
    function: 'Scent'
  },
  'coconut oil': {
    safeScore: 5,
    badFor: ['oily', 'acne_prone'],
    goodFor: ['dry'],
    function: 'Emollient'
  },
  'salicylic acid': {
    safeScore: 9,
    badFor: ['dry', 'sensitive'],
    goodFor: ['oily', 'acne_prone'],
    function: 'BHA exfoliant, pore clearer'
  },
  // ... 200+ more
}
```
