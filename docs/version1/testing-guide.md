# GroomAI — Testing Guide
> Step-by-step QA flows for every completed feature. Follow in order — each section builds on the previous. Use a physical device (iOS or Android) running the Expo Go or dev build.

---

## 0. Prerequisites

| # | Requirement |
|---|---|
| 1 | Expo Go installed on your phone (or EAS dev build) |
| 2 | `npx expo start --go -c` running in terminal |
| 3 | Supabase migration `009_tracking_affiliate.sql` successfully run |
| 4 | `hair-loss-photos` Storage bucket created (private) |
| 5 | `skin-analysis` Storage bucket created (public) |
| 6 | `OPENAI_API_KEY` set in Supabase Secrets (Dashboard → Settings → Edge Functions → Secrets) |

---

## 1. Auth — Sign Up & Sign In

### 1A. Sign Up (new user)
1. Open app → you should land on the **Welcome** screen with the GroomAI logo
2. Tap **Create Account**
3. Enter a name, email, and password → tap **Sign Up**
4. ✅ You should be navigated directly to **Onboarding Step 1**

### 1B. Sign In (existing user)
1. Open app → tap **Sign In**
2. Enter credentials → tap **Sign In**
3. ✅ App should redirect to the home tab (bypasses onboarding if profile already complete)

### 1C. Sign Out
1. Go to **Profile tab** → scroll down → tap **Sign Out**
2. Confirm in the alert
3. ✅ Returns to Welcome screen

---

## 2. Onboarding (6 Steps)

> Only shown to new users. Complete this in sequence.

| Step | Screen | What to do | Expected |
|---|---|---|---|
| 1 | Basics | Enter name, age, pick nationality | Next button activates |
| 2 | Face Shape | Tap one of 5 face shapes (Oval, Round, Square, Heart, Diamond) | Card highlights gold |
| 3 | Skin Type | Pick skin type + any concerns | Multi-select concerns work |
| 4 | Hair Type | Pick hair type, texture, length, concerns | All toggles selectable |
| 5 | Goals | Pick 1–4 grooming goals | Next activates after ≥1 |
| 6 | Trial | Shows 7-day trial offer | Tap **Start Free Trial** |

✅ After Step 6 → redirected to **Home tab**

---

## 3. Home Tab

1. Open **Home tab**
2. ✅ Greeting shows your first name (`Good morning, [Name].`)
3. ✅ Three stat cards visible: **Streak**, **Level**, **Total XP**
4. ✅ XP progress bar shows distance to next level
5. ✅ **Today's Routines** section shows Morning and Night mini-cards with progress bars
6. ✅ **Daily Tip** card rotates daily (changes each calendar day)
7. ✅ **Products For You** section shows 3 affiliate product cards matched to your skin type (e.g. if oily skin → CeraVe SA Cleanser + Neutrogena Oil-Free)
8. Tap a product card → ✅ opens Amazon/product URL in browser + click recorded
9. ✅ **Quick Actions** row: Routines, Badges, Barber — each navigates correctly

---

## 4. Routines Tab

### 4A. View routines
1. Open **Routines tab**
2. ✅ Morning and Night routine cards visible (auto-seeded on first launch)
3. Each card shows a **progress bar** based on today's completions

### 4B. Open a routine
1. Tap the **Morning** routine card
2. ✅ Opens routine detail screen with list of steps
3. Toggle a step → ✅ checkbox fills, XP bar animates, step logged to DB

### 4C. Complete a full routine
1. Check all steps in a routine
2. ✅ Success animation triggers
3. ✅ Streak count increments on the Home tab

### 4D. Create custom routine (premium)
1. Tap **Create Custom Routine** at the bottom of the Routines tab
2. If free user → ✅ redirected to Paywall
3. If premium user → ✅ bottom sheet slides up
4. Enter a name (e.g. "Gym Day") → pick type → tap **Create Routine**
5. ✅ New card appears in the list

### 4E. AI Routine Generator (premium)
> Access via Routines tab or navigate directly to `ai-routine`

1. Navigate to **AI Routine Generator** screen (currently needs direct navigation — see Pending Notes)
2. ✅ Screen shows feature overview with Generate button
3. Tap **Generate My Routine**
4. ✅ Loading state: "Building your plan..." for ~15 seconds
5. ✅ Review screen appears with Morning + Night steps, each with checkboxes
6. Tap a step to **deselect** it → it dims out
7. Tap **Save Routine**
8. ✅ Alert: "🎉 Routine Saved!" → tapping "Let's go!" navigates to Routines tab
9. ✅ New AI-generated routines appear in Routines list

---

## 5. Tracker Tab

### 5A. Streak & Habits
1. Open **Tracker tab**
2. ✅ Current streak shown prominently
3. ✅ Habit grid shows today's habit slots (morning/night)
4. ✅ Completed habits shown with green indicators

### 5B. Badges
1. Scroll to **Badges** section
2. ✅ Earned badges shown in gold; locked badges dimmed
3. Tap an earned badge → ✅ badge detail overlay appears

---

## 6. Barber Tab

### 6A. Browse hairstyles
1. Open **Barber tab**
2. ✅ Grid of hairstyle cards by category (Short, Medium, Long, Beard)
3. Filter by face shape → ✅ grid updates

