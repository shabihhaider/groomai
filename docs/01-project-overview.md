# Project Overview — GroomAI (Blueprint)

## Vision
A premium, AI-powered men's grooming companion that feels like having a personal stylist, dermatologist, and barber in your pocket. Every interaction should feel personalized, premium, and slightly addictive. Think: the polish of Apple Fitness+, the gamification of Duolingo, and the personalization of Spotify — but for men's grooming.

---

## App Name
**GroomAI** (working title — can be swapped with Blueprint, Forma, or Grail)

**Tagline:** *Your daily edge.*

---

## Core Philosophy (Build Around This)
1. **Remove guesswork** — Men don't know what works for them. Every recommendation is personalized.
2. **Make it feel effortless** — Clean UI, minimal taps, maximum value.
3. **Make progress visible** — Streaks, badges, before/after, skin logs. Users must *see* they're improving.
4. **Premium feel from frame 1** — No cheap UI, no clutter. Every screen should feel like it belongs in the App Store's "Apps We Love."

---

## Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React Native (0.76+) | Cross-platform iOS + Android |
| Expo (Development Build) | Required for native modules (DeepAR). Uses `expo-dev-client` — NOT Expo Go. |
| TypeScript | Type safety throughout |
| NativeWind (Tailwind for RN) | Styling system |
| Expo Router v4 | File-based navigation (Stack + Tabs) |
| Reanimated 3 | Premium micro-animations |
| Lottie React Native | Animated illustrations (onboarding, badges) |
| DeepAR React Native SDK | AR Hairstyle + Beard try-on |
| Expo Camera | Selfie capture (skin analysis, hair loss tracker, barcode scanning) |
| Expo Notifications | Push notifications (habit reminders) |
| AsyncStorage | Local caching |
| Zustand | Global state management (lightweight, fast) |
| React Query (TanStack) | Server state, caching API calls |
| RevenueCat | Subscription management (iOS + Android unified) |

### Backend
| Tech | Purpose |
|---|---|
| Supabase | Auth, PostgreSQL DB, Storage, Edge Functions, Realtime |
| Supabase Auth | Email, Google, Apple Sign-In |
| Supabase Storage | Profile photos, hair loss photos, skin selfies |
| Supabase Edge Functions | Server-side logic (AI calls, affiliate tracking) |
| Google ML Kit (on-device) | Face landmark detection, skin analysis |
| OpenAI API (GPT-4o) | Routine generation, AI product recommendations |

### Monetization
| Tech | Purpose |
|---|---|
| RevenueCat | Subscription logic, paywall, trial management — handles monthly, annual, AND lifetime purchases natively through App Store / Play Store. No Stripe needed. |

### Analytics & Growth
| Tech | Purpose |
|---|---|
| PostHog | Product analytics, funnel tracking, feature flags |
| Sentry | Error monitoring |
| expo-notifications | Push notifications — used directly via Expo. OneSignal is NOT used; all notification code uses the expo-notifications API. |

---

## Folder Structure

```
groomai/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── welcome.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (onboarding)/
│   │   ├── step-1-basics.tsx
│   │   ├── step-2-face.tsx
│   │   ├── step-3-skin.tsx
│   │   ├── step-4-hair.tsx
│   │   ├── step-5-goals.tsx
│   │   └── step-6-trial-start.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── routines.tsx
│   │   ├── barber.tsx
│   │   ├── tracker.tsx
│   │   └── profile.tsx
│   ├── ar-tryon.tsx
│   ├── skin-analysis.tsx
│   ├── product-scanner.tsx
│   ├── hair-loss-tracker.tsx
│   ├── paywall.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                       # Design system components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Avatar.tsx
│   │   └── BottomSheet.tsx
│   ├── onboarding/
│   ├── routine/
│   ├── barber/
│   ├── tracker/
│   └── paywall/
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── revenuecat.ts             # RevenueCat setup
│   ├── deepar.ts                 # DeepAR setup
│   └── openai.ts                 # OpenAI client
├── services/
│   ├── auth.service.ts
│   ├── routine.service.ts
│   ├── habit.service.ts
│   ├── barber.service.ts
│   ├── skin.service.ts
│   ├── hairloss.service.ts
│   └── subscription.service.ts
├── stores/
│   ├── user.store.ts             # Zustand — user profile
│   ├── routine.store.ts
│   ├── habit.store.ts
│   └── subscription.store.ts
├── hooks/
│   ├── useSubscription.ts
│   ├── useHabits.ts
│   ├── useRoutine.ts
│   └── useFaceAnalysis.ts
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   ├── hairstyles.ts             # Full hairstyle library data
│   ├── ingredients.ts            # Ingredient safety data
│   └── badges.ts                 # Badge definitions
├── types/
│   └── supabase.ts               # Auto-generated — run: supabase gen types typescript --project-id YOUR_ID > types/supabase.ts
├── utils/
│   ├── faceShape.ts              # Face shape detection logic
│   ├── skinType.ts               # Skin type scoring logic
│   ├── streaks.ts                # Streak calculation
│   └── notifications.ts
├── assets/
│   ├── animations/               # Lottie JSON files
│   ├── images/
│   └── deepar-effects/           # AR effect files
├── supabase/
│   ├── migrations/               # DB migrations
│   └── functions/                # Edge functions
├── app.json
├── package.json
└── tsconfig.json
```

