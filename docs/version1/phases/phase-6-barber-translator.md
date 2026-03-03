# Phase 6 — Barber Translator & Hairstyle Library

## Goal
The barber tab is fully functional. Users can browse 50+ hairstyles filtered by face shape, view detailed barber scripts, save favorites, and generate a shareable barber card. The celebrity photo breakdown (AI) feature is implemented for premium users. This is a key viral feature — the barber card share loop drives organic installs.

## Complexity: Medium
## Estimated Time: 3–4 days

---

## Reference Docs
- `06-barber-translator.md` — hairstyle library, face shape filtering, barber card, WhatsApp share, AI celebrity breakdown
- `02-database-schema.md` — `hairstyles` and `saved_hairstyles` tables

---

## Step-by-Step Tasks

### 6.1 — Hairstyle Data
- [ ] Create `constants/hairstyles.ts` — complete hairstyle library (50+ entries)
  - Each entry: `id`, `slug`, `name`, `category`, `faceShapes[]`, `hairTypes[]`, `barberScript`, `technicalName`, `guardNumbers`, `stylingInstructions`, `maintenanceFrequency`, `thumbnailUrl`, `isPremium`, `isTrending`, `deepArEffectId`
  - Categories: `short`, `medium`, `long`, `beard`, `combo`
- [ ] Seed the `hairstyles` table in Supabase from this constant (migration or Supabase Studio insert)
- [ ] Verify: every slug is unique and uses hyphens

### 6.2 — Service Layer
- [ ] Implement `services/barber.service.ts`:
  - `getHairstyles(filters)` — filter by `face_shape`, `category`, `hair_type`, `is_premium`
  - `getHairstyleById(id)` — fetch single with full details
  - `saveHairstyle(userId, hairstyleId)` — upsert `saved_hairstyles`
  - `unsaveHairstyle(userId, hairstyleId)` — delete from `saved_hairstyles`
  - `getSavedHairstyles(userId)` — fetch all saved
  - `incrementViewCount(hairstyleId)` — fire-and-forget view tracking
- [ ] React Query hooks: `useHairstyles(filters)`, `useSavedHairstyles()`, `useSaveHairstyle()` mutation

### 6.3 — Barber Tab Screen
- [ ] `app/(tabs)/barber.tsx` — main discovery screen
  - [ ] Category filter chips: All / Short / Medium / Long / Beard / Trending
  - [ ] "For Your Face Shape" section at top — auto-filtered using `profile.face_shape`
  - [ ] Grid of hairstyle thumbnail cards
  - [ ] Trending section
  - [ ] Search by name
  - [ ] Premium styles shown with a lock icon for free users

### 6.4 — Hairstyle Detail Screen
- [ ] `app/hairstyle-detail.tsx`
  - [ ] Multi-angle photo carousel (front, side, back)
  - [ ] Style name + technical name
  - [ ] Suitability badges for face shapes
  - [ ] "Barber Script" section — exact words to say (the star feature)
  - [ ] Guard numbers (visually displayed, e.g. "#1.5 on sides, scissor cut on top")
  - [ ] Styling instructions
  - [ ] Maintenance frequency ("Every 3–4 weeks")
  - [ ] Save ♡ button (syncs to `saved_hairstyles`)
  - [ ] "Try It On" button → `requirePremium(() => router.push('/ar-tryon'))`
  - [ ] "Generate Barber Card" button

### 6.5 — Barber Card Generator
- [ ] `components/barber/BarberCard.tsx` — renders a styled card image containing:
  - [ ] Hairstyle name + photo
  - [ ] Barber script text (formatted)
  - [ ] Guard numbers
  - [ ] GroomAI watermark/logo (subtle — this is the viral loop)
- [ ] Export card as image using `react-native-view-shot` or `expo-media-library` screenshot approach
- [ ] "Save to Photos" action
- [ ] "Share via WhatsApp" action using `Share.share()` from React Native core API
- [ ] "Share" generic action for other apps

### 6.6 — Celebrity Photo AI Breakdown (Premium)
- [ ] Premium-gated entry point on hairstyle detail: "Analyze a celebrity photo"
- [ ] User picks a photo from camera roll
- [ ] Photo sent to `analyze-hairstyle` Supabase Edge Function (OpenAI GPT-4o Vision)
- [ ] Returns: estimated style name, guard numbers, barber instructions
- [ ] Result displayed in the same barber card format
- [ ] Guard against sending photos that don't contain a face — check confidence from GPT response

### 6.7 — Saved Hairstyles
- [ ] `app/(tabs)/profile.tsx` or a dedicated saved screen: "My Saved Styles" section
- [ ] List of saved hairstyles with thumbnail, name, quick-access to barber script

---

## Done When
- [ ] User can browse hairstyles filtered by their face shape (auto-detected from onboarding)
- [ ] Tapping a hairstyle shows the full barber script with guard numbers
- [ ] User can generate a barber card and share it via WhatsApp
- [ ] Saved hairstyles persist across app restarts
- [ ] Premium hairstyles are locked for free users with a paywall gate
- [ ] Celebrity photo breakdown returns a plausible barber script (GPT-4o Vision)
- [ ] View count increments in DB for analytics
