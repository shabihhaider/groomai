# Phase 8 — AR Hairstyle Try-On

## Goal
Users can point their camera at their face, select a hairstyle, and see a real-time 3D AR overlay of the hairstyle on their head. They can capture a screenshot and save/share it. This is a premium wow-factor feature and the most technically complex part of the app — it is intentionally built last.

## Complexity: Very High (depends on physical .deepar files)
## Estimated Time: 3–5 days (longer if effect files need to be sourced first)

---

## Reference Docs
- `docs/version2/08-ar-tryon.md` — DeepAR SDK setup, `lib/deepar.ts`, `ar-tryon.tsx`, Platform.select, performance notes

---

## Pre-Condition (Blocker)
> ⛔ This phase **cannot start** until `.deepar` effect files are acquired. See `17-environment-setup.md` Section 4 for sourcing options. Budget $20–$150 per effect. Minimum 5 effects for V1 launch.
>
> Effect files must be placed in `assets/deepar-effects/hairstyles/` and `assets/deepar-effects/beards/`.
> The `deepar_effect_id` field in each `hairstyles` DB row must match the filename (without `.deepar`).

---

## Step-by-Step Tasks

### 8.1 — DeepAR SDK Setup
- [ ] Confirm `react-native-deepar` is in `package.json` and installed
- [ ] Create `lib/deepar.ts` — initializes DeepAR with `Platform.select` for iOS/Android keys:
  ```typescript
  import { Platform } from 'react-native'
  export const DEEPAR_API_KEY = Platform.select({
    ios: process.env.EXPO_PUBLIC_DEEPAR_IOS_KEY!,
    android: process.env.EXPO_PUBLIC_DEEPAR_ANDROID_KEY!,
  })
  ```
  **Do NOT use the iOS key on Android or vice versa — DeepAR keys are platform-specific.**
- [ ] Verify DeepAR license is configured for your app's bundle ID (`com.groomai.app`) in the DeepAR developer portal

### 8.2 — AR Try-On Screen
- [ ] `app/ar-tryon.tsx` — premium-gated entry
- [ ] `DeepARView` component renders full-screen camera with AR overlay
- [ ] `apiKey={Platform.select({ ios: DEEPAR_IOS_KEY, android: DEEPAR_ANDROID_KEY })}` — confirmed correct
- [ ] AR camera loads and face tracking activates within 2s of screen open
- [ ] Camera permission requested before rendering `DeepARView`

### 8.3 — Effect Selection UI
- [ ] Horizontal scroll carousel at the bottom of the AR screen
- [ ] Hairstyle thumbnails (from DB / `constants/hairstyles.ts`)
- [ ] Active hairstyle highlighted with gold border
- [ ] Tapping a hairstyle calls `deepARRef.current?.switchEffect(effectPath)` to swap the AR overlay
- [ ] Effect path: `assets/deepar-effects/hairstyles/{deepar_effect_id}.deepar`
- [ ] Smooth transition between effects — no black flash
- [ ] Tab switching between "Hair" and "Beard" effect categories

### 8.4 — Screenshot & Share
- [ ] Camera icon button → `deepARRef.current?.takeScreenshot()` → returns base64
- [ ] Save screenshot to device camera roll using `expo-media-library`
  - Request `MEDIA_LIBRARY` permission before saving
- [ ] Share sheet using React Native `Share.share()` with the screenshot image
- [ ] "Screenshot saved!" toast confirmation

### 8.5 — Performance Optimization
- [ ] Face tracking stops when app goes to background (handle `AppState` change)
- [ ] DeepAR view is unmounted when navigating away (do not keep it running in background)
- [ ] Show a "Loading AR..." indicator while the first effect loads (effects take 1–3s to load)
- [ ] Limit carousel to 10 effects visible at a time — load more on scroll (avoid memory pressure)
- [ ] Test on low-end Android (API 26) — DeepAR is GPU-intensive; add a minimum device spec note if performance is unacceptable on old devices

### 8.6 — XP & Analytics
- [ ] Award "+100 XP" on first ever AR try-on session
- [ ] Track which hairstyles are tried most — increment `view_count` in `hairstyles` table
- [ ] Log PostHog event: `ar_tryon_used` with `{ hairstyle_id, platform }`

---

## Done When
- [ ] AR camera opens and begins face tracking on a physical iOS device
- [ ] AR camera opens and begins face tracking on a physical Android device (API 26+)
- [ ] Switching effects changes the hairstyle overlay without flickering
- [ ] Screenshot is saved to the device camera roll
- [ ] Share sheet opens with the AR screenshot
- [ ] AR camera pauses when the app goes to background
- [ ] First-use XP award fires correctly
- [ ] Feature is hard-gated — free users cannot access this screen at all
