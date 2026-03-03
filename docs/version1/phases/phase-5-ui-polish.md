# Phase 5 — UI Polish & Design System

## Goal
Every screen built in Phases 1–4 gets polished to App Store "Apps We Love" quality. The design system is fully implemented. Every button, card, and transition matches the dark-first, gold-accent brand. No screen should look like a prototype after this phase.

## Complexity: Medium
## Estimated Time: 3–4 days

---

## Reference Docs
- `14-ui-design-system.md` — colors, typography, components, animation rules
- `03-navigation.md` — transition animations, `AnimatedScreen` wrapper

---

## Color Tokens (Memorize These)
| Token | Value |
|---|---|
| Background | `#0A0A0A` |
| Surface | `#141414` |
| Surface Elevated | `#1E1E1E` |
| Brand Gold | `#C9A84C` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#A0A0A0` |
| Text Tertiary | `#555555` |
| Success | `#4CAF50` |
| Error | `#E53935` |

---

## Step-by-Step Tasks

### 5.1 — Color & Typography Constants
- [ ] Create `constants/colors.ts` — all tokens from `14-ui-design-system.md`
- [ ] Create `constants/typography.ts` — font sizes, weights, line heights
- [ ] Configure NativeWind with custom theme values to match these tokens

### 5.2 — Core UI Components (Design System)
Build each component to the spec in `14-ui-design-system.md`:
- [ ] `components/ui/Button.tsx`
  - [ ] Variants: `primary` (gold fill), `secondary` (border), `ghost`
  - [ ] Spring scale animation on press (`useAnimatedStyle` + `withSpring`)
  - [ ] Haptic feedback on every press (`expo-haptics`)
  - [ ] Loading state with spinner
  - [ ] Disabled state (opacity 0.4)
- [ ] `components/ui/Card.tsx` — `#141414` background, 16px radius, optional gold border
- [ ] `components/ui/Badge.tsx` — pill shape, colored variants by rarity (`common`, `rare`, `epic`, `legendary`)
- [ ] `components/ui/ProgressBar.tsx` — animated gold fill, spring eased
- [ ] `components/ui/Avatar.tsx` — circular with fallback initials
- [ ] `components/ui/BottomSheet.tsx` — wraps `react-native-bottom-sheet`, dark handle, blur backdrop
- [ ] `components/ui/CustomTabBar.tsx` — custom bottom tab with gold indicator on active tab

### 5.3 — Screen Transitions
- [ ] Wrap every tab screen and stack screen in `components/ui/AnimatedScreen.tsx` (see `03-navigation.md`)
  - Entering: `FadeInDown.duration(400).springify()`
  - Exiting: `FadeOutUp.duration(300)`
- [ ] Paywall modal: `slide_from_bottom` animation
- [ ] Badge unlock modal: `fade` transparent modal animation

### 5.4 — Apply Design System to All Existing Screens
Go through each screen built in Phases 2–4 and replace placeholder styling:
- [ ] Welcome / Sign-In / Sign-Up — full dark background, gold CTAs, correct typography
- [ ] Onboarding steps — one-question-per-screen feel, large typography, smooth transitions
- [ ] Routines tab — RoutineCard with animated progress bar, correct color states (gold → green on completion)
- [ ] Routine detail — step rows with spring check animation, XP toast
- [ ] Tracker tab — XP bar, level badge, badge grid with glow on earned badges
- [ ] Paywall — premium feel, gold highlights, feature list
- [ ] Home tab — dashboard tiles, streak card, XP mini bar

### 5.5 — Micro-Animations
Every interaction must have feedback:
- [ ] Every `Button` press: scale 0.97 → 1.00 with spring + haptic
- [ ] Step completion: circle → checkmark morphing animation
- [ ] XP bar fill: smooth `withTiming` animation when XP increases
- [ ] Badge unlock: Lottie plays on `badge-unlock.tsx` modal
- [ ] Streak number increment: brief bounce animation
- [ ] Tab switch: `FadeInDown.springify()` on each tab's root view

### 5.6 — Empty States
- [ ] Routine empty state — "No routine yet. Let's build one." with CTA
- [ ] Badge grid empty state — locked badge placeholders shown dimmed

### 5.7 — Haptic Strategy
Apply haptics from `expo-haptics` consistently:
- [ ] `ImpactFeedbackStyle.Light` — button press, step completion
- [ ] `ImpactFeedbackStyle.Medium` — full routine completion
- [ ] `NotificationFeedbackType.Success` — badge earned, level up
- [ ] `NotificationFeedbackType.Warning` — trial expiring warning

---

## Done When
- [ ] Every screen uses `#0A0A0A` background and `#C9A84C` gold accent — no white backgrounds, no default blue buttons
- [ ] Every button press has scale animation + haptic feedback
- [ ] Every screen transition uses `AnimatedScreen` wrapper
- [ ] Progress bars animate smoothly on load
- [ ] Badge unlock plays Lottie animation
- [ ] App feels like a premium product at this stage — no placeholder or default styling remains