---

## Key Dependencies (package.json)

```json
{
  "dependencies": {
    "expo": "~53.0.0",
    "expo-router": "~4.0.0",
    "expo-dev-client": "~5.0.0",
    "react-native": "0.76.x",
    "typescript": "^5.3.0",
    "nativewind": "^4.1.0",
    "react-native-reanimated": "~3.16.0",
    "lottie-react-native": "7.1.0",
    "@supabase/supabase-js": "^2.46.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.62.0",
    "react-native-purchases": "^8.2.0",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "@react-navigation/stack": "^7.0.0",
    "react-native-deepar": "^1.5.0",
    "expo-camera": "~16.0.0",
    "expo-notifications": "~0.29.0",
    "expo-image-picker": "~16.0.0",
    "expo-apple-authentication": "~7.1.0",
    "expo-media-library": "~17.0.0",
    "expo-linear-gradient": "~14.0.0",
    "expo-blur": "~14.0.0",
    "@react-native-async-storage/async-storage": "2.1.0",
    "react-native-bottom-sheet": "^5.0.0",
    "react-native-svg": "15.8.0",
    "date-fns": "^4.1.0",
    "posthog-react-native": "^3.3.0",
    "@sentry/react-native": "^6.5.0",
    "@react-native-community/netinfo": "^11.4.0",
    "expo-haptics": "~14.0.0",
    "expo-updates": "~0.26.0",
    "expo-sharing": "~12.0.0",
    "react-native-view-shot": "^3.8.0"
  }
}
```

> **Note:** `expo-barcode-scanner` is removed — barcode scanning is handled by `expo-camera`'s built-in `onBarcodeScanned` prop (SDK 51+). `react-native-camera` is removed — it is deprecated and conflicts with `expo-camera`.
```

---

## Environment Variables

### Mobile app (.env) — safe to have on developer machines, bundled into app

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_rc_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_rc_android_key
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
EXPO_PUBLIC_DEEPAR_IOS_KEY=your_deepar_ios_key
EXPO_PUBLIC_DEEPAR_ANDROID_KEY=your_deepar_android_key
```

### Server-only secrets — NEVER in .env, NEVER in the mobile bundle

These keys must live **exclusively** in:
- **Supabase Secrets Dashboard** (Settings → Edge Functions → Secrets) for Edge Functions
- **CI/CD environment variables** (GitHub Actions, EAS Secrets) for build pipelines

```
SUPABASE_SERVICE_ROLE_KEY   ← Supabase Secrets only
OPENAI_API_KEY              ← Supabase Secrets only
REVENUECAT_WEBHOOK_SECRET   ← Supabase Secrets only
```

> If either `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` ever appears in a `.env` file at the project root, it will be bundled into the app binary. Anyone who downloads your app can extract it with standard reverse-engineering tools.

---

## App Store Details

| Item | iOS | Android |
|---|---|---|
| Developer Account | Apple Developer ($99/yr) | Google Play ($25 one-time) |
| Bundle ID | com.groomai.app | com.groomai.app |
| Min OS | iOS 15+ | Android 8.0+ (API 26+) |
| Permissions Needed | Camera, Notifications, Photo Library | Camera, Notifications, Storage |

---

## Premium Feel Checklist (Non-Negotiable)
- [ ] Dark mode first (primary), light mode optional
- [ ] All transitions use Reanimated 3 (no default RN animations)
- [ ] Haptic feedback on every key interaction (badge earned, streak milestone, paywall CTA)
- [ ] No loading spinners — use skeleton screens everywhere
- [ ] Lottie animations for empty states, success states, badge unlocks
- [ ] Bottom sheets instead of modals wherever possible
- [ ] Blur effects on overlays (expo-blur)
- [ ] Custom tab bar with animated icons
