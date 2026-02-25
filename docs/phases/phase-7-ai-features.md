# Phase 7 — AI Features

## Goal
Three AI-powered premium features are live: skin analysis, product ingredient scanner, and AI routine generator. All AI calls go through Supabase Edge Functions — zero OpenAI calls from the mobile app directly. Rate limiting is enforced per user/tier to prevent abuse.

## Complexity: High
## Estimated Time: 4–5 days

---

## Reference Docs
- `09-skin-analysis.md` — selfie capture, GPT-4o Vision edge function, result display, skin report
- `10-product-scanner.md` — CameraView barcode scan, Open Beauty Facts API, ingredient safety analysis
- `05-routine-builder.md` — AI routine generator Edge Function
- `13-supabase-setup.md` — rate limiter (`_shared/rateLimiter.ts`), `ai_usage_logs` table

---

## Important: All AI Calls Are Server-Side Only
`OPENAI_API_KEY` lives in Supabase Secrets only. The mobile app **never** calls OpenAI directly. All AI features call a Supabase Edge Function, which then calls OpenAI.

---

## Step-by-Step Tasks

### 7.1 — Rate Limiter (Shared Edge Function Utility)
- [ ] Create `supabase/functions/_shared/rateLimiter.ts` — enforces per-user daily limits (recommended model):
  - Free: 0/day (AI features are premium-only)
  - Trial: limited per feature (example: skin analysis 1/day, routine generation 1/day)
  - Premium: higher per feature (example: skin analysis 3/day, routine generation 5/day)
  - Lifetime: highest per feature (example: skin analysis 5/day, routine generation 10/day)
- [ ] Confirm `ai_usage_logs` table exists in `004_features.sql` migration
- [ ] Every AI edge function imports and calls `checkRateLimit(userId, feature, subscriptionStatus)` before proceeding
- [ ] Returns 429 with a clear message if limit exceeded

### 7.2 — Skin Analysis Feature
**Edge Function:**
- [ ] Deploy `supabase/functions/analyze-skin/index.ts` (see `09-skin-analysis.md`)
  - Accept: `{ userId, imageBase64 }`
  - Rate limit check first
  - Convert base64 → blob using `fetch('data:image/jpeg;base64,...').then(r => r.blob())` — **do NOT use `Buffer.from()`** (Node.js only, not available in Deno)
  - Upload photo to `skin-analysis/{userId}/{timestamp}.jpg` in Supabase Storage
  - Call GPT-4o Vision with the image URL
  - Return: `{ skin_type, concerns[], recommendations[], confidence_score }`
  - Save result to `skin_analysis_logs` table
  - Log usage to `ai_usage_logs`

**Mobile Screen:**
- [ ] `app/skin-analysis.tsx` — premium-gated
  - [ ] `components/skin/FaceOvalGuide.tsx` — SVG oval overlay guiding user to center face (see `09-skin-analysis.md`)
  - [ ] `expo-camera` selfie capture — no Gallery access needed for this screen
  - [ ] "Analyze" button → sends base64 to Edge Function
  - [ ] Loading state: "Analyzing your skin..." with animated progress
  - [ ] Results display:
    - [ ] Detected skin type
    - [ ] Concerns list with icons
    - [ ] Personalized recommendations
    - [ ] Confidence score
  - [ ] "⚠️ Guidance only, not a medical diagnosis." disclaimer — **required in UI**
  - [ ] "Save Report" — saves to `skin_analysis_logs`, adds to timeline
  - [ ] "Before/After" — can compare two reports side by side (if more than one exists)
- [ ] Award "+100 XP" on first ever skin analysis

### 7.3 — Product Scanner Feature
- [ ] `app/product-scanner.tsx` — premium-gated
  - [ ] Uses `expo-camera` `CameraView` with `onBarcodeScanned` prop (NOT deprecated `expo-barcode-scanner`)
  - [ ] `barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}`
  - [ ] On scan: pause camera, show loading, lookup barcode
- [ ] **Open Beauty Facts API lookup** (free, no key needed):
  - `GET https://world.openbeautyfacts.org/api/v0/product/{barcode}.json`
  - Extract: product name, brand, ingredients list
  - Handle 404 (product not in database) gracefully
- [ ] **Ingredient safety analysis** Edge Function (`supabase/functions/analyze-product/index.ts`):
  - Rate limited
  - Takes ingredients list + user's `skin_type` + `skin_concerns` from profile
  - GPT-4o analyzes which ingredients are problematic for this specific user
  - Returns: `safety_score` (1–10), `flagged_ingredients[]`, `recommendation` (safe/caution/avoid)
- [ ] Results screen:
  - [ ] Product name + brand
  - [ ] Safety score with color coding (green/yellow/red)
  - [ ] Flagged ingredients list with explanation of WHY they're flagged for the user's skin
  - [ ] "safe" / "caution" / "avoid" final verdict badge
  - [ ] Save to scan history (`product_scans` table)
- [ ] Award "+100 XP" on first ever product scan

### 7.4 — AI Routine Generator (Premium)
- [ ] Deploy `supabase/functions/generate-routine/index.ts` (see `05-routine-builder.md`)
  - Rate limited (this call is expensive — count as 3 AI calls)
  - Takes full user profile (face_shape, skin_type, concerns, hair_type, goals, time_available, budget)
  - Returns structured morning + night routine JSON
  - `response_format: { type: 'json_object' }` to ensure parseable output
- [ ] "Generate My Routine with AI" button in routines tab (premium-gated)
- [ ] Loading screen: "Building your personalized plan..." (10–15 second estimate)
- [ ] On success: review screen showing generated steps → user can tap each step to keep/remove → "Save Routine" CTA
- [ ] Saved as a new routine with `is_ai_generated: true`

### 7.5 — Scan & Analysis History
- [ ] Profile tab: "Skin History" section — timeline of past analyses with dates
- [ ] Profile tab: "Scan History" section — list of scanned products with safety scores
- [ ] React Query hooks for both: `useSkinAnalysisLogs()`, `useProductScans()`

---

## Done When
- [ ] Skin analysis takes a selfie, sends to Edge Function, receives analysis, displays results on screen
- [ ] Medical disclaimer is always visible on skin analysis results
- [ ] Product scanner reads EAN/UPC barcodes and returns an analysis tailored to the user's skin type
- [ ] Rate limiter blocks AI calls beyond the tier limit and shows a friendly error
- [ ] AI routine generator produces a structured routine and saves it to the DB
- [ ] All three AI features award XP on first use
- [ ] `ai_usage_logs` table has a row for every AI call made
