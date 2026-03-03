# Phase 1 — Foundation

## Goal
Set up everything that must exist before a single screen can be built. By the end of this phase, the project compiles and runs on a physical device, the database is live, all migrations are applied, and the service layer skeleton is in place. No UI beyond a blank launch screen.

## Complexity: High (but mechanical — just follow the steps)
## Estimated Time: 2–3 days

---

## Reference Docs
- `17-environment-setup.md` — full setup guide, must read first
- `13-supabase-setup.md` — Supabase project, migrations, RLS, Edge Functions
- `02-database-schema.md` — the full schema being applied
- `01-project-overview.md` — package.json, folder structure
- `15-api-services.md` — service layer skeleton

---

## Step-by-Step Tasks

### 1.1 — Developer Accounts & Tooling
- [ ] Create/confirm Apple Developer account ($99/yr) at developer.apple.com
- [ ] Create/confirm Google Play Developer account ($25 one-time)
- [ ] Create Supabase project at supabase.com → note the Project URL and anon key
- [ ] Create RevenueCat account at app.revenuecat.com → note iOS and Android public keys
- [ ] Create OpenAI account at platform.openai.com → generate API key
- [ ] Create DeepAR account at developer.deepar.ai → create project, note iOS and Android license keys
- [ ] Create PostHog account at posthog.com → note project API key
- [ ] Create Sentry account at sentry.io → create React Native project, note DSN

### 1.2 — Scaffold the Expo App
```bash
npx create-expo-app groomai --template blank-typescript
cd groomai
npx expo install expo-dev-client
```
- [ ] Confirm `package.json` matches the full dependency list in `01-project-overview.md`
- [ ] Install all dependencies with `npx expo install ...`
- [ ] Add `@react-native-community/netinfo` (`npx expo install @react-native-community/netinfo`)
- [ ] Set up folder structure exactly as documented in `01-project-overview.md`
- [ ] Create `.env` from `.env.example` (see `17-environment-setup.md` Section 2) — fill in all MOBILE APP KEYS only
- [ ] Add `.env` to `.gitignore`

### 1.3 — Supabase Setup
- [ ] Follow `13-supabase-setup.md` step by step
- [ ] Enable Auth providers: Email, Google, Apple in Supabase Dashboard
- [ ] Run migration `001_profiles.sql` — creates `profiles` table + `handle_new_user` trigger
- [ ] Run migration `002_routines.sql` — routines, routine_steps, habit_logs, streaks
- [ ] Run migration `003_gamification.sql` — badges, user_badges, XP functions
- [ ] Run migration `004_features.sql` — hairstyles, saved_hairstyles, skin_analysis_logs, hair_loss_logs, product_scans, affiliate_clicks, notification_settings, webhook_events, ai_usage_logs
- [ ] Verify all required tables are created in Supabase Table Editor (see `02-database-schema.md`)
- [ ] Verify the `handle_new_user` trigger fires correctly (create a test auth user, confirm profile row is auto-created with `subscription_status = 'trial'` and `trial_ends_at = NOW() + 7 days`)
- [ ] Verify `increment_xp` SQL function exists and uses `GREATEST(0, ...)`
- [ ] Enable RLS on every table (confirm no table has RLS disabled)
- [ ] Create Storage buckets: `profile-avatars` (public), `skin-analysis` (private), `hair-loss-photos` (private), `hairstyle-assets` (public)

### 1.4 — Set Supabase Server Secrets
```bash
supabase secrets set \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... \
  OPENAI_API_KEY=sk-proj-... \
  REVENUECAT_WEBHOOK_SECRET=your_rc_webhook_secret
```
- [ ] Confirm secrets appear in Supabase Dashboard → Settings → Edge Functions → Secrets

### 1.5 — Generate TypeScript Types
```bash
npm run gen:types
```
- [ ] Confirm `types/supabase.ts` is generated and not empty
- [ ] Add `gen:types` script to `package.json` (see `17-environment-setup.md` Section 3)

### 1.6 — Supabase Client Setup
- [ ] Create `lib/supabase.ts` — Supabase client using URL + anon key from env
- [ ] Confirm client initializes without error

### 1.7 — Service Layer Skeleton
-  [ ] Create all service files as empty modules with correct imports (from `15-api-services.md`):
  - `services/auth.service.ts`
  - `services/routine.service.ts`
  - `services/habit.service.ts`
  - `services/barber.service.ts`
  - `services/skin.service.ts`
  - `services/hairloss.service.ts`
  - `services/subscription.service.ts`
- [ ] Create `stores/user.store.ts` — Zustand store for user profile
- [ ] Set up React Query `QueryClient` in `app/_layout.tsx`

### 1.8 — Build the Dev Client
```bash
# iOS (requires Mac + Xcode):
npx expo run:ios

# Android:
npx expo run:android
```
- [ ] App launches on a physical device without crashing
- [ ] No red error screen on launch

---

## Done When
- [x] App runs on a real iOS device via Expo Go (v1 uses Expo Go — DeepAR dev build needed for v2 only)
- [ ] All required Supabase tables exist with correct schema
- [ ] Creating a test user auto-creates a profile row with trial subscription
- [ ] `types/supabase.ts` is generated and committed
- [ ] All service files exist (even if empty)
- [ ] No secrets in any `.env` file
