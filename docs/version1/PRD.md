# GroomAI — Product Requirements Document (PRD)

> **Version:** 1.0
> **Date:** 2026-03-01
> **Status:** v1 — In Development
> **Product Owner:** GroomAI Team
> **Platform:** iOS & Android (React Native / Expo)

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Audience & User Personas](#3-target-audience--user-personas)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [Feature Overview](#5-feature-overview)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Information Architecture](#8-information-architecture)
9. [Data Model](#9-data-model)
10. [Technology Stack](#10-technology-stack)
11. [Monetization Strategy](#11-monetization-strategy)
12. [Security & Privacy](#12-security--privacy)
13. [Analytics & Instrumentation](#13-analytics--instrumentation)
14. [Release Plan](#14-release-plan)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Assumptions & Constraints](#16-assumptions--constraints)
17. [Glossary](#17-glossary)

---

## 1. Product Vision

**GroomAI** is a premium, AI-powered men's grooming companion that feels like having a personal stylist, dermatologist, and barber in your pocket. Every interaction is personalized, premium, and slightly addictive.

**Tagline:** *Your daily edge.*

**Core Philosophy:**

1. **Remove guesswork** — Men don't know what products or routines work for them. Every recommendation is personalized to their face shape, skin type, and hair type.
2. **Make it feel effortless** — Clean UI, minimal taps, maximum value.
3. **Make progress visible** — Streaks, badges, before/after photos, skin logs. Users must *see* they're improving.
4. **Premium feel from frame 1** — Every screen looks like it belongs in the App Store's "Apps We Love."

---

## 2. Problem Statement

Men's grooming is a $78B+ global market, yet most men:

- Don't know their skin type, face shape, or which products suit them.
- Struggle to communicate what they want to their barber.
- Have no structured grooming routine and forget basic daily steps.
- Can't track whether their hair is thinning or skin is actually improving.
- Get overwhelmed by thousands of product options with no personalized guidance.

**GroomAI solves this** by combining AI-powered analysis, personalized routines, a gamified habit tracker, and a barber translator into one cohesive daily-use app.

---

## 3. Target Audience & User Personas

### Primary Demographics

| Attribute | Value |
|---|---|
| Gender | Male (18–45) |
| Markets | US, UK, Canada, Australia, UAE |
| Tech comfort | Smartphone-native; uses 5–10 apps daily |
| Grooming knowledge | Beginner to intermediate |
| Spending | Willing to pay for quality tools ($5–$15/mo) |

### Persona 1 — "New to Grooming" Alex (22)

- College senior, wants to look sharper for interviews
- Doesn't know his skin type; buys whatever is on sale
- **Needs:** A step-by-step routine, product recommendations, basic education
- **Motivation:** Look more put-together with minimal effort

### Persona 2 — "Style Upgrader" Marcus (29)

- Working professional, visits barber every 3 weeks
- Knows basics but wants better haircut communication & skin care
- **Needs:** Barber translator, hairstyle discovery, product scanner
- **Motivation:** Level up from "okay" to "great" grooming

### Persona 3 — "Proactive Tracker" David (35)

- Noticing early hair thinning; skin starting to show age
- Wants to track changes month over month
- **Needs:** Hair loss tracker, AI skin analysis, anti-aging routines
- **Motivation:** Catch and address issues early

---

## 4. Goals & Success Metrics

### Business Goals

| Goal | Target |
|---|---|
| Monthly Active Users (MAU) | 50K within 6 months of launch |
| Trial-to-Paid Conversion | ≥ 12% (industry average 8–10%) |
| Monthly Churn | < 8% |
| App Store Rating | ≥ 4.5 stars |
| Revenue Run Rate (Month 12) | $30K MRR |

### Product Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| D7 Retention | ≥ 40% | PostHog cohort |
| D30 Retention | ≥ 20% | PostHog cohort |
| Avg. daily routines completed | ≥ 1.2 routines / active user / day | Analytics |
| Streak median | ≥ 7 days for retained users | DB query |
| Paywall view → purchase | ≥ 15% | RevenueCat + PostHog funnel |
| AI feature usage / week | ≥ 2 AI interactions / premium user | Analytics |

---

## 5. Feature Overview

### v1 Features (Current Release)

| # | Feature | Tier | Description |
|---|---|---|---|
| F1 | Authentication | Free | Email sign-up/sign-in via Supabase Auth |
| F2 | Onboarding (6 steps) | Free | Captures face shape, skin type, hair type, goals → personalizes everything |
| F3 | Home Dashboard | Free | Greeting, stats, daily tip, tools, routines, affiliate products |
| F4 | Grooming Routines | Free (basic) / Premium (custom + AI) | Morning & Night routines, step-by-step with timers |
| F5 | AI Routine Generator | Premium | GPT-4o generates personalized routines from profile |
| F6 | Barber Translator | Free (5 styles) / Premium (50+) | Hairstyle library with guard numbers, barber scripts, shareable cards |
| F7 | Celebrity Breakdown | Premium | Upload a celebrity photo → AI extracts hairstyle + generates barber instructions |
| F8 | Habit Tracker & Gamification | Free | Streaks, XP, level system, badge shelf, daily check-ins |
| F9 | AI Skin Analysis | Free (1/day) / Premium (5/day) | Selfie → GPT-4o Vision → skin type, score, concerns, recommendations |
| F10 | Product Scanner | Premium | Barcode scan → ingredient analysis → safety score + flagged chemicals |
| F11 | Hair Loss Tracker | Premium | Monthly 5-angle photo sessions, before/after comparison, trend detection |
| F12 | Paywall & Subscription | — | RevenueCat-powered: Monthly, Annual, Lifetime plans |
| F13 | Profile & Settings | Free | Profile data, subscription status, sign out, "My Kit" affiliate section |
| F14 | Affiliate System | Free (display) | Personalized product recommendations (disabled by default; no live affiliate links until partnerships active) |
| F15 | Push Notifications | Free | Streak reminders, hair loss monthly prompts |

### v2 Features (Planned)

| # | Feature | Description |
|---|---|---|
| V2-1 | AR Try-On (DeepAR) | Real-time hairstyle & beard overlay on live camera feed |
| V2-2 | Offline Queue | Queue AI requests when offline; execute on reconnect |
| V2-3 | Social Sharing | Share barber cards, routines, badges to Instagram/TikTok |
| V2-4 | Community Feed | User-submitted hairstyle photos, upvotes, barber reviews |
| V2-5 | Product Price Comparison | Compare product prices across retailers via API |
| V2-6 | AI Chat Assistant | Conversational grooming advisor (GPT-4o) |

---

## 6. Functional Requirements

### FR-01: Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-01.1 | User can create an account with email and password | P0 |
| FR-01.2 | User can sign in with existing credentials | P0 |
| FR-01.3 | Session persists across app restarts (Supabase JWT) | P0 |
| FR-01.4 | User can sign out; session is fully cleared | P0 |
| FR-01.5 | Duplicate email returns clear error message | P0 |
| FR-01.6 | Password minimum: 6 characters | P0 |

### FR-02: Onboarding

| ID | Requirement | Priority |
|---|---|---|
| FR-02.1 | 6-step progressive onboarding collects: name, age, nationality, face shape, skin type, skin concerns, hair type, hair texture, hair length, grooming goals | P0 |
| FR-02.2 | Selections persist when navigating back/forward | P0 |
| FR-02.3 | On completion, `profiles` row is created/updated in Supabase | P0 |
| FR-02.4 | Step 6 presents free trial CTA; user can accept or skip | P0 |
| FR-02.5 | Completing onboarding sets `onboarding_completed = true` | P0 |

### FR-03: Home Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-03.1 | Time-of-day greeting with user's first name | P0 |
| FR-03.2 | Display current streak, level, total XP with progress bar | P0 |
| FR-03.3 | Show today's Morning & Night routine progress cards | P0 |
| FR-03.4 | Show one daily grooming tip (rotates daily) | P1 |
| FR-03.5 | "Products For You" section shows 3 affiliate recommendations matched to skin type | P1 |
| FR-03.6 | "Tools" section with 4 entry points: Skin AI, Product Scanner, AI Routine, Hair Loss Tracker | P0 |
| FR-03.7 | Quick Actions row: Routines, Badges, Barber | P0 |

### FR-04: Routines

| ID | Requirement | Priority |
|---|---|---|
| FR-04.1 | Auto-seed Morning & Night routines on first login (default steps from profile) | P0 |
| FR-04.2 | Display routine cards with name, step count, progress bar | P0 |
| FR-04.3 | Tap card to open Routine Editor | P0 |
| FR-04.4 | 8 routine templates available (premium-gated subset) | P1 |
| FR-04.5 | Premium users can create custom routines | P1 |

### FR-05: Routine Editor

| ID | Requirement | Priority |
|---|---|---|
| FR-05.1 | Display routine steps in order with category icons | P0 |
| FR-05.2 | Tap step to toggle completion; animated checkbox + haptic | P0 |
| FR-05.3 | +10 XP awarded per step completion | P0 |
| FR-05.4 | Completing all steps triggers celebration overlay + +50 XP bonus | P0 |
| FR-05.5 | Steps with `duration_seconds` show countdown timer (premium) | P1 |
| FR-05.6 | Inline affiliate product suggestion per step (based on step keyword match) | P2 |

### FR-06: AI Routine Generator

| ID | Requirement | Priority |
|---|---|---|
| FR-06.1 | Premium users can generate routines via `generate-routine` Edge Function | P0 |
| FR-06.2 | Input: user profile (skin type, hair type, concerns, goals) | P0 |
| FR-06.3 | Output: structured Morning + Night routine with steps | P0 |
| FR-06.4 | User can review, deselect steps, then save | P0 |
| FR-06.5 | Saved routine marked `is_ai_generated: true` in DB | P0 |
| FR-06.6 | Rate limit: 3/day free, 10/day premium | P1 |

### FR-07: Barber Translator

| ID | Requirement | Priority |
|---|---|---|
| FR-07.1 | Grid of 50+ hairstyle cards with name, image, face shape tags | P0 |
| FR-07.2 | Filter by length (Short, Medium, Long), face shape | P0 |
| FR-07.3 | "For Your Face" personalized section based on profile face_shape | P0 |
| FR-07.4 | Free users: 5 unlocked styles; others locked behind paywall | P0 |
| FR-07.5 | Tap card → Hairstyle Detail screen (script, guard numbers, maintenance) | P0 |

### FR-08: Hairstyle Detail

| ID | Requirement | Priority |
|---|---|---|
| FR-08.1 | Display: style name, tags, full barber script, guard number table, maintenance info | P0 |
| FR-08.2 | "Generate Barber Card" creates shareable image (ViewShot) | P0 |
| FR-08.3 | Share button opens system share sheet | P0 |
| FR-08.4 | Save/unsave hairstyle (heart toggle → `saved_hairstyles` table) | P1 |

### FR-09: Celebrity Breakdown

| ID | Requirement | Priority |
|---|---|---|
| FR-09.1 | Premium-only; in-screen gate for free users | P0 |
| FR-09.2 | Upload from library or take photo | P0 |
| FR-09.3 | Calls `analyze-hairstyle` Edge Function → GPT-4o Vision | P0 |
| FR-09.4 | Returns: style name, description, barber script, guard numbers | P0 |
| FR-09.5 | Generate Barber Card from AI analysis | P1 |

### FR-10: AI Skin Analysis

| ID | Requirement | Priority |
|---|---|---|
| FR-10.1 | Front camera with oval face guide overlay | P0 |
| FR-10.2 | Capture → sends to `analyze-skin` Edge Function → GPT-4o Vision | P0 |
| FR-10.3 | Returns: skin type, score /100, concerns, recommendations | P0 |
| FR-10.4 | Photo uploaded to `skin-analysis` Supabase Storage bucket | P0 |
| FR-10.5 | Rate limit: 1/day free, 5/day premium | P1 |
| FR-10.6 | Medical disclaimer visible on results screen | P0 |

### FR-11: Product Scanner

| ID | Requirement | Priority |
|---|---|---|
| FR-11.1 | Premium-only; in-screen gate for free users | P0 |
| FR-11.2 | Camera with barcode scanning overlay | P0 |
| FR-11.3 | On detection → calls `analyze-product` Edge Function | P0 |
| FR-11.4 | Returns: product name, safety score /10, verdict badge, flagged ingredients | P0 |
| FR-11.5 | Results saved to `product_scans` table | P0 |

### FR-12: Hair Loss Tracker

| ID | Requirement | Priority |
|---|---|---|
| FR-12.1 | Premium-only; in-screen gate for free users | P0 |
| FR-12.2 | Monthly photo session: 5 guided angles (top, front, back, left, right) | P0 |
| FR-12.3 | Photos uploaded to `hair-loss-photos` private bucket | P0 |
| FR-12.4 | Session logged in `hair_loss_logs` table | P0 |
| FR-12.5 | Monthly cadence enforced (can't re-log same month) | P0 |
| FR-12.6 | Timeline view with angle filtering and month-by-month comparison | P1 |
| FR-12.7 | Trend text after ≥3 sessions ("Stable", "Improving", etc.) | P2 |

### FR-13: Gamification

| ID | Requirement | Priority |
|---|---|---|
| FR-13.1 | XP system: +10/step, +50/routine, +30 bonus both, +75 hair loss session | P0 |
| FR-13.2 | Level system: XP thresholds define level titles | P0 |
| FR-13.3 | Streak system: consecutive days of completing at least one routine | P0 |
| FR-13.4 | 30+ badges with unlock criteria, XP rewards, rarity tiers | P0 |
| FR-13.5 | Full-screen badge unlock animation on earn | P0 |
| FR-13.6 | Habit grid showing daily completion status | P1 |

### FR-14: Paywall & Subscription

| ID | Requirement | Priority |
|---|---|---|
| FR-14.1 | Three plans: Monthly ($7.99), Annual ($49.99), Lifetime ($129.99) | P0 |
| FR-14.2 | Prices displayed from RevenueCat Offerings (localized) | P0 |
| FR-14.3 | 7-day reverse trial: full premium on signup, paywall on expiry | P0 |
| FR-14.4 | `isPremium` state from Zustand store, synced via RevenueCat | P0 |
| FR-14.5 | RevenueCat webhook updates `profiles.subscription_status` | P0 |
| FR-14.6 | Restore Purchases button | P0 |

### FR-15: Profile

| ID | Requirement | Priority |
|---|---|---|
| FR-15.1 | Display name, avatar initials, subscription badge, skin type, face shape, XP | P0 |
| FR-15.2 | "My Kit" section with up to 3 affiliate product cards | P1 |
| FR-15.3 | Subscription row navigates to Paywall; shows "Upgrade" pill for free users | P0 |
| FR-15.4 | Sign Out with confirmation alert | P0 |

### FR-16: Affiliate System

| ID | Requirement | Priority |
|---|---|---|
| FR-16.1 | `AFFILIATES_ENABLED` safety flag (default `false`) | P0 |
| FR-16.2 | When disabled: product cards show "Coming Soon" badges and are non-tappable | P0 |
| FR-16.3 | Recommendations personalized by user's skin type, hair type, has_beard | P1 |
| FR-16.4 | When enabled: tapping a card opens affiliate URL + logs to `affiliate_clicks` | P1 |

### FR-17: Push Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-17.1 | Request notification permission on first launch | P0 |
| FR-17.2 | Streak warning at 8pm if routines not done | P1 |
| FR-17.3 | Monthly hair loss tracker reminder on 1st of each month | P1 |

---

## 7. Non-Functional Requirements

### NFR-01: Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-01.1 | Cold start to interactive | < 3 seconds |
| NFR-01.2 | Screen transition latency | < 300ms |
| NFR-01.3 | Scroll performance | 60fps in all lists/grids |
| NFR-01.4 | AI Edge Function response time | < 15 seconds (95th percentile) |
| NFR-01.5 | Image upload (skin analysis, hair loss) | < 5 seconds on 4G |
| NFR-01.6 | App binary size | < 80 MB (iOS), < 60 MB (Android) |

### NFR-02: Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-02.1 | App crash rate | < 0.5% of sessions |
| NFR-02.2 | Edge Function availability | ≥ 99.5% uptime (Supabase SLA) |
| NFR-02.3 | Graceful degradation | AI errors show branded messages, never raw errors or crashes |
| NFR-02.4 | ErrorBoundary | All screens wrapped; recovery options (Go Back / Restart) |
| NFR-02.5 | Session recovery | Auth session persists across app kills/restarts |

### NFR-03: Security

| ID | Requirement | Target |
|---|---|---|
| NFR-03.1 | Authentication | Supabase Auth with JWT; RLS on all tables |
| NFR-03.2 | API keys (OpenAI, Service Role) | Server-side only (Supabase Secrets), never in client bundle |
| NFR-03.3 | Row Level Security | Users can only read/write their own data |
| NFR-03.4 | Storage buckets | `hair-loss-photos`: private (auth required); `skin-analysis`: public reads |
| NFR-03.5 | Webhook validation | RevenueCat webhook validates `Authorization` header |
| NFR-03.6 | Data encryption | At rest (Supabase AES-256); in transit (HTTPS/TLS 1.3) |

### NFR-04: Usability

| ID | Requirement | Target |
|---|---|---|
| NFR-04.1 | Design language | Dark-mode first; gold accent (#C9A84C) |
| NFR-04.2 | Animations | Reanimated 3 for all transitions; Lottie for celebrations |
| NFR-04.3 | Haptic feedback | On every key interaction (step completion, purchase, badge) |
| NFR-04.4 | Loading states | Skeleton screens everywhere (no spinners) |
| NFR-04.5 | Empty states | Illustrated with Lottie + actionable CTA |
| NFR-04.6 | Accessibility | Minimum text size 14px; contrast ratio ≥ 4.5:1 |

### NFR-05: Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-05.1 | Supabase DB | PostgreSQL with indexes on user_id columns |
| NFR-05.2 | Edge Functions | Stateless; horizontally scalable |
| NFR-05.3 | Storage | Supabase Storage (S3-backed); auto-scales |
| NFR-05.4 | Concurrent users | 10K concurrent without degradation |

### NFR-06: Compatibility

| ID | Requirement | Target |
|---|---|---|
| NFR-06.1 | iOS | 15.0+ |
| NFR-06.2 | Android | 8.0+ (API 26+) |
| NFR-06.3 | Devices | iPhone 8+ through 16 Pro Max; Pixel 4+ through 9; Samsung S10+ through S25 |
| NFR-06.4 | Bundle identifier | `com.groomai.app` (both platforms) |

### NFR-07: Maintainability

| ID | Requirement | Target |
|---|---|---|
| NFR-07.1 | Language | TypeScript strict mode throughout |
| NFR-07.2 | Architecture | Feature-based folder structure; services/hooks/stores separation |
| NFR-07.3 | State management | Zustand for client state; TanStack React Query for server state |
| NFR-07.4 | Code quality | `tsc --noEmit` passes with zero errors before every merge |
| NFR-07.5 | OTA updates | Expo Updates for JS bundle hotfixes |

---

## 8. Information Architecture

### Navigation Structure

```
Root Layout (_layout.tsx)
├── (auth)/                     [Stack — unauthenticated]
│   ├── welcome
│   ├── sign-in
│   └── sign-up
├── (onboarding)/               [Stack — post-signup, pre-home]
│   ├── step-1-basics
│   ├── step-2-face
│   ├── step-3-skin
│   ├── step-4-hair
│   ├── step-5-goals
│   └── step-6-trial
├── (tabs)/                     [Bottom Tab Navigator]
│   ├── home                    [Home Dashboard]
│   ├── routines                [My Routines]
│   ├── barber                  [Barber Translator]
│   ├── tracker                 [Habits & Badges]
│   └── profile                 [Profile & Settings]
└── Modal Screens               [Stack overlays]
    ├── paywall
    ├── skin-analysis
    ├── product-scanner
    ├── hair-loss-tracker
    ├── ai-routine
    ├── routine-editor
    ├── hairstyle-detail
    ├── celebrity-breakdown
    └── badge-unlock
```

### Tab Bar

| Tab | Icon | Label |
|---|---|---|
| Home | 🏠 | Home |
| Routines | 📋 | Routines |
| Barber | ✂️ | Barber |
| Tracker | 📊 | Tracker |
| Profile | 👤 | Profile |

---

## 9. Data Model

### Entity Relationship Summary

```
profiles (1) ──→ (N) routines ──→ (N) routine_steps
profiles (1) ──→ (N) habit_logs
profiles (1) ──→ (1) streaks
profiles (1) ──→ (N) user_badges ←── badges (master)
profiles (1) ──→ (N) skin_analysis_logs
profiles (1) ──→ (N) product_scans
profiles (1) ──→ (N) hair_loss_logs
profiles (1) ──→ (N) saved_hairstyles
profiles (1) ──→ (N) affiliate_clicks
profiles (1) ──→ (N) ai_usage_logs
webhook_events (standalone, server-written)
```

### Key Tables

| Table | Owner | RLS | Purpose |
|---|---|---|---|
| `profiles` | User | Per-user read/write | User profile, onboarding data, subscription, XP |
| `routines` | User | Per-user | Grooming routines |
| `routine_steps` | User | Via routine_id | Steps within a routine |
| `habit_logs` | User | Per-user | Daily step completion records |
| `streaks` | User | Per-user | Streak tracking |
| `badges` | System | Public read | Master badge definitions |
| `user_badges` | User | Per-user | Earned badge records |
| `skin_analysis_logs` | User | Per-user | AI skin analysis results |
| `product_scans` | User | Per-user | Barcode scan results |
| `hair_loss_logs` | User | Per-user | Monthly photo sessions |
| `saved_hairstyles` | User | Per-user | Bookmarked styles |
| `affiliate_clicks` | User | Per-user | Product card tap logs |
| `ai_usage_logs` | Server | Server-only write | Rate limiting + audit |
| `webhook_events` | Server | Server-only write | RevenueCat event log |

---

## 10. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.76+ | Cross-platform mobile framework |
| Expo SDK | 53 | Managed workflow + dev builds |
| Expo Router | v4 | File-based navigation |
| TypeScript | 5.3+ | Type safety |
| Zustand | 5.0+ | Client state management |
| TanStack React Query | 5.62+ | Server state + caching |
| Reanimated 3 | 3.16+ | Animations |
| Lottie React Native | 7.1+ | Lottie animations |
| RevenueCat SDK | 8.2+ | In-app purchases |
| Expo Camera | 16.0+ | Camera + barcode scanning |
| Expo Notifications | 0.29+ | Push notifications |
| Expo Haptics | 14.0+ | Haptic feedback |

### Backend

| Technology | Purpose |
|---|---|
| Supabase (PostgreSQL) | Database, Auth, Storage, Edge Functions |
| Supabase Auth | Email authentication (Google/Apple planned) |
| Supabase Storage | Image storage (skin photos, hair loss photos) |
| Supabase Edge Functions (Deno) | Server-side AI calls, webhook processing |
| OpenAI GPT-4o | AI analysis (skin, products, hairstyles, routines) |

### Deployed Edge Functions

| Function | Endpoint | Purpose |
|---|---|---|
| `analyze-skin` | `/functions/v1/analyze-skin` | AI skin analysis from selfie |
| `analyze-product` | `/functions/v1/analyze-product` | AI ingredient analysis from barcode |
| `generate-routine` | `/functions/v1/generate-routine` | AI routine generation from profile |
| `analyze-hairstyle` | `/functions/v1/analyze-hairstyle` | AI celebrity hairstyle breakdown |
| `revenuecat-webhook` | `/functions/v1/revenuecat-webhook` | Subscription status sync |

### DevOps & Monitoring

| Technology | Purpose |
|---|---|
| EAS Build | Cloud builds (iOS + Android) |
| EAS Submit | App Store / Play Store submission |
| Expo Updates | OTA JavaScript bundle updates |
| PostHog (REST) | Product analytics (no-op without key) |
| Sentry | Error monitoring (no-op without DSN) |

---

## 11. Monetization Strategy

### Model: Reverse Trial Freemium

Users receive **7 days of full premium access** automatically after onboarding. When the trial expires, they hit the paywall. This is the most effective conversion model — users have already experienced and valued the premium features.

### Pricing

| Plan | Price | App Store Product ID | Badge |
|---|---|---|---|
| Monthly | $7.99/month | `groomai.monthly` | — |
| Annual | $49.99/year (~$4.17/mo) | `groomai.annual` | "Best Value" |
| Lifetime | $129.99 one-time | `groomai.lifetime` | — |

### Free vs Premium Feature Matrix

| Feature | Free | Premium |
|---|---|---|
| Onboarding & profile | ✅ | ✅ |
| Home dashboard & daily tips | ✅ | ✅ |
| Morning & Night routines (default) | ✅ | ✅ |
| Habit tracker, streaks, XP | ✅ | ✅ |
| Barber translator (5 styles) | ✅ | ✅ (50+ styles) |
| AI Skin Analysis | 1/day | 5/day |
| AI Routine Generator | — | ✅ (10/day) |
| Celebrity Breakdown | — | ✅ |
| Product Scanner | — | ✅ |
| Hair Loss Tracker | — | ✅ |
| Custom routines | — | ✅ |
| Routine templates (premium) | — | ✅ |
| Step timers | — | ✅ |

### Revenue Streams (v1)

1. **Subscriptions** (primary) — RevenueCat handles App Store + Play Store billing
2. **Affiliate commissions** (secondary, future) — Amazon Associates product links (currently disabled; `AFFILIATES_ENABLED = false`)

---

## 12. Security & Privacy

### Authentication & Authorization

- **Supabase Auth** with email/password (JWT-based sessions)
- **Row Level Security (RLS)** on every application table — users can only access their own rows
- **Service Role key** used only in Edge Functions (never in client bundle)
- **OPENAI_API_KEY** stored exclusively in Supabase Secrets

### Data Protection

| Data | Storage | Access | Encryption |
|---|---|---|---|
| User profiles | Supabase PostgreSQL | Per-user RLS | AES-256 at rest, TLS in transit |
| Skin analysis photos | Supabase Storage (`skin-analysis`) | Public read (for result display) | TLS in transit |
| Hair loss photos | Supabase Storage (`hair-loss-photos`) | Private (auth required) | AES-256 at rest, TLS in transit |
| Subscription data | RevenueCat + profiles table | Per-user RLS + webhook | Encrypted |
| Analytics events | PostHog (external) | Project-scoped | Vendor encryption |

### Privacy Considerations

- Skin analysis photos: user consent implied by capture action; medical disclaimer shown
- Hair loss photos: stored in private bucket; only the user can access
- No third-party data sharing without consent
- App complies with App Store privacy nutrition labels
- GDPR: user can request data export/deletion via support

### Secrets Management

| Secret | Location | Access |
|---|---|---|
| `OPENAI_API_KEY` | Supabase Secrets | Edge Functions only |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets | Edge Functions only |
| `REVENUECAT_WEBHOOK_SECRET` | Supabase Secrets | `revenuecat-webhook` function only |
| `EXPO_PUBLIC_*` keys | `.env` / EAS Secrets | Client-safe, bundled |

---

## 13. Analytics & Instrumentation

### Event Catalog

| Event | Trigger | Properties |
|---|---|---|
| `sign_up` | Account created | method |
| `onboarding_completed` | Step 6 done | face_shape, skin_type, hair_type |
| `trial_started` | Trial begins | — |
| `paywall_viewed` | Paywall screen opened | source |
| `purchase_completed` | Successful purchase | plan, price |
| `routine_step_completed` | Step checked off | routine_type, step_title |
| `routine_completed` | All steps done | routine_type, step_count |
| `streak_milestone` | 7/14/30/100 day streak | days |
| `badge_earned` | New badge awarded | badge_slug, xp_reward |
| `skin_analysis_completed` | AI results received | skin_type, score |
| `product_scanned` | Barcode results received | product_name, safety_score |
| `ar_tryon_used` | AR session completed (v2) | style_slug |
| `barber_card_shared` | Card shared | style_slug |
| `affiliate_link_clicked` | Product card tapped | product_id, brand |
| `hair_loss_session_completed` | 5-angle session saved | session_number |

### Implementation

- **PostHog REST API** — events sent via `fetch()` from `lib/analytics.ts`
- **Sentry** — error & crash monitoring via `@sentry/react-native`
- **No-op pattern** — both analytics providers gracefully no-op when env keys are absent (no crashes, no errors)

### Key Funnels to Track

1. **Onboarding → Home** — drop-off per step
2. **Home → Paywall → Purchase** — conversion funnel
3. **Trial Start → Trial End → Convert/Churn** — trial effectiveness
4. **Daily Active → Routine Complete → Streak** — engagement loop

---

## 14. Release Plan

### v1.0 — MVP Launch

| Phase | Scope | Status |
|---|---|---|
| Phase 1 — Foundation | Auth, Onboarding, DB, Navigation | ✅ Complete |
| Phase 2 — Core Features | Routines, Habit Tracker, Barber Translator | ✅ Complete |
| Phase 3 — AI Features | Skin Analysis, Product Scanner, AI Routines | ✅ Complete |
| Phase 4 — Monetization | Paywall, RevenueCat, Premium Gates | ✅ Complete |
| Phase 5 — Polish | Analytics, Error Handling, Affiliate Display | ✅ Complete |
| Phase 6 — Testing & QA | Full module testing per testing guide | 🔄 In Progress |
| Phase 7 — App Store Submission | EAS Build → TestFlight / Internal Testing → Production | ⬜ Planned |

### v1.1 — Post-Launch Iteration

- Bug fixes from user feedback
- Google & Apple Sign-In
- Notification tuning
- Affiliate link activation (when partnerships secured)

### v2.0 — Major Update

- AR Try-On with DeepAR
- Offline AI request queue
- Social sharing & community feed
- AI chat assistant

---

## 15. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | OpenAI API cost spikes | Medium | High | Rate limiting per user tier (free: 1–3/day, premium: 5–10/day); server-side enforcement in Edge Functions |
| R2 | OpenAI API downtime | Low | High | Branded "AI Temporarily Unavailable" error handling; cached results for repeat requests |
| R3 | App Store rejection | Medium | High | Follow all guidelines; no misleading health claims; medical disclaimers on skin/hair analysis |
| R4 | Low trial-to-paid conversion | Medium | High | Optimize paywall copy; A/B test pricing; ensure trial users experience premium features |
| R5 | Hair loss photo privacy leak | Low | Critical | Private storage bucket + RLS; never expose `hair-loss-photos` publicly |
| R6 | Affiliate compliance issues | Low | Medium | `AFFILIATES_ENABLED = false` default; no live affiliate links until FTC-compliant disclosures added |
| R7 | RevenueCat webhook failure | Low | Medium | Webhook event logging + idempotency key; fallback: client-side `checkSubscriptionStatus()` |
| R8 | User data GDPR requests | Medium | Medium | Build data export/deletion API before EU launch |

---

## 16. Assumptions & Constraints

### Assumptions

1. Users have a smartphone with a front-facing camera (for skin analysis, hair loss photos)
2. Users have internet access for AI features (no offline AI in v1)
3. OpenAI GPT-4o Vision model is available and performs adequately for skin/product/hairstyle analysis
4. RevenueCat handles all App Store/Play Store subscription edge cases (family sharing, grace periods, refunds)
5. Supabase free/pro tier is sufficient for initial user base (< 50K MAU)

### Constraints

1. **No AR in v1** — DeepAR requires native build work + licensing costs; deferred to v2
2. **No social features in v1** — Community feed and social sharing deferred to v2
3. **No offline AI** — All AI features require network connectivity
4. **Affiliates disabled by default** — No live commission links until partnership agreements are in place
5. **Single language (English)** — Localization deferred to future release
6. **Expo Development Build required** — Cannot use Expo Go due to native module dependencies (RevenueCat, etc.)

---

## 17. Glossary

| Term | Definition |
|---|---|
| **Edge Function** | Server-side function running on Supabase (Deno runtime); used for AI API calls |
| **RLS** | Row Level Security — PostgreSQL policy that restricts data access per user |
| **RevenueCat** | Third-party SDK managing in-app subscriptions across iOS and Android |
| **Reverse Trial** | User gets full premium access for 7 days, then must subscribe to continue |
| **XP** | Experience Points — earned by completing routine steps and features |
| **Streak** | Consecutive days the user completes at least one routine |
| **Barber Card** | Shareable image containing hairstyle instructions for a barber |
| **GPT-4o Vision** | OpenAI's multimodal model capable of analyzing images |
| **DeepAR** | AR SDK for real-time face/hair overlay effects (v2 only) |
| **EAS** | Expo Application Services — cloud build and submission tooling |
| **OTA** | Over-The-Air update — deploy JS bundle changes without app store review |
| **PostHog** | Product analytics platform |
| **Sentry** | Error and crash monitoring platform |

---

*This document is the single source of truth for GroomAI v1 product requirements. All feature decisions, scope changes, and priority adjustments should be reflected here.*
