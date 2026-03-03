# Onboarding Flow

## Psychology Behind This Flow
The onboarding is the most important part of the app. It must:
1. **Build investment** — the more a user fills in, the more they feel the app is "theirs" (IKEA Effect)
2. **Create anticipation** — tease what's coming ("Your personalized plan is being built...")
3. **Trigger the trial immediately** — by step 6, they've invested enough to feel losing premium access would hurt
4. **Feel like a conversation, not a form** — one question per screen, big typography, smooth transitions

---

## Step-by-Step Flow

### Welcome Screen (`app/(auth)/welcome.tsx`)
```
Visual: Full-screen dark background, animated logo appearing with Lottie,
        subtle particle/glow effect using Reanimated

Headline: "Your Daily Edge."
Subtext: "Personalized grooming. Built for you."

CTAs:
  - [Continue with Apple]   ← shown only on iOS
  - [Continue with Google]
  - [Continue with Email]
  
Bottom: "Already have an account? Sign In"
```

**Implementation:**
```tsx
import * as AppleAuthentication from 'expo-apple-authentication'
import { supabase } from '@/lib/supabase'

async function handleGoogleSignIn() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: 'groomai://sign-in' }
  })
}

async function handleAppleSignIn() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  })
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken!,
  })
}
```

---

### Step 1 — Basics (`step-1-basics.tsx`)
```
Progress: ●○○○○○  (1 of 6)

"What should we call you?"
[Text input — first name only]

Animation: Name appears in a personalized greeting as they type
"Nice to meet you, [Name] 👋"

[Continue →]
```

Data saved to: `profile.full_name`

---

### Step 2 — Face Shape (`step-2-face.tsx`)
```
Progress: ●●○○○○

"Let's find your face shape."

Option A — Selfie Scan (Premium):
  [Take Selfie] → Google ML Kit face landmark analysis
  Shows detected face shape with illustration
  
Option B — Quiz (Free):
  Q: "What best describes your jawline?"
    ○ Sharp and defined (square)
    ○ Narrow and pointed (diamond/heart)
    ○ Rounded (round)
    ○ Similar width top and bottom (oval/oblong)
  
  Q: "How does your forehead compare to your jawline?"
    ○ Forehead is wider
    ○ About the same width
    ○ Jawline is wider
  
  Q: "How long is your face?"
    ○ About as long as it is wide (round/square)
    ○ Noticeably longer than wide (oblong/oval)
    ○ Somewhere in between

Result: Face shape displayed with a clean illustration + "suits you" preview
```

**Face Shape Detection Logic (`utils/faceShape.ts`):**
```typescript
interface FaceLandmarks {
  faceWidth: number       // distance between cheekbones
  jawWidth: number        // distance between jaw corners
  foreheadWidth: number   // distance at temples
  faceHeight: number      // forehead to chin
  jawlineAngle: number    // sharpness of jaw angle
}

export function detectFaceShape(landmarks: FaceLandmarks): string {
  const { faceWidth, jawWidth, foreheadWidth, faceHeight, jawlineAngle } = landmarks
  const ratio = faceHeight / faceWidth

  if (ratio > 1.5) return 'oblong'
  if (jawlineAngle < 130 && jawWidth > faceWidth * 0.85) return 'square'
  if (foreheadWidth > jawWidth * 1.2 && jawlineAngle > 150) return 'heart'
  if (faceWidth > faceHeight * 0.95) return 'round'
  if (foreheadWidth < faceWidth * 0.75 && jawWidth < faceWidth * 0.75) return 'diamond'
  return 'oval' // default — most common
}
```

Data saved to: `profile.face_shape`

---

### Step 3 — Skin (`step-3-skin.tsx`)
```
Progress: ●●●○○○

"Tell us about your skin."

Q: "By midday, your skin usually feels..."
  ○ Shiny all over (oily)
  ○ Tight or flaky (dry)
  ○ Shiny in T-zone, tight elsewhere (combination)
  ○ Generally comfortable (normal)
  ○ Easily irritated or red (sensitive)

Q: "Do you deal with breakouts?"
  ○ Rarely or never
  ○ Sometimes (monthly)
  ○ Often (weekly)
  ○ Very often (almost daily)

Q: "What are your main skin concerns?" (multi-select)
  ☐ Acne / breakouts
  ☐ Dark spots / hyperpigmentation
  ☐ Anti-aging / wrinkles
  ☐ Dullness
  ☐ Redness / irritation
  ☐ Large pores

Visual: Illustrated face showing the selected skin type with color-coded zones
```

