# GroomAI — Version 1 Scope (Clean Product)

> Accurate as of 2026-03-01.

This document defines what **is included in v1** vs what is **explicitly not v1**.

## v1 = What ships

### Core app (ships)
- Auth + onboarding (Supabase Auth)
- Home / Routines / Barber / Tracker / Profile tabs
- Routine system (morning/night/custom) + routine editor
- Templates: 8 one-tap routine templates (some premium)
- Habits, XP, streaks, badges, badge unlock screen
- Barber library + hairstyle detail + saved hairstyles
- Celebrity Breakdown screen (premium-gated)
- Hair Loss Tracker screen (premium-gated) + monthly reminders + timeline/compare
- Affiliate recommendations UI (safe-launch mode)
- RevenueCat paywall + subscription store wiring
- Supabase Edge Functions deployed: analyze-skin, analyze-product, generate-routine, analyze-hairstyle, revenuecat-webhook

### v1 safety defaults
- Affiliate links are **disabled by default** (`AFFILIATES_ENABLED = false`) so the app can launch safely without approved affiliate accounts.

## v1 = Implemented, but currently blocked

### AI features (built + deployed, but OpenAI billing required)
The AI screens and Edge Functions exist, and `OPENAI_API_KEY` is set as a Supabase secret.

However, OpenAI is currently returning `429 quota exceeded` until billing/credits are enabled.

Included in v1 once billing is enabled:
- Skin Analysis (GPT-4o vision)
- Product Scanner ingredient analysis (GPT-4o)
- AI Routine Generator (GPT-4o)
- Celebrity Breakdown (GPT-4o vision)

## v1 = UI entry points wired
All premium screens now have visible entry points from the Home tab "Tools" section:
- Skin Analysis → Home → Tools
- Product Scanner → Home → Tools (premium-gated in-screen)
- AI Routine Generator → Home → Tools
- Hair Loss Tracker → Home → Tools (premium-gated in-screen) + deep-link from monthly notification
- Celebrity Breakdown → Barber tab (premium-gated in-screen)
- Affiliate "My Kit" → Profile tab section

## Not v1 (explicitly moved to v2)
- AR Try-On (DeepAR): moved to v2 due to licensing/effects/native build requirements.

## v1 tracking/analytics (what is actually wired)
- Analytics wrapper exists (PostHog REST + Sentry), but it is **no-op** unless `EXPO_PUBLIC_POSTHOG_KEY` and/or `EXPO_PUBLIC_SENTRY_DSN` are set.
- Currently wired events:
  - Affiliate link clicked
  - Hair loss session completed
- Other events are defined but not yet wired in screens (routine completions, paywall viewed, etc.).
