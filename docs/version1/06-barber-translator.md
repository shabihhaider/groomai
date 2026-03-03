# Barber Translator

## Overview
This is the **viral feature** of the app. It solves the most universal male grooming pain point: not knowing how to communicate with a barber. The output should be so useful that users screenshot it, share it, and show it directly to their barber.

---

## Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| Hairstyle browsing | 10 styles | 50+ styles |
| Filtered by face shape | ✗ | ✓ |
| AR try-on | ✗ | ⏳ v2 only (hidden in v1) |
| Barber card generation | 3/month | Unlimited |
| Share to WhatsApp | ✓ | ✓ |
| Celebrity photo upload | ✗ | ✓ (AI breakdown) |

---

## Screen: Barber Tab (`app/(tabs)/barber.tsx`)

```
Header: "Barber Translator"
Subtext: "Find your cut. Speak the language."

[Search bar]

Filter chips: All | Short | Medium | Long | Beard | Trending

[Recommended for your face shape]  ← personalized section (Premium)
  Horizontal scroll of cards

[All Styles]
  Grid of style cards (2-column)
  
  Each card:
  ┌──────────────┐
  │  [Photo]     │
  │  Mid Fade    │
  │  ⭐ Oval     │  ← face shape tag
  │  🔥 Trending │
  └──────────────┘

[📸 Upload Celebrity Photo]  ← Premium — AI breakdown
```

---

## Hairstyle Library Data Structure

```typescript
// constants/hairstyles.ts
export const HAIRSTYLES: Hairstyle[] = [
  {
    id: '1',
    name: 'Mid Fade + Textured Top',
    slug: 'mid-fade-textured-top',
    category: 'short',
    faceShapes: ['oval', 'square', 'oblong'],
    hairTypes: ['straight', 'wavy'],
    description: 'Clean fade with natural texture on top. Low maintenance, high impact.',
    isPremium: false,
    isTrending: true,

    // THE CORE VALUE PROP
    barberScript: `"I'd like a mid fade on the sides and back — starting about halfway up the head. 
Leave about 2 to 2.5 inches on top and use scissors, not clippers. 
I want texture on top so I can style it messy or pushed back. 
Please line up the front and around the ears. 
And take a little off the length but keep the shape."`,

    technicalName: 'Mid Skin Fade with Scissor-Cut Textured Top',
    guardNumbers: {
      sides_bottom: '0 (skin)',
      sides_mid: '1.5',
      sides_blend: '3',
      top: 'Scissor cut, 2–2.5 inches'
    },
    stylingInstructions: 'Apply a small amount of matte clay or pomade to slightly damp hair. Work in with fingers, then style upward or to the side for texture.',
    maintenanceFrequency: 'Every 3–4 weeks to maintain the fade',

    thumbnailUrl: 'https://storage.supabase.../mid-fade-textured/thumb.jpg',
    frontViewUrl: 'https://storage.supabase.../mid-fade-textured/front.jpg',
    sideViewUrl: 'https://storage.supabase.../mid-fade-textured/side.jpg',
    backViewUrl: 'https://storage.supabase.../mid-fade-textured/back.jpg',
    deepArEffectId: 'mid-fade-01',  // v2 only — Must match the filename in assets/deepar-effects/hairstyles/ (without .deepar)
  },
  {
    id: '2',
    name: 'Classic Taper',
    slug: 'classic-taper',
    category: 'short',
    faceShapes: ['round', 'oval', 'square', 'heart'],
    hairTypes: ['straight', 'wavy', 'curly'],
    isPremium: false,
    isTrending: false,
    barberScript: `"I'd like a classic taper — not a fade. Keep the hair on top around 1.5 to 2 inches, 
comb it to the side. I want it clean around the ears and the neckline blocked straight. 
Use a 2 on the sides, tapered down to a 1 near the bottom."`,
    guardNumbers: { sides: '2', taper_bottom: '1', top: 'Scissor, 1.5–2 inches' },
    maintenanceFrequency: 'Every 4–5 weeks',
  },
  {
    id: '3',
    name: 'Buzz Cut',
    slug: 'buzz-cut',
    barberScript: `"I'd like an all-over buzz cut with a number 3 guard all around. 
Keep it even, line up the hairline and neckline cleanly."`,
    guardNumbers: { all_over: '3' },
    faceShapes: ['oval', 'square', 'diamond'],
    isPremium: false,
  },
  {
    id: '4',
    name: 'French Crop with Low Fade',
    slug: 'french-crop-low-fade',
    isPremium: true,
    barberScript: `"I'd like a French crop. Short and textured on top, about an inch, with a blunt or slightly 
textured fringe sitting on or just above my forehead. Low fade on the sides — starting about 
2 inches from the bottom, blending from a 0 up to a 2. Line the front fringe straight across."`,
    guardNumbers: { sides_bottom: '0', sides_blend: '2', top: 'Scissor, 1 inch' },
    faceShapes: ['oval', 'square', 'oblong'],
  },
  // ... 46 more styles
]
```

---

## Hairstyle Detail Screen (`app/hairstyle-detail.tsx`)

```
[Back arrow]           [♡ Save]     [👁 AR Try-On (v2 only — hidden in v1)]

