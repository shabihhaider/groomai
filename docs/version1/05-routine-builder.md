# Routine Builder

## Overview
The routine builder is the **core daily driver** of the app. Users open it every morning and night. It must feel like a premium checklist — satisfying to complete, visually rewarding, and habit-forming.

---

## Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| Routines | 2 (morning + night, fixed) | Unlimited + custom |
| Steps per routine | 3 max | Unlimited |
| AI-generated routine | ✗ | ✓ |
| Product recommendations | On Home tab ("Products For You") | Personalized on Home tab |
| Step notes & tips | ✗ | ✓ |
| Routine timer | ✗ | ✓ |

---

## Screen: Routines Tab (`app/(tabs)/routines.tsx`)

```
Layout:
  Header: "Good morning, [Name]." (time-aware greeting)
  Subtext: "[Day] • [Date] • [X]°"
  
  [Morning Routine Card]          [Night Routine Card]
    3/5 steps done                  Not started
    ████████░░ 60%                  ──────────
    
  [+ Create Custom Routine]  ← Premium only
  
  Below: "Today's AI Tip" card (rotates daily)
    "Based on your oily skin, try using a salicylic 
     acid cleanser this week."
```

---

## Routine Card Component

```tsx
// components/routine/RoutineCard.tsx
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useHabits } from '@/hooks/useHabits'

interface RoutineCardProps {
  routine: Routine
  onPress: () => void
}

export function RoutineCard({ routine, onPress }: RoutineCardProps) {
  const { getCompletionRatio } = useHabits()
  const { completed, total } = getCompletionRatio(routine.id)
  const progress = total > 0 ? completed / total : 0
  const isComplete = completed === total && total > 0

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <Pressable onPress={onPress} style={styles.card}>
        <Text style={styles.title}>{routine.name}</Text>
        <Text style={styles.subtitle}>{completed}/{total} steps</Text>
        
        <AnimatedProgressBar progress={progress} color={isComplete ? '#4CAF50' : '#C9A84C'} />
        
        {isComplete && (
          <View style={styles.completeBadge}>
            <Text>✓ Done</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}
```

---

## Routine Detail Screen (`app/routine-editor.tsx`)

> **Note:** Inline affiliate product cards were **removed** from the routine editor to keep the step-completion experience clean and distraction-free. Affiliate recommendations are available on the Home tab ("Products For You" section) instead.

```
Header: "Morning Routine" + Edit button (Premium)

Steps list — each step is a checkable card:

┌─────────────────────────────────────┐
│  ○  Cleanser                        │  ← tap circle to complete
│     Wash face with lukewarm water   │
│     ⏱ 60 seconds                   │
└─────────────────────────────────────┘

When tapped:
- Circle animates to ✓ (spring animation)
- Haptic feedback (light impact)
- Step card dims slightly
- Progress bar at top increments
- XP +10 shown as floating toast

When ALL steps completed:
- Full confetti animation (Lottie)
- "Routine complete! +50 XP" celebration
- Streak incremented
```

---

## Step Completion Logic

```typescript
// services/habit.service.ts
import { supabase } from '@/lib/supabase'

export async function completeStep(stepId: string, userId: string) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habit_logs')
    .upsert({
      user_id: userId,
      routine_step_id: stepId,
      logged_date: today,
      completed: true,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,routine_step_id,logged_date' })

  if (!error) {
    await awardXP(userId, 10) // 10 XP per step
    await checkBadges(userId)  // Check if any badge unlocked
    await updateStreak(userId)
  }

  return { data, error }
}

async function awardXP(userId: string, amount: number) {
  await supabase.rpc('increment_xp', { user_id: userId, amount })
}
```

---

## AI Routine Generator (Premium)

Triggered when user taps "Generate My Routine with AI" or during onboarding.

```typescript
// supabase/functions/generate-routine/index.ts (Edge Function)
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

Deno.serve(async (req) => {
  const { profile } = await req.json()

  const prompt = `
    Create a personalized grooming routine for a man with the following profile:
    - Face shape: ${profile.face_shape}
    - Skin type: ${profile.skin_type}
    - Skin concerns: ${profile.skin_concerns?.join(', ')}
    - Hair type: ${profile.hair_type}
    - Has beard: ${profile.has_beard}
    - Time available: ${profile.daily_time_available}
    - Budget: ${profile.budget_range}
    - Goals: ${profile.grooming_goals?.join(', ')}

    Return a JSON object with this exact structure:
    {
      "morning": [
        { "title": "step name", "description": "brief instruction", "category": "face|hair|beard|body", "duration_seconds": 60, "product_suggestion": "product name" }
      ],
      "night": [ ...same structure... ]
    }
    
    Keep steps minimal and achievable. Morning max 5 steps, Night max 4 steps.
    Only return the JSON, no other text.
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  })

  const routine = JSON.parse(response.choices[0].message.content!)
  return new Response(JSON.stringify(routine), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## Default Routine Seeds (for new users, based on skin type)

```typescript
// constants/defaultRoutines.ts
export const DEFAULT_ROUTINES: Record<string, { morning: Step[]; night: Step[] }> = {
  oily: {
    morning: [
      { title: 'Foaming Cleanser', description: 'Wash face with a gel/foaming cleanser', duration_seconds: 60, category: 'face' },
      { title: 'Toner', description: 'Apply alcohol-free toner to balance skin', duration_seconds: 30, category: 'face' },
      { title: 'Light Moisturizer', description: 'Use oil-free, non-comedogenic moisturizer', duration_seconds: 30, category: 'face' },
    ],
    night: [
      { title: 'Double Cleanse', description: 'Oil cleanser first, then foaming cleanser', duration_seconds: 120, category: 'face' },
      { title: 'Salicylic Acid', description: 'Apply BHA to target excess oil and pores', duration_seconds: 30, category: 'face' },
      { title: 'Lightweight Night Cream', description: 'Hydrate without clogging pores', duration_seconds: 30, category: 'face' },
    ]
  },
  dry: {
    morning: [
      { title: 'Gentle Cream Cleanser', description: 'Never strip moisture from skin', duration_seconds: 60, category: 'face' },
      { title: 'Hyaluronic Acid Serum', description: 'Apply to damp skin for maximum hydration', duration_seconds: 30, category: 'face' },
      { title: 'Rich Moisturizer + SPF', description: 'Lock in hydration + sun protection', duration_seconds: 45, category: 'face' },
    ],
    night: [
      { title: 'Cream Cleanser', description: 'Gentle cleanse, preserve natural oils', duration_seconds: 60, category: 'face' },
      { title: 'Retinol (2-3x/week)', description: 'Anti-aging, use every other night to start', duration_seconds: 30, category: 'face' },
      { title: 'Heavy Night Cream', description: 'Barrier repair while you sleep', duration_seconds: 30, category: 'face' },
    ]
  },
  combination: { /* similar structure */ },
  sensitive: { /* similar structure */ },
  normal: { /* similar structure */ },
  acne_prone: { /* similar structure */ }
}
```

---

## Routine Timer (Premium Feature)

Tap the timer icon on any step to start a countdown. This keeps users focused:

```tsx
// components/routine/StepTimer.tsx
import { useEffect, useState } from 'react'
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

export function StepTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds)
  const [active, setActive] = useState(false)
  const progress = useSharedValue(1)

  useEffect(() => {
    if (!active) return
    progress.value = withTiming(0, { duration: seconds * 1000 })
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [active])

  return (
    <Pressable onPress={() => setActive(true)}>
      <AnimatedCircularProgress value={progress} />
      <Text>{remaining}s</Text>
    </Pressable>
  )
}
```
