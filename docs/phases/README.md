# GroomAI — Build Phases Overview

Complete build roadmap. Follow phases in order. Do not skip ahead — each phase depends on the previous one being fully done.

---

## Phase Summary

| # | Phase | Key Deliverable | Est. Time | Complexity |
|---|---|---|---|---|
| 1 | [Foundation](phase-1-foundation.md) | App compiles on device, Supabase live, schema + RLS applied | 2–3 days | High |
| 2 | [Auth & Onboarding](phase-2-auth-onboarding.md) | New user can sign up, complete onboarding, land on home tab | 3–4 days | Medium |
| 3 | [Monetization Gate](phase-3-monetization.md) | RevenueCat live, paywall built, webhook verified | 2–3 days | Medium |
| 4 | [Core Loop](phase-4-core-loop.md) | Routine builder, habit logging, XP, streaks, badges, notifications | 5–7 days | High |
| 5 | [UI Polish](phase-5-ui-polish.md) | Every screen matches the design system, premium feel throughout | 3–4 days | Medium |
| 6 | [Barber Translator](phase-6-barber-translator.md) | Hairstyle library, barber scripts, barber card + share | 3–4 days | Medium |
| 7 | [AI Features](phase-7-ai-features.md) | Skin analysis, product scanner, AI routine generator | 4–5 days | High |
| 8 | [AR Try-On](phase-8-ar-tryon.md) | DeepAR hairstyle/beard overlay, screenshot, share | 3–5 days | Very High |
| 9 | [Tracking & Affiliate](phase-9-tracking-affiliate.md) | Hair loss tracker, affiliate links, PostHog events, Sentry | 3–4 days | Medium |
| 10 | [Launch Prep](phase-10-launch-prep.md) | Legal pages, EAS builds, App Store submission, final QA | 3–5 days | Medium |

**Total estimated time: 31–44 days** (solo developer, full-time)

---

## Critical Path Notes

### Do Phase 3 (Monetization) before ANY premium features
The paywall gate must exist before you build what goes behind it. Building AR try-on before the gate means you'll have to retrofit it — always more work.

### Phase 8 (AR) has a hard blocker
You cannot start Phase 8 without real `.deepar` effect files. Budget time and money to source these during Phases 4–6. See `17-environment-setup.md` Section 4 for options ($20–$150/effect, minimum 5 effects for V1).

### Phase 5 (UI Polish) is not optional
The app will be reviewed by Apple and Google reviewers. Apps that look unpolished are rejected or featured poorly. Do not skip this phase or defer it to "later."

### Generated TypeScript types must stay in sync
Every time you change the database schema, re-run `npm run gen:types`. If type errors appear in service files, this is usually the cause.

---

## Reference Documents

All 17 blueprint files live in the parent `docs/` directory:

| File | Contents |
|---|---|
| `01-project-overview.md` | Tech stack, folder structure, package.json, env vars |
| `02-database-schema.md` | Full PostgreSQL schema, triggers, RLS policies |
| `03-navigation.md` | Screen map, auth guard, deep linking, transitions |
| `04-onboarding.md` | 6-step onboarding wizard, face shape detection |
| `05-routine-builder.md` | Routine screens, step completion, AI generator |
| `06-barber-translator.md` | Hairstyle library, barber card, celebrity AI breakdown |
| `07-habit-tracker.md` | XP system, level titles, 20 badges, streak logic |
| `08-ar-tryon.md` | DeepAR SDK, Platform.select keys, effect switching |
| `09-skin-analysis.md` | Selfie capture, GPT-4o Vision, skin report |
| `10-product-scanner.md` | CameraView barcode scan, Open Beauty Facts, ingredient analysis |
| `11-hair-loss-tracker.md` | 5-angle photo sessions, monthly comparison |
| `12-monetization.md` | RevenueCat, paywall, trial warning, webhook |
| `13-supabase-setup.md` | Supabase project setup, migrations, Edge Functions |
| `14-ui-design-system.md` | Colors, typography, components, animations |
| `15-api-services.md` | Service layer, React Query hooks, error handling |
| `16-affiliate-system.md` | Product catalog, recommendation engine, click tracking |
| `17-environment-setup.md` | Pre-build checklist, DeepAR costs, legal, build order |
