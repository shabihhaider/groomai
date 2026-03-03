# Navigation Structure

## Overview
Using **Expo Router v4** (file-based routing). This gives deep linking, web support, and clean URL-like navigation out of the box.

---

## Full Screen Map

```
App Launch
│
├── /                          → Splash + Auth Check
│   ├── No session → (auth)
│   └── Has session → check onboarding_completed
│       ├── false → (onboarding)
│       └── true → (tabs)
│
├── (auth)/
│   ├── welcome.tsx            → Hero screen, Sign In / Sign Up CTAs
│   ├── sign-in.tsx            → Email + Google + Apple
│   └── sign-up.tsx            → Email + Google + Apple
│
├── (onboarding)/              → 6-step onboarding wizard
│   ├── step-1-basics.tsx      → Name, age, location
│   ├── step-2-face.tsx        → Face shape quiz OR selfie scan
│   ├── step-3-skin.tsx        → Skin type quiz + concerns
│   ├── step-4-hair.tsx        → Hair type, thickness, concerns
│   ├── step-5-goals.tsx       → Grooming goals, time available, budget
│   └── step-6-trial.tsx       → "Your plan is ready" + Premium trial start
│
└── (tabs)/                    → Main App (Bottom Tab Navigator)
    ├── home.tsx               → Dashboard — streak, today's routine, tips
    ├── routines.tsx           → Routine builder + checklist
    ├── barber.tsx             → Barber Translator (AR Try-On is v2)
    ├── tracker.tsx            → Habit tracker, badges, XP, progress
    └── profile.tsx            → Settings, subscription, skin/hair log
        │
        └── Modals / Full Screens (pushed from tabs):
        ├── ar-tryon.tsx           [PREMIUM] (v2 only; hidden in v1)
            ├── skin-analysis.tsx      [PREMIUM]
            ├── product-scanner.tsx    [PREMIUM]
            ├── hair-loss-tracker.tsx  [PREMIUM]
            ├── paywall.tsx            → Shown when free user hits premium feature
            ├── badge-unlock.tsx       → Full-screen celebration when badge earned
            ├── hairstyle-detail.tsx   → Single hairstyle view + barber card
            └── routine-editor.tsx     → Add/edit routine steps
```

---

## Navigation Setup

### `app/_layout.tsx` — Root Layout
```tsx
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useUserStore } from '@/stores/user.store'
import { supabase } from '@/lib/supabase'

export default function RootLayout() {
  const { setUser, setSession } = useUserStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="paywall"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="badge-unlock"
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen
        name="ar-tryon"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  )
}
```

### `app/(tabs)/_layout.tsx` — Custom Tab Bar
```tsx
import { Tabs } from 'expo-router'
import { CustomTabBar } from '@/components/ui/CustomTabBar'

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="routines" options={{ title: 'Routines' }} />
      <Tabs.Screen name="barber" options={{ title: 'Barber' }} />
      <Tabs.Screen name="tracker" options={{ title: 'Progress' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}
```

---

## Auth Guard (Paywall Gate)

Every premium feature check follows this pattern:

```tsx
// hooks/useSubscription.ts
import { useUserStore } from '@/stores/user.store'
import { router } from 'expo-router'

export function useSubscription() {
  const { profile } = useUserStore()

  const isPremium = ['premium', 'lifetime', 'trial'].includes(
    profile?.subscription_status ?? ''
  )

  function requirePremium(callback: () => void) {
    if (isPremium) {
      callback()
    } else {
      router.push('/paywall')
    }
  }

  return { isPremium, requirePremium }
}

// Usage in any screen:
const { requirePremium } = useSubscription()

<Button
  onPress={() => requirePremium(() => router.push('/ar-tryon'))}
  label="Try On Hairstyle"
/>
```

---

## Deep Linking Config (`app.json`)

```json
{
  "expo": {
    "scheme": "groomai",
    "web": { "bundler": "metro" },
    "plugins": [
      ["expo-router", {
        "root": "app"
      }]
    ]
  }
}
```

Deep links enabled:
- `groomai://sign-in` — for email magic link auth
- `groomai://paywall` — for marketing campaigns
- `groomai://barber` — for barber sharing feature
- `groomai://hairstyle/[id]` — for social sharing specific styles

---

## Transition Animations

Every screen transition must feel premium. Use Reanimated 3:

```tsx
// components/ui/AnimatedScreen.tsx
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'

export function AnimatedScreen({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      exiting={FadeOutUp.duration(300)}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  )
}
```

Apply `AnimatedScreen` wrapper to every tab and stack screen.
