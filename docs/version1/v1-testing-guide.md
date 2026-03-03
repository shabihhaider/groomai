# GroomAI v1 — Engineering Testing Guide

> **Version:** 1.0 · **Date:** 2026-03-01
>
> This document is a **module-by-module QA checklist** designed for software engineers testing the GroomAI v1 app. Each module lists preconditions, step-by-step test cases, expected results, and edge cases.

---

## Table of Contents

1. [Environment Setup](#1-environment-setup)
2. [Module 1 — Authentication](#module-1--authentication)
3. [Module 2 — Onboarding](#module-2--onboarding)
4. [Module 3 — Home Tab](#module-3--home-tab)
5. [Module 4 — Routines Tab](#module-4--routines-tab)
6. [Module 5 — Routine Editor](#module-5--routine-editor)
7. [Module 6 — AI Routine Generator](#module-6--ai-routine-generator)
8. [Module 7 — Barber Tab](#module-7--barber-tab)
9. [Module 8 — Hairstyle Detail](#module-8--hairstyle-detail)
10. [Module 9 — Celebrity Breakdown](#module-9--celebrity-breakdown)
11. [Module 10 — AI Skin Analysis](#module-10--ai-skin-analysis)
12. [Module 11 — Product Scanner](#module-11--product-scanner)
13. [Module 12 — Hair Loss Tracker](#module-12--hair-loss-tracker)
14. [Module 13 — Tracker Tab (Habits, XP, Badges)](#module-13--tracker-tab)
15. [Module 14 — Profile Tab](#module-14--profile-tab)
16. [Module 15 — Paywall & Subscription](#module-15--paywall--subscription)
17. [Module 16 — Affiliate System](#module-16--affiliate-system)
18. [Module 17 — Analytics & Error Reporting](#module-17--analytics--error-reporting)
19. [Module 18 — Push Notifications](#module-18--push-notifications)
20. [Module 19 — Error Handling & Edge Cases](#module-19--error-handling--edge-cases)
21. [Module 20 — Performance & Polish](#module-20--performance--polish)

---

## 1. Environment Setup

### Prerequisites

| # | Requirement | How to verify |
|---|---|---|
| 1 | Node.js ≥ 18 | `node --version` |
| 2 | Expo CLI installed | `npx expo --version` |
| 3 | Physical iOS or Android device (or simulator) | — |
| 4 | Expo Go installed OR EAS dev build | — |
| 5 | `.env` configured with Supabase URL + Anon Key | Check `groomai/.env` |
| 6 | All 9 DB migrations applied on Supabase | Dashboard → SQL Editor → check tables |
| 7 | `hair-loss-photos` bucket (private) created | Dashboard → Storage |
| 8 | `skin-analysis` bucket (public) created | Dashboard → Storage |
| 9 | `OPENAI_API_KEY` in Supabase Secrets | Dashboard → Edge Functions → Secrets |
| 10 | 5 Edge Functions deployed | `analyze-skin`, `analyze-product`, `generate-routine`, `analyze-hairstyle`, `revenuecat-webhook` |

### Start the dev server

```bash
cd groomai
npx expo start --go -c
```

### Test accounts

| User | Type | Purpose |
|---|---|---|
| `test-free@groomai.com` | Free user | Tests free tier limits, paywall gates |
| `test-premium@groomai.com` | Premium user (sandbox purchase) | Tests premium features |
| New user signup | Fresh user | Tests onboarding + first-use flows |

---

## Module 1 — Authentication

**Files:** `app/(auth)/welcome.tsx`, `app/(auth)/sign-in.tsx`, `app/(auth)/sign-up.tsx`, `services/auth.service.ts`

### TC-AUTH-01: Sign Up (Happy Path)

| Step | Action | Expected Result |
|---|---|---|
| 1 | Launch app, cold start | Welcome screen loads with logo, tagline, two CTAs |
| 2 | Tap **Create Account** | Navigates to sign-up screen |
| 3 | Enter valid name, email, password (≥6 chars) | All fields accept input; no validation errors |
| 4 | Tap **Sign Up** | Loading indicator shown → navigates to Onboarding Step 1 |
| 5 | Check Supabase Auth dashboard | New user row created |

### TC-AUTH-02: Sign Up (Duplicate Email)

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter an email that already exists | — |
| 2 | Tap **Sign Up** | In-app error: "An account with this email already exists" |

### TC-AUTH-03: Sign Up (Validation)

| Step | Action | Expected Result |
|---|---|---|
| 1 | Leave email empty, tap Sign Up | Error: email required |
| 2 | Enter invalid email format | Error: invalid email |
| 3 | Enter password < 6 chars | Error: password too short |

### TC-AUTH-04: Sign In (Happy Path)

| Step | Action | Expected Result |
|---|---|---|
| 1 | From Welcome, tap **Sign In** | Sign-in screen opens |
| 2 | Enter valid credentials | Loading → redirects to Home Tab (if onboarding complete) or Onboarding (if not) |

### TC-AUTH-05: Sign In (Wrong Credentials)

| Step | Action | Expected Result |
|---|---|---|
| 1 | Enter wrong password | Error: "Invalid login credentials" |

### TC-AUTH-06: Session Persistence

| Step | Action | Expected Result |
|---|---|---|
| 1 | Sign in successfully | Lands on Home |
| 2 | Kill the app process entirely | — |
| 3 | Re-open app | Lands on Home (not Welcome/Sign-in) — session persisted |

### TC-AUTH-07: Sign Out

| Step | Action | Expected Result |
|---|---|---|
| 1 | Profile tab → **Sign Out** | Alert: "Are you sure?" |
| 2 | Tap **Sign Out** in alert | Returns to Welcome screen. Zustand stores reset (`user.store`, `subscription.store`), React Query cache cleared (`queryClient.clear()`), navigates to `/(auth)/welcome`. |
| 3 | Kill and reopen app | Stays on Welcome (session cleared) |
| 4 | Tap back (Android) or swipe back | Should NOT return to profile — navigation stack is replaced |

---

## Module 2 — Onboarding

**Files:** `app/(onboarding)/step-1-basics.tsx` through `step-6-trial.tsx`

### TC-ONB-01: Full Happy Path

| Step | Screen | Action | Expected |
|---|---|---|---|
| 1 | Step 1 — Basics | Enter name, age, nationality | **Next** button activates |
| 2 | Step 2 — Face Shape | Tap one shape (e.g. Oval) | Card highlights gold; Next activates |
| 3 | Step 3 — Skin | Pick skin type + concerns | Multi-select toggles work; Next activates |
| 4 | Step 4 — Hair | Pick type, texture, length | All selectors functional |
| 5 | Step 5 — Goals | Pick 1–4 goals | Next activates after ≥1 selection |
| 6 | Step 6 — Trial | See trial offer | Tap "Start Free Trial" |
| — | — | — | Redirects to Home tab; `profiles` row created in DB |

### TC-ONB-02: Skip Trial

| Step | Action | Expected |
|---|---|---|
| 1 | On Step 6, tap **Skip** (if visible) or dismiss | Lands on Home tab as Free user |

### TC-ONB-03: Back Navigation

| Step | Action | Expected |
|---|---|---|
| 1 | On Step 3, tap back arrow | Returns to Step 2 with previous selection preserved |

### TC-ONB-04: Profile Written to DB

| Step | Action | Expected |
|---|---|---|
| 1 | Complete all 6 steps | Check `profiles` in Supabase: face_shape, skin_type, hair_type, concerns all populated |

---

## Module 3 — Home Tab

**Files:** `app/(tabs)/home.tsx`

### TC-HOME-01: Dashboard Content

| # | Check | Expected |
|---|---|---|
| 1 | Greeting | "Good morning/afternoon/evening, [FirstName]." + today's date |
| 2 | Stat cards | Streak, Level, Total XP — all 3 visible |
| 3 | XP progress bar | Shows correct fill toward next level |
| 4 | Today's Routines | Morning + Night mini-cards with progress rings/bars |
| 5 | Daily Tip | Card present; content changes each calendar day |
| 6 | Products For You | 3 affiliate cards matching user's skin type |
| 7 | Tools section | 4 buttons: Skin AI, Scan, AI Routine, Hair Loss |
| 8 | Quick Actions | Routines, Badges, Barber — each navigates correctly |

### TC-HOME-02: Tools Navigation

| Button | Expected Navigation |
|---|---|
| Skin AI | → `/skin-analysis` |
| Scan | → `/product-scanner` |
| AI Routine | → `/ai-routine` |
| Hair Loss | → `/hair-loss-tracker` |

### TC-HOME-03: Skeleton Loading

| Step | Action | Expected |
|---|---|---|
| 1 | Throttle network (slow 3G) | Skeleton placeholders shown instead of spinners |
| 2 | Data loads | Skeletons replaced with real content smoothly |

---

## Module 4 — Routines Tab

**Files:** `app/(tabs)/routines.tsx`, `components/routine/RoutineCard.tsx`

### TC-RTN-01: Auto-Seed

| Step | Action | Expected |
|---|---|---|
| 1 | First login for new user | Morning + Night routines auto-seeded with default steps |

### TC-RTN-02: View Routines

| # | Check | Expected |
|---|---|---|
| 1 | Morning card | Shows name, step count, progress bar |
| 2 | Night card | Same format |
| 3 | Tap a card | Opens Routine Editor for that routine |

### TC-RTN-03: Routine Templates

| Step | Action | Expected |
|---|---|---|
| 1 | Scroll to Templates section | 8 templates shown in horizontal scroll |
| 2 | Free user taps a premium template | Redirected to Paywall |
| 3 | Premium user taps a template | Activates template, new routine created |

### TC-RTN-04: Create Custom Routine (Premium)

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Create Custom Routine** | Free → Paywall; Premium → Bottom sheet opens |
| 2 | Enter name, pick type | Create button activates |
| 3 | Tap **Create** | New routine card appears in list |

---

## Module 5 — Routine Editor

**Files:** `app/routine-editor.tsx`, `components/routine/StepTimer.tsx`

### TC-EDIT-01: Step Completion

| Step | Action | Expected |
|---|---|---|
| 1 | Open a routine | Steps listed with numbers + categories |
| 2 | Tap a step | Checkbox fills (animated); +10 XP toast appears |
| 3 | Tap again | Step uncompletes; checkbox empties |

### TC-EDIT-02: Full Routine Completion

| Step | Action | Expected |
|---|---|---|
| 1 | Complete all steps | 🎉 celebration overlay + "+50 XP Bonus" toast |
| 2 | Check Home tab | Streak incremented; routine card shows "✓ Complete" |

### TC-EDIT-03: Step Timer (Premium)

| Step | Action | Expected |
|---|---|---|
| 1 | As premium user, open a step with `duration_seconds > 0` | Timer button visible below the step |
| 2 | Tap timer | Countdown starts (e.g. 30s) |
| 3 | Timer reaches 0 | Step auto-completes with haptic feedback |

### TC-EDIT-04: Affiliate Inline Suggestion

| Step | Action | Expected |
|---|---|---|
| 1 | Open a routine with steps like "Apply Moisturizer" | Compact affiliate card appears below uncompleted step |
| 2 | Card shows | Brand, product name, price, "Soon" badge (since affiliates disabled) |

### TC-EDIT-05: Badge Award on Step Completion

| Step | Action | Expected |
|---|---|---|
| 1 | Complete the 1st ever routine step | Badge check runs in background |
| 2 | If badge earned ("Day One") | Full-screen badge unlock animation navigates to `badge-unlock` screen |

---

## Module 6 — AI Routine Generator

**Files:** `app/ai-routine.tsx`, `hooks/useAI.ts`, `supabase/functions/generate-routine/index.ts`

### TC-AIRTN-01: Generate Routine (Happy Path)

| Step | Action | Expected |
|---|---|---|
| 1 | Navigate to AI Routine from Home → Tools | Screen shows feature overview |
| 2 | Tap **Generate My Routine** | Loading: "Building your plan..." (~10–15s) |
| 3 | Results load | Review screen: Morning + Night steps with checkboxes |
| 4 | Deselect a step | Step dims visually |
| 5 | Tap **Save Routine** | Alert: "Routine Saved!" → navigates to Routines tab |
| 6 | Check Routines tab | New AI-generated routines appear (`is_ai_generated: true`) |

### TC-AIRTN-02: AI Unavailable

| Step | Action | Expected |
|---|---|---|
| 1 | With expired/missing OpenAI key | Tap Generate |
| 2 | — | Branded error: "AI Temporarily Unavailable" with calm messaging |
| 3 | — | No crash, no raw error shown |

### TC-AIRTN-03: Rate Limit

| Step | Action | Expected |
|---|---|---|
| 1 | Exceed daily limit | Tap Generate |
| 2 | — | Shows "Daily Limit Reached" with specific message |

---

## Module 7 — Barber Tab

**Files:** `app/(tabs)/barber.tsx`, `constants/hairstyles.ts`

### TC-BARB-01: Browse Hairstyles

| Step | Action | Expected |
|---|---|---|
| 1 | Open Barber tab | Grid of style cards shows |
| 2 | Tap filter chip (Short, Medium, etc.) | Grid updates with filtered results |
| 3 | Scroll horizontally in "For Your Face" | Personalized section based on profile face_shape |

### TC-BARB-02: Premium Lock on Styles

| Step | Action | Expected |
|---|---|---|
| 1 | Free user taps a card with 🔒 badge | Redirected to Paywall |
| 2 | Premium user taps same card | Opens Hairstyle Detail |

### TC-BARB-03: Celebrity Breakdown Entry

| Step | Action | Expected |
|---|---|---|
| 1 | Tap "📸 Upload Celebrity Photo" | Free → Paywall; Premium → Celebrity Breakdown screen |

---

## Module 8 — Hairstyle Detail

**Files:** `app/hairstyle-detail.tsx`

### TC-DETAIL-01: Content Display

| # | Check | Expected |
|---|---|---|
| 1 | Style name | Displayed prominently |
| 2 | Tags | Category, trending badge, face shape compatibility |
| 3 | Barber script | Full script in styled card with copy button |
| 4 | Guard numbers | Table with area → guard size mapping |
| 5 | Maintenance | Frequency shown |

### TC-DETAIL-02: Share Barber Card

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Generate Barber Card** | Card generates (ViewShot) |
| 2 | Tap **Share** | System share sheet opens with card image |

### TC-DETAIL-03: Save Hairstyle

| Step | Action | Expected |
|---|---|---|
| 1 | Tap heart ♡ icon | Heart fills (saved); written to saved_hairstyles |
| 2 | Tap again | Heart empties (unsaved) |

---

## Module 9 — Celebrity Breakdown

**Files:** `app/celebrity-breakdown.tsx`, `hooks/useBarber.ts`, `supabase/functions/analyze-hairstyle/index.ts`

### TC-CELEB-01: Premium Gate

| Step | Action | Expected |
|---|---|---|
| 1 | Free user navigates to `/celebrity-breakdown` | In-screen premium gate: "Premium Feature" with Upgrade CTA |
| 2 | Tap **Upgrade to Premium** | Navigates to Paywall |

### TC-CELEB-02: Photo from Library (Premium)

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Choose from Library** | Photo picker opens |
| 2 | Select a clear front-angle celebrity photo | Loading: "Analyzing hairstyle..." |
| 3 | Analysis completes | Shows: style name, description, barber script, guard numbers |
| 4 | Tap **Generate Barber Card** | Card modal opens |

### TC-CELEB-03: Take Photo (Premium)

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Take a Photo** | Camera opens |
| 2 | Capture photo of a hairstyle on screen/magazine | Same analysis flow as TC-CELEB-02 |

### TC-CELEB-04: AI Error Handling

| Step | Action | Expected |
|---|---|---|
| 1 | Submit a blurry/dark photo | Branded error card with retry options + tips |
| 2 | When AI is unavailable | "AI is temporarily unavailable" — no crash |

---

## Module 10 — AI Skin Analysis

**Files:** `app/skin-analysis.tsx`, `services/skin.service.ts`, `supabase/functions/analyze-skin/index.ts`

### TC-SKIN-01: Camera & Capture

| Step | Action | Expected |
|---|---|---|
| 1 | Navigate to Skin Analysis from Home → Tools | Camera screen with gold oval face guide |
| 2 | Grant camera permission | Front camera activates |
| 3 | Tap capture button | Preview shown: Analyze or Retake buttons |

### TC-SKIN-02: Analysis (Happy Path)

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Analyze** | Loading: "Analyzing your skin..." (~10–15s) |
| 2 | Results load | Skin type, score (/100), concern cards, recommendations |
| 3 | ⚠️ Medical disclaimer | Visible at bottom of results |
| 4 | Photo upload | Verify in Supabase Storage → `skin-analysis` bucket |
| 5 | DB record | `skin_analysis_logs` row created |

### TC-SKIN-03: Low Quality Photo

| Step | Action | Expected |
|---|---|---|
| 1 | Submit a very dark/blurry photo | "Please retake" prompt (not an error crash) |

### TC-SKIN-04: Rate Limit

| Step | Action | Expected |
|---|---|---|
| 1 | Free user: scan twice in one day | Second attempt: "Daily limit reached — 1 scan per day on free tier" |
| 2 | Premium user | Allowed up to 5/day |

### TC-SKIN-05: AI Unavailable

| Step | Action | Expected |
|---|---|---|
| 1 | OpenAI key missing/expired | "AI Temporarily Unavailable" branded message |

---

## Module 11 — Product Scanner

**Files:** `app/product-scanner.tsx`, `services/product.service.ts`, `supabase/functions/analyze-product/index.ts`

### TC-SCAN-01: Premium Gate

| Step | Action | Expected |
|---|---|---|
| 1 | Free user opens Product Scanner | In-screen premium gate: lock icon + "Premium Feature" + Upgrade CTA |
| 2 | Tap **Upgrade to Premium** | Navigates to Paywall |

### TC-SCAN-02: Camera Permission

| Step | Action | Expected |
|---|---|---|
| 1 | Premium user, first time | Permission prompt: "Camera Access Needed" + **Allow Camera** button |
| 2 | Grant permission | Camera view with scan overlay activates |

### TC-SCAN-03: Barcode Scan (Happy Path)

| Step | Action | Expected |
|---|---|---|
| 1 | Point at a grooming product barcode | Haptic on detection → "Looking up product..." |
| 2 | Analysis completes | Results: product name, safety score (/10), verdict badge |
| 3 | Flagged ingredients | Each shows name, severity (mild/moderate/high), reason |
| 4 | Tap **Scan Another Product** | Returns to camera |
| 5 | DB record | `product_scans` row created |

### TC-SCAN-04: Product Not Found

| Step | Action | Expected |
|---|---|---|
| 1 | Scan a non-grooming barcode (random item) | "Product not found" state with retry option |

### TC-SCAN-05: AI Unavailable

| Step | Action | Expected |
|---|---|---|
| 1 | OpenAI unavailable | Alert: "AI Temporarily Unavailable" — no crash |

---

## Module 12 — Hair Loss Tracker

**Files:** `app/hair-loss-tracker.tsx`, `services/hairloss.service.ts`

### TC-HAIR-01: Premium Gate

| Step | Action | Expected |
|---|---|---|
| 1 | Free user opens Hair Loss Tracker | In-screen premium gate: "Premium Feature" + Upgrade CTA |

### TC-HAIR-02: First Photo Session (Premium)

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Log This Month's Photos** | Camera opens: "1/5 — Top of Head" with gold circle guide |
| 2 | Capture top photo | Auto-advances to "2/5 — Front Hairline" |
| 3 | Capture all 5 angles | Review screen: 5 thumbnails in grid |
| 4 | Tap **Save This Month's Log** | Upload + save → +75 XP toast |
| 5 | Verify Storage | 5 images in `hair-loss-photos` bucket |
| 6 | Verify DB | `hair_loss_logs` row with 5 angle entries |

### TC-HAIR-03: Monthly Cadence

| Step | Action | Expected |
|---|---|---|
| 1 | Complete a session | Return to Hair Loss Tracker home |
| 2 | Check status | "✅ This month is logged" — cannot re-log this month |
| 3 | Shows next session date | "Next session: [1st of next month]" |

### TC-HAIR-04: Timeline View

| Step | Action | Expected |
|---|---|---|
| 1 | After ≥1 session, tap **View Full Timeline** | Angle chips at top (Top, Front, Back, Left, Right) |
| 2 | Tap angle | Shows that angle's photo for each month |
| 3 | Tap month thumbnail | Sets L/R comparison photo |

### TC-HAIR-05: Trend Text

| Step | Action | Expected |
|---|---|---|
| 1 | After ≥3 sessions | Trend text appears (e.g. "Stable", "Slight thinning", "Improving") |

---

## Module 13 — Tracker Tab

**Files:** `app/(tabs)/tracker.tsx`, `services/habit.service.ts`, `constants/badges.ts`

### TC-TRACK-01: Streak Display

| # | Check | Expected |
|---|---|---|
| 1 | Current streak | Correct day count, flame emoji |
| 2 | Streak after completing both routines | Increments by 1 |
| 3 | Streak freeze tooltip | Tap (i) icon → popup explains freeze |

### TC-TRACK-02: Habit Grid

| Step | Action | Expected |
|---|---|---|
| 1 | Open Tracker tab | Grid shows today's habit cells |
| 2 | Complete a routine step | Corresponding cell fills green |

### TC-TRACK-03: Badge Shelf

| Step | Action | Expected |
|---|---|---|
| 1 | Scroll to Badges | Earned badges: gold + name; Locked: dimmed + progress text |
| 2 | Tap earned badge | Detail overlay with description + rarity |
| 3 | Tap locked badge | Shows progress toward earning it |

### TC-TRACK-04: Badge Unlock Animation

| Step | Action | Expected |
|---|---|---|
| 1 | Earn a new badge (e.g. "Day One") | Full-screen `badge-unlock` animation |
| 2 | — | Shows badge name, description, XP reward, rarity |
| 3 | Tap to dismiss | Returns to previous screen |

### TC-TRACK-05: XP & Level System

| # | Check | Expected |
|---|---|---|
| 1 | XP increments | +10 per step, +50 per routine, +30 bonus for both |
| 2 | Level up | When XP threshold crossed, level title changes |
| 3 | Verify in DB | `profiles.total_xp` matches displayed value |

---

## Module 14 — Profile Tab

**Files:** `app/(tabs)/profile.tsx`

### TC-PROF-01: Profile Display

| # | Check | Expected |
|---|---|---|
| 1 | Avatar | Initials rendered in circle |
| 2 | Name | Matches profile full_name |
| 3 | Subscription badge | "Free Plan" or "Premium" with correct styling |
| 4 | Skin Type | From onboarding profile |
| 5 | Face Shape | From onboarding profile |
| 6 | Total XP | Matches tracker/home |

### TC-PROF-02: My Kit Section

| Step | Action | Expected |
|---|---|---|
| 1 | Profile has affiliate recommendations | "My Kit" section visible with up to 3 compact product cards |
| 2 | Cards show | Brand, product name, "Soon" badge (affiliates disabled) |

### TC-PROF-03: Settings Navigation

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Subscription** | Navigates to Paywall |
| 2 | Free user sees "Upgrade" pill | Visible next to Subscription row |

---

## Module 15 — Paywall & Subscription

**Files:** `app/paywall.tsx`, `lib/revenuecat.ts`, `stores/subscription.store.ts`

### TC-PAY-01: Paywall Display

| # | Check | Expected |
|---|---|---|
| 1 | Feature list | All premium features listed |
| 2 | Plan options | Monthly, Annual, Lifetime |
| 3 | Price display | Loaded from RevenueCat offerings |
| 4 | Trial info | 7-day free trial badge shown |

### TC-PAY-02: Plan Selection

| Step | Action | Expected |
|---|---|---|
| 1 | Tap Monthly | Card highlights; CTA updates with price |
| 2 | Tap Annual | Card highlights; CTA updates |
| 3 | Tap Lifetime | Card highlights; CTA updates |

### TC-PAY-03: Purchase Flow (Sandbox)

| Step | Action | Expected |
|---|---|---|
| 1 | Tap **Start Premium** | RevenueCat purchase sheet (App Store/Play Store sandbox) |
| 2 | Complete sandbox purchase | Paywall dismisses; `isPremium` → true |
| 3 | Premium features unlocked | All gated screens accessible |
| 4 | Check Supabase | `profiles.subscription_status` updated via webhook |

### TC-PAY-04: Trial Warning Banner

| Step | Action | Expected |
|---|---|---|
| 1 | User on trial with < 3 days remaining | Warning banner visible at top of Home/Routines |

### TC-PAY-05: Feature Gates

| Feature | Free User Behavior |
|---|---|
| Celebrity Breakdown | In-screen premium gate with Upgrade CTA |
| Product Scanner | In-screen premium gate with Upgrade CTA |
| Hair Loss Tracker | In-screen premium gate with Upgrade CTA |
| Create Custom Routine | Redirected to Paywall |
| Premium hairstyle | Redirected to Paywall |
| Premium routine template | Redirected to Paywall |

---

## Module 16 — Affiliate System

**Files:** `constants/affiliateProducts.ts`, `services/affiliate.service.ts`, `hooks/useAffiliate.ts`, `components/ui/AffiliateProductCard.tsx`

### TC-AFF-01: Safety Flag

| Step | Action | Expected |
|---|---|---|
| 1 | `AFFILIATES_ENABLED = false` (default) | All product cards show "Coming Soon" / "Soon" badges |
| 2 | Tap card | No navigation (disabled) |
| 3 | No affiliate URLs opened | `Linking.openURL` never called |

### TC-AFF-02: Personalized Recommendations

| Step | Action | Expected |
|---|---|---|
| 1 | User with oily skin type | Home "Products For You" shows oily-skin-suitable products (e.g. CeraVe SA Cleanser) |
| 2 | User without beard | No beard oil/balm products in recommendations |

### TC-AFF-03: Click Tracking (When Enabled)

| Step | Action | Expected |
|---|---|---|
| 1 | Set `AFFILIATES_ENABLED = true` (dev testing only) | Cards show "Shop" CTA |
| 2 | Tap a product card | Browser opens Amazon URL + `affiliate_clicks` row in DB |

### TC-AFF-04: Inline Routine Suggestions

| Step | Action | Expected |
|---|---|---|
| 1 | Open routine editor with a step like "Apply Moisturizer" | Compact affiliate card shown below step |
| 2 | Product matches step keywords | Relevant product (not random) |

---

## Module 17 — Analytics & Error Reporting

**Files:** `lib/analytics.ts`, `app/_layout.tsx`

### TC-ANALYTICS-01: Event Definitions

| Event | Trigger Point |
|---|---|
| `sign_up` | Account creation |
| `onboarding_completed` | After step 6 |
| `trial_started` | Starting free trial |
| `paywall_viewed` | Paywall screen opened |
| `purchase_completed` | Successful purchase |
| `routine_step_completed` | Checking off a step |
| `routine_completed` | All steps in a routine done |
| `streak_milestone` | 7, 14, 30, 100 day streaks |
| `badge_earned` | New badge awarded |
| `skin_analysis_completed` | AI skin results received |
| `product_scanned` | Barcode scan results received |
| `barber_card_shared` | Sharing a barber card |
| `affiliate_link_clicked` | Product card tapped |
| `hair_loss_session_completed` | 5-angle session saved |

### TC-ANALYTICS-02: No-Op Without Keys

| Step | Action | Expected |
|---|---|---|
| 1 | Remove `EXPO_PUBLIC_POSTHOG_KEY` from .env | App starts normally; no crashes |
| 2 | Perform actions (complete step, scan, etc.) | No errors in console; events silently discarded |

### TC-ANALYTICS-03: Sentry Initialization

| Step | Action | Expected |
|---|---|---|
| 1 | Remove `EXPO_PUBLIC_SENTRY_DSN` | App starts normally |
| 2 | Force an error (e.g. ErrorBoundary test) | No Sentry call made; UI still shows recovery screen |

---

## Module 18 — Push Notifications

**Files:** `utils/notifications.ts`

### TC-NOTIF-01: Permission Request

| Step | Action | Expected |
|---|---|---|
| 1 | App first launch | Notification permission prompt shown |
| 2 | Grant or deny | App continues normally either way |

### TC-NOTIF-02: Hair Loss Monthly Reminder

| Step | Action | Expected |
|---|---|---|
| 1 | Complete a hair loss session | Monthly notification scheduled for 1st of next month, 10am |
| 2 | Notification fires | Tapping it deep-links to `/hair-loss-tracker` |

### TC-NOTIF-03: Streak Warning

| Step | Action | Expected |
|---|---|---|
| 1 | Complete routines with an active streak | Streak warning scheduled for 8pm if routines not yet done |
| 2 | Notification content | "Don't break your X-day streak!" |

---

## Module 19 — Error Handling & Edge Cases

**Files:** `components/ErrorBoundary.tsx`, `lib/edgeFunctions.ts`, `supabase/functions/_shared/aiErrors.ts`

### TC-ERR-01: ErrorBoundary

| Step | Action | Expected |
|---|---|---|
| 1 | Force a JS crash in any screen | ErrorBoundary catches it |
| 2 | — | Shows branded error screen: "Something went wrong" |
| 3 | Tap **Go Back** | Returns to previous screen |
| 4 | Tap **Restart App** | App reloads |

### TC-ERR-02: AI Error Codes

| Error | Trigger | User Sees |
|---|---|---|
| `ai_missing_key` | No `OPENAI_API_KEY` in secrets | "AI Temporarily Unavailable" |
| `ai_invalid_key` | Revoked API key | "AI Temporarily Unavailable" |
| `ai_quota_exceeded` | 429 from OpenAI | "AI Temporarily Unavailable" |
| `ai_rate_limited` | 429 (generic) | "AI Temporarily Unavailable" |
| `rate_limit_exceeded` | App rate limit (daily cap) | "Daily Limit Reached" with specific message |

### TC-ERR-03: Network Offline

| Step | Action | Expected |
|---|---|---|
| 1 | Enable airplane mode | Cached data shows (React Query cache) |
| 2 | Try Skin Analysis | "Requires internet connection" |
| 3 | Try Barber tab | Works (hairstyle data is local) |

### TC-ERR-04: Deep Link Bypass Prevention

| Step | Action | Expected |
|---|---|---|
| 1 | Free user deep-links to `/celebrity-breakdown` | In-screen premium gate (not the feature) |
| 2 | Free user deep-links to `/product-scanner` | In-screen premium gate |
| 3 | Free user deep-links to `/hair-loss-tracker` | In-screen premium gate |

---

## Module 20 — Performance & Polish

### TC-PERF-01: Animations

| # | Check | Expected |
|---|---|---|
| 1 | Screen transitions | Smooth (Reanimated 3, no jank) |
| 2 | Step completion | Animated checkbox + XP toast |
| 3 | Tab switching | No visible frame drops |
| 4 | Badge unlock | Full-screen animation plays smoothly |

### TC-PERF-02: Haptic Feedback

| # | Interaction | Expected |
|---|---|---|
| 1 | Complete a routine step | Medium haptic |
| 2 | Uncomplete a step | Light haptic |
| 3 | Badge earned | Notification haptic |
| 4 | Paywall plan change | Light haptic |
| 5 | All CTA buttons | Light haptic on press |

### TC-PERF-03: Dark Mode

| # | Check | Expected |
|---|---|---|
| 1 | Entire app | Dark-first design throughout; no white flashes |
| 2 | All text | Readable on dark backgrounds |
| 3 | Gold accent | `#C9A84C` used consistently for premium elements |

### TC-PERF-04: Memory & Startup

| # | Check | Expected |
|---|---|---|
| 1 | Cold start time | < 3s to interactive |
| 2 | Memory during camera use | No memory warnings (check Xcode/logcat) |
| 3 | Scroll performance | 60fps in all ScrollViews/FlatLists |

---

## Test Execution Log

Use this table to track testing progress:

| Module | Tester | Date | Pass | Fail | Notes |
|---|---|---|---|---|---|
| Auth | | | | | |
| Onboarding | | | | | |
| Home Tab | | | | | |
| Routines Tab | | | | | |
| Routine Editor | | | | | |
| AI Routine | | | | | |
| Barber Tab | | | | | |
| Hairstyle Detail | | | | | |
| Celebrity Breakdown | | | | | |
| Skin Analysis | | | | | |
| Product Scanner | | | | | |
| Hair Loss Tracker | | | | | |
| Tracker Tab | | | | | |
| Profile Tab | | | | | |
| Paywall | | | | | |
| Affiliate System | | | | | |
| Analytics | | | | | |
| Push Notifications | | | | | |
| Error Handling | | | | | |
| Performance | | | | | |