### 6B. Hairstyle detail
1. Tap any hairstyle card
2. ✅ Detail screen opens showing style name, description, maintenance level
3. Tap **Share Barber Card** → ✅ system share sheet opens

### 6C. Celebrity Breakdown
1. Tap any celebrity hairstyle
2. ✅ Breakdown screen shows style notes + instructions

### 6D. Product Scanner (premium)
1. Tap **Scan a Product** (or navigate to `product-scanner`)
2. If free → ✅ redirected to Paywall
3. Grant camera permission when prompted
4. ✅ Camera opens with animated gold scan frame
5. Point camera at a product barcode (e.g. CeraVe cleanser)
6. ✅ Barcode detected → "Looking up product..." loader
7. ✅ Results card appears with: safety score, verdict badge (✅ Safe / ⚠️ Caution / 🚫 Avoid), flagged ingredients
8. Results are personalised to **your skin type** (set in onboarding)
9. Tap **Scan Again** → ✅ returns to scanner
10. Tap **💡 Try: [Product]** affiliate link → ✅ opens browser + records click

---

## 7. AI Skin Analysis (premium)

> Navigate to `skin-analysis` from Profile tab or direct link

1. If free → ✅ redirected to Paywall
2. Grant camera permission
3. ✅ Screen shows front-facing camera with gold oval face guide
4. Tap **Take Photo**
5. ✅ Preview shown — tap **Analyze** or **Retake**
6. Tap **Analyze**
7. ✅ Animated loading state: "Analyzing your skin..." (~10–15 seconds)
8. ✅ Results screen shows:
   - Skin type detected (e.g. Oily)
   - Overall skin score (e.g. 72/100)
   - Concern cards (e.g. "Blackheads — Moderate")
   - Recommendations (product, ingredient, or habit tips)
   - ⚠️ **Medical Disclaimer** visible at bottom
9. Rate limiting: try analyzing **again immediately** → ✅ should show "Daily limit reached" message (free: 1/day, premium: 5/day)

---

## 8. Hair Loss Tracker (premium)

> Navigate to `hair-loss-tracker`

### 8A. First session
1. ✅ Home screen: shows 0 sessions, 0 photos
2. Tap **Log This Month's Photos**
3. ✅ Camera opens showing step "1/5 — Top of Head" with gold dashed circle overlay
4. Point camera at top of your head → tap the white capture button
5. ✅ Auto-advances to "2/5 — Front Hairline"
6. Capture all 5 angles (Top → Front → Back → Left → Right)
7. ✅ Review screen shows 5 photo thumbnails in a grid
8. Tap **Save This Month's Log**
9. ✅ Uploads all 5 photos to Supabase Storage (private bucket)
10. ✅ Saves records to `hair_loss_logs` table
11. ✅ +75 XP awarded (check Home tab XP counter)

### 8B. Monthly cadence check
1. Go back to Hair Loss Tracker home
2. ✅ Shows "✅ This month is logged" with next session date
3. The **Log This Month** button is replaced with the "already done" card

### 8C. Timeline view
1. After at least 1 session: tap **View Full Timeline**
2. ✅ Angle selector chips at top (Top, Front, Back, Left, Right)
3. ✅ Side-by-side comparison shown (same photo in both slots for first session)
4. ✅ Month thumbnail scrubber at bottom
5. Tap a month thumbnail → it becomes the **L** (left) comparison photo (shown in gold)

---

## 9. Paywall & Subscription

1. As a free user, tap any premium feature
2. ✅ Paywall screen slides up
3. ✅ Shows pricing tiers (Monthly, Annual, Lifetime)
4. ✅ Trial Warning Banner visible at top if in trial period
5. Tap a plan → ✅ RevenueCat purchase flow triggers (sandbox on dev build)

---

## 10. Profile Tab

1. Open **Profile tab**
2. ✅ Shows name, avatar initials, subscription badge (Free / Premium)
3. ✅ Profile card shows: Skin Type, Face Shape, Total XP
4. Tap **Subscription** → ✅ navigates to Paywall
5. Tap **Sign Out** → confirm → ✅ returns to Welcome screen

---

## 11. Analytics Verification

> These are background events — verify in PostHog dashboard (if EXPO_PUBLIC_POSTHOG_KEY is set)

| Event | When it fires |
|---|---|
| `sign_up` | First account creation |
| `onboarding_completed` | After step 6 |
| `paywall_viewed` | Any paywall screen open |
| `routine_step_completed` | Checking off a routine step |
| `skin_analysis_completed` | After AI skin analysis |
| `product_scanned` | After barcode scan analysis |
| `affiliate_link_clicked` | Tapping any affiliate product card |
| `hair_loss_session_completed` | Saving a 5-angle session |

---

## Known Issues & Limitations

| Issue | Notes |
|---|---|
| AI features return 429 | OpenAI billing/credits must be enabled. App shows "AI Temporarily Unavailable" gracefully. |
| Affiliate links inactive | `AFFILIATES_ENABLED = false` by default. Cards display "Coming Soon" badges instead of buy CTAs. |
| AR Try-On hidden | Deferred to v2. Placeholder screen exists but entry is commented out. |
| PostHog/Sentry no-op | Events fire but are silently discarded until env keys are set. |