[Photo carousel — Front | Side | Back]
  Swipeable, smooth transition between angles

Style Name: "Mid Fade + Textured Top"
Tags: Short • Trending • Best for: Oval, Square

─────────────────────────────────────

💬 "What to say to your barber"

┌──────────────────────────────────────────────────────┐
│  "I'd like a mid fade on the sides and back —        │
│   starting about halfway up the head. Leave about    │
│   2 to 2.5 inches on top and use scissors, not       │
│   clippers. I want texture on top so I can style it  │
│   messy or pushed back..."                           │
│                                                      │
│  [📋 Copy Script]   [🗣️ Play Audio]                  │
└──────────────────────────────────────────────────────┘

🔢 Guard Numbers
  Sides (bottom): Skin (0)
  Sides (blend): Guard 1.5
  Top: Scissor cut, 2–2.5 inches

💆 Styling
  Matte clay or pomade, work in with fingers...

🗓 Maintenance
  Every 3–4 weeks

─────────────────────────────────────

[Generate Barber Card]  ← BIG CTA
```

---

## Barber Card Generator

This is what users show to their barber. Clean, professional, shareable.

```tsx
// components/barber/BarberCard.tsx
import ViewShot from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'

export function BarberCard({ hairstyle }: { hairstyle: Hairstyle }) {
  const ref = useRef<ViewShot>(null)

  async function shareCard() {
    const uri = await ref.current!.capture!()
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share with your barber'
    })
  }

  return (
    <>
      <ViewShot ref={ref} options={{ format: 'png', quality: 1 }}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Image source={require('@/assets/logo.png')} style={styles.logo} />
            <Text style={styles.appName}>GroomAI</Text>
            <Text style={styles.cardTitle}>Barber Brief</Text>
          </View>

          {/* Style name + photos */}
          <Text style={styles.styleName}>{hairstyle.name}</Text>
          <View style={styles.photoRow}>
            <Image source={{ uri: hairstyle.frontViewUrl }} style={styles.photo} />
            <Image source={{ uri: hairstyle.sideViewUrl }} style={styles.photo} />
            <Image source={{ uri: hairstyle.backViewUrl }} style={styles.photo} />
          </View>
          <View style={styles.photoLabels}>
            <Text>Front</Text><Text>Side</Text><Text>Back</Text>
          </View>

          {/* Script */}
          <Text style={styles.sectionLabel}>What to ask for:</Text>
          <Text style={styles.script}>{hairstyle.barberScript}</Text>

          {/* Guard numbers */}
          <Text style={styles.sectionLabel}>Guard Numbers:</Text>
          {Object.entries(hairstyle.guardNumbers).map(([key, val]) => (
            <Text key={key} style={styles.guardItem}>
              {key.replace(/_/g, ' ')}: <Text style={styles.bold}>{val}</Text>
            </Text>
          ))}

          {/* Footer */}
          <Text style={styles.footer}>Generated by GroomAI · groomai.app</Text>
        </View>
      </ViewShot>

      <Button onPress={shareCard} label="📤 Share with Barber" />
      <Button onPress={shareViaWhatsApp} label="💬 Send via WhatsApp" variant="secondary" />
    </>
  )
}

async function shareViaWhatsApp(text: string) {
  const msg = encodeURIComponent(`Hey, I'd like this haircut:\n\n${text}\n\nGenerated by GroomAI`)
  Linking.openURL(`whatsapp://send?text=${msg}`)
}
```

---

## Celebrity Photo AI Breakdown (Premium)

User uploads a photo of any celebrity or influencer. AI identifies the haircut and generates a barber script.

```typescript
// supabase/functions/analyze-hairstyle/index.ts
import { OpenAI } from 'openai'

Deno.serve(async (req) => {
  const { imageBase64 } = await req.json()
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' }
        },
        {
          type: 'text',
          text: `Analyze this hairstyle and return JSON:
          {
            "style_name": "official name of the cut",
            "description": "brief description",
            "barber_script": "exactly what to say to a barber",
            "guard_numbers": { "sides": "X", "top": "description" },
            "styling_product": "recommended product",
            "maintenance": "how often to trim"
          }
          Only return JSON.`
        }
      ]
    }],
    max_tokens: 600
  })

  const result = JSON.parse(response.choices[0].message.content!)
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Search & Filter Logic

```typescript
// services/barber.service.ts
export function filterHairstyles(
  styles: Hairstyle[],
  filters: {
    query?: string
    category?: string
    faceShape?: string
    isPremiumUser?: boolean
  }
): Hairstyle[] {
  return styles
    .filter(s => {
      if (filters.query) {
        return s.name.toLowerCase().includes(filters.query.toLowerCase())
      }
      return true
    })
    .filter(s => !filters.category || filters.category === 'all' || s.category === filters.category)
    .filter(s => !filters.faceShape || s.faceShapes.includes(filters.faceShape))
    .sort((a, b) => {
      // Premium users first see face-shape matched styles
      if (filters.faceShape) {
        const aMatch = a.faceShapes.includes(filters.faceShape) ? -1 : 1
        const bMatch = b.faceShapes.includes(filters.faceShape) ? -1 : 1
        return aMatch - bMatch
      }
      // Trending first for everyone else
      return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0)
    })
}
```
