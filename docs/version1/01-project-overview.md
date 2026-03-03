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
| React Native (0.81+) | Cross-platform iOS + Android |
| Expo (SDK 54+) | Runs in Expo Go for v1 (no native modules needed). DeepAR is v2 and will require a dev build. |
| TypeScript | Type safety throughout |
| StyleSheet.create | Styling system (standard React Native stylesheets) |
| Expo Router v4 (expo-router ~6) | File-based navigation (Stack + Tabs) |
| Reanimated 4 | Premium micro-animations |
| Lottie React Native | Animated illustrations (onboarding, badges) |
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
| OpenAI API (GPT-4o Vision) | Skin analysis, routine generation, product analysis, celebrity breakdown (all via Edge Functions — no on-device ML) |

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

> **Note (v1):** The app runs in **Expo Go** for v1 development. DeepAR AR Try-On is deferred to v2 and will require an EAS dev build.
> NativeWind is NOT used — all styling uses standard `StyleSheet.create`.

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
│   ├── ar-tryon.tsx              # v2 only; hidden placeholder in v1
│   ├── ai-routine.tsx            # AI Routine Generator
│   ├── skin-analysis.tsx
│   ├── product-scanner.tsx
│   ├── hair-loss-tracker.tsx
│   ├── celebrity-breakdown.tsx   # Celebrity hairstyle breakdown
│   ├── badge-unlock.tsx          # Badge celebration screen
│   ├── hairstyle-detail.tsx      # Single hairstyle view
│   ├── routine-editor.tsx        # Routine step checklist
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
│   ├── analytics.ts              # PostHog + Sentry wrapper
│   ├── edgeFunctions.ts          # Standardized Edge Function caller
│   └── queryClient.ts            # React Query client config
├── services/
│   ├── auth.service.ts
│   ├── routine.service.ts
│   ├── habit.service.ts
│   ├── barber.service.ts
│   ├── skin.service.ts
│   ├── hairloss.service.ts
│   ├── product.service.ts        # Barcode + ingredient analysis
│   ├── affiliate.service.ts      # Profile-based product filtering
│   └── subscription.service.ts
├── stores/
│   ├── user.store.ts             # Zustand — session, profile, onboarding
│   └── subscription.store.ts     # Zustand — isPremium, reset()
├── hooks/
│   ├── useSubscription.ts
│   ├── useHabits.ts
│   ├── useRoutine.ts
│   ├── useAffiliate.ts           # Affiliate recommendations + product scans
│   ├── useAI.ts                  # AI feature hooks
│   ├── useBarber.ts
│   └── useNetworkState.ts
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── hairstyles.ts             # Full hairstyle library data
│   ├── hairstyleImages.ts        # Hairstyle image mappings
│   ├── affiliateProducts.ts      # 20 affiliate products across 11 categories
│   ├── defaultRoutines.ts        # Seed routines by skin type
│   ├── dailyTips.ts              # Rotating daily tips
│   └── badges.ts                 # Badge definitions
├── types/
│   └── supabase.ts               # Auto-generated — run: supabase gen types typescript --project-id YOUR_ID > types/supabase.ts
├── utils/
│   ├── faceShape.ts              # Face shape detection logic
│   ├── streaks.ts                # Streak calculation
│   └── notifications.ts         # Push notification scheduling
├── assets/
│   ├── animations/               # Lottie JSON files
│   ├── images/
│   └── deepar-effects/           # AR effect files (v2 — empty for now)
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
    "expo": "^54",
    "expo-router": "~6.0.23",
    "expo-dev-client": "~6.0.20",
    "react-native": "0.81.5",
    "typescript": "^5.3.0",
    "react-native-reanimated": "~4.1.1",
    "lottie-react-native": "~7.3.1",
    "@supabase/supabase-js": "^2.49.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.62.0",
    "react-native-purchases": "^9.10.3",
    "@gorhom/bottom-sheet": "^5.1.0",
    "expo-camera": "~17.0.10",
    "expo-notifications": "~0.32.16",
    "expo-image-picker": "~17.0.10",
    "expo-apple-authentication": "~8.0.8",
    "expo-media-library": "~18.2.1",
    "expo-linear-gradient": "~15.0.8",
    "expo-blur": "~15.0.8",
    "@react-native-async-storage/async-storage": "2.2.0",
    "react-native-svg": "15.12.1",
    "date-fns": "^4.1.0",
    "@sentry/react-native": "~7.2.0",
    "@react-native-community/netinfo": "11.4.1",
    "expo-haptics": "~15.0.8",
    "expo-updates": "~29.0.16",
    "expo-sharing": "~14.0.8",
    "react-native-view-shot": "4.0.3"
  }
}
```

> **Note:** `expo-barcode-scanner` is removed — barcode scanning is handled by `expo-camera`'s built-in `onBarcodeScanned` prop (SDK 51+). `react-native-camera` is removed — it is deprecated and conflicts with `expo-camera`. `nativewind` is NOT used — all styling uses standard `StyleSheet.create`. `react-native-deepar` is NOT installed (v2 only). `posthog-react-native` is NOT installed — PostHog events are sent via REST API.
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
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

> **Note:** DeepAR keys (`EXPO_PUBLIC_DEEPAR_IOS_KEY`, `EXPO_PUBLIC_DEEPAR_ANDROID_KEY`) are not needed for v1 — AR Try-On is deferred to v2.

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