Data saved to: `profile.skin_type`, `profile.skin_concerns` (array in JSONB)

---

### Step 4 — Hair (`step-4-hair.tsx`)
```
Progress: ●●●●○○

"Now, your hair."

Q: "What's your natural hair texture?"
  [Visual cards with illustrations]
  ○ Straight    ○ Wavy    ○ Curly    ○ Coily

Q: "How thick is each strand?"
  ○ Fine (can barely feel it between fingers)
  ○ Medium
  ○ Thick (coarse, very noticeable)

Q: "Do you have a beard?"
  ○ Yes, and I actively maintain it
  ○ Yes, but I don't know how
  ○ No beard

Q: "Any hair concerns?" (multi-select)
  ☐ Thinning / hair loss
  ☐ Dandruff
  ☐ Dry / brittle
  ☐ Oily scalp
  ☐ None
```

Data saved to: `profile.hair_type`, `profile.hair_thickness`, `profile.hair_concerns`, `profile.has_beard`

---

### Step 5 — Goals (`step-5-goals.tsx`)
```
Progress: ●●●●●○

"What do you want to achieve?" (multi-select)
  ☐ Clear, healthy skin
  ☐ Better hairstyle
  ☐ Beard growth & shaping
  ☐ Look more put-together
  ☐ Anti-aging
  ☐ Build a consistent routine

"How much time can you spare daily?"
  ○ 2 minutes (bare minimum)
  ○ 5 minutes (quick & effective)
  ○ 10 minutes (full routine)
  ○ 15+ minutes (all-in)

"What's your grooming budget?"
  ○ Budget ($0–$30/month on products)
  ○ Mid-range ($30–$80/month)
  ○ Premium ($80+/month)
```

Data saved to: `profile.grooming_goals`, `profile.daily_time_available`, `profile.budget_range`

---

### Step 6 — Trial Launch (`step-6-trial.tsx`)
```
Visual: Animated "building your plan" screen (Lottie + progress bar)
        Shows personalized insights appearing one by one:
        
        ✓ Face shape detected: Oval
        ✓ Skin type: Combination
        ✓ Personalized morning routine: 3 steps
        ✓ Recommended haircuts: 8 styles
        ✓ Your plan: Ready

Then transitions to:

"[Name], your grooming blueprint is ready."

"Start your free 7-day premium trial"
[Big glowing CTA button]

Under button: "No credit card needed. Cancel anytime."

Below: "Continue with free plan →" (smaller, less prominent)
```

**Psychological triggers on this screen:**
- Shows *their specific data* back to them (investment payoff)
- "7-day trial" not "7-day free" — trial implies something valuable
- "No credit card needed" removes friction
- Free option exists but is visually de-emphasized

**Implementation:**
```tsx
import Purchases from 'react-native-purchases'
import { router } from 'expo-router'

async function startTrial() {
  // NOTE: The `handle_new_user` Supabase trigger (see 13-supabase-setup.md) already sets
  // subscription_status = 'trial' and trial_ends_at = NOW() + 7 days on signup.
  // This function only needs to mark onboarding as complete and navigate.
  // Do NOT duplicate the trial fields here — it creates a race condition with the trigger.
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true, onboarding_step: 6 })
    .eq('id', user.id)

  if (!error) router.replace('/(tabs)/home')
}
```

---

## Onboarding State Management

```typescript
// stores/user.store.ts (Zustand)
interface OnboardingState {
  step: number
  basics: { fullName: string }
  face: { shape: string; method: 'selfie' | 'quiz' }
  skin: { type: string; concerns: string[] }
  hair: { type: string; thickness: string; concerns: string[]; hasBeard: boolean }
  goals: { goals: string[]; timeAvailable: string; budget: string }
}

// Store in Zustand during flow, write to Supabase only at step 6
// This avoids partial writes and keeps onboarding fast
```

---

## Progress Bar Component
```tsx
// components/onboarding/ProgressBar.tsx
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'

export function OnboardingProgress({ step, total }: { step: number; total: number }) {
  const progress = step / total
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`, { damping: 20 })
  }))

  return (
    <View style={{ height: 3, backgroundColor: '#1a1a1a', borderRadius: 2 }}>
      <Animated.View
        style={[{ height: 3, backgroundColor: '#C9A84C', borderRadius: 2 }, animatedStyle]}
      />
    </View>
  )
}
```
