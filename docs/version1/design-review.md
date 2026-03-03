# GroomAI — V1 Design Review & Fix List
**Reviewed by:** Senior Product Review  
**Date:** February 25, 2026  
**Verdict:** Good foundation. Needs significant polish before shipping.

---

## Overall Honest Score: 6.5 / 10

The dark theme and gold accent direction is correct. The app is functional. But right now it feels like a **prototype, not a premium product.** Several screens look empty, interactions are missing, and the paywall has a critical bug. Details below.

---

## Screen-by-Screen Review

---

### 🏠 Screen 1 — Home Screen
**Score: 7/10 — Good structure, needs life**

#### ✅ What's Working
- Dark background + gold accent is on-brand
- Streak / Level / XP stat cards are correct and clear
- "Today's Routines" section layout is right
- Daily Tip card is a nice touch
- Products For You section with affiliate cards is exactly right
- Bottom tab bar icons are clean

#### ❌ What's Wrong / Missing

**1. Stat cards have no visual weight**
The 3 stat cards (Streak, Level, XP) look flat. They need a subtle inner glow or border to feel premium — right now they look like plain dark boxes.

**Fix:** Add `borderWidth: 1, borderColor: '#C9A84C22'` to each stat card. Also add the gold color to the streak number itself (not just the flame emoji).

**2. Routine cards are too minimal**
Morning 0/3 and Night 0/3 cards have no progress bar, no visual indication of completion state. They look unfinished.

**Fix:** Add a thin gold progress bar at the bottom of each routine card. Even at 0% it should show as an empty track — this creates psychological pull ("I need to fill this").

**3. XP progress bar looks broken**
The gold bar under the stat cards is there but looks cut off and has no label attached to it directly. The "150 XP to Level 4" text is floating disconnected.

**Fix:** Put the label INSIDE or directly above the bar. Show current XP / target XP (e.g., "350 / 500 XP").

**4. No animation on load**
Elements appear all at once with no entrance animation. This is what separates a premium app from a basic one.

**Fix:** Stagger FadeInDown animations — stat cards first, then routines, then tip, then products. 150ms delay between each group.

**5. "Good afternoon, Shabih." — greeting is grey**
"Good afternoon," is grey but "Shabih." is white. This is intentional per the design system and is correct — but "Good afternoon," should be slightly larger (16px not 14px) to not feel like a subheading.

---

### 🏆 Screen 2 — Progress Screen
**Score: 7.5/10 — Best screen so far**

#### ✅ What's Working
- Level card with XP bar looks great
- Streak stats (Current / Best / Total Days) layout is clean
- Badge grid with lock icons is the right approach
- "1 of 20 earned" counter is psychologically smart
- "Day One" badge is correctly unlocked and highlighted

#### ❌ What's Wrong / Missing

**1. Badge cards are too small and cramped**
3 columns is too tight. Badge names are getting cut off ("Grooming Mas..."). Users can't read what they're working toward — which defeats the entire psychological purpose of showing locked badges.

**Fix:** Switch to 2-column grid for badges. Bigger cards, full name visible, add a small progress indicator under locked badges (e.g., "5/7 days" under Week Warrior).

**2. Locked badges all look identical**
Every locked badge shows the same gold padlock on a dark background. There's no differentiation by rarity. A legendary badge should look more aspirational than a common one even when locked.

**Fix:** Add a subtle colored border on locked badges based on rarity — grey for common, blue for rare, purple for epic, gold for legendary. Even at 30% opacity this creates visual hierarchy.

**3. No "what do I need to do" context**
User sees "Week Warrior — locked" but doesn't know they need a 7-day streak to unlock it. The badge is useless for motivation without this.

**Fix:** On tap, open a bottom sheet showing: badge name, description, unlock requirement, current progress bar. E.g., "7-day streak required. You're at day 1. Keep going."

**4. Weekly activity grid is missing**
The blueprint specified a GitHub-style contribution grid showing last 12 weeks of activity. This is a powerful visual retention tool and it's not here.

**Fix:** Add it between the streak card and badges section. Even a simple 7×12 grid of colored dots (gold = active, dark = missed) works.

**5. XP bar on level card needs current/target numbers**
"500 XP to Level 4" is shown but current XP (350) is only in small text. Both numbers should be prominent.

---

### ✂️ Screen 3 — Barber Translator
**Score: 8/10 — Best screen in the app**

#### ✅ What's Working
- "Find your cut. Speak the language." tagline is perfect
- Search bar is correctly placed
- Filter chips (All, Trending, Short, Medium) work well
- "Recommended for You" section with face shape label is excellent
- Celebrity Photo Breakdown with PRO badge is exactly right
- "All Styles (50)" count adds credibility
- Lock icon on premium styles in the grid is the right UX

#### ❌ What's Wrong / Missing

**1. Hairstyle cards have no photos — just placeholder icons**
This is the biggest issue on this screen. Scissors emoji on a dark background is not compelling. Users need to SEE the haircut.

**Fix:** This needs real hairstyle photos. Either license stock photos or use illustrated hairstyle drawings. This is non-negotiable for this feature to work. Placeholder icons make the feature feel unfinished.

**2. "Recommended for You" cards are the same placeholder problem**
Same issue — users can't evaluate a style without seeing it.

**3. Filter chips need a "Beard" option**
Per the blueprint, Beard was a filter category. It's missing.

**Fix:** Add "Beard" chip after "Long."

**4. No AR Try-On button visible**
The AR try-on button should be accessible from this screen — either a floating button or visible on each style card.

---

### 💳 Screen 4 — Paywall
**Score: 5/10 — Has a critical bug and feels incomplete**

#### ❌ Critical Bug
**Prices are not showing.** Annual, Monthly, and Lifetime cards all show a gold dash (—) instead of actual prices. The "Start Premium · —" button also shows a dash.

This means **RevenueCat is not returning offerings correctly.** This is a showstopper — you cannot ship with this bug.

**Fix:**
```typescript
// Check this in paywall.tsx
useEffect(() => {
  Purchases.getOfferings().then(o => {
    console.log('Offerings:', JSON.stringify(o, null, 2)) // Debug log
    setOfferings(o.current)
  }).catch(err => console.error('RevenueCat error:', err))
}, [])

// Make sure products are configured in:
// App Store Connect → Subscriptions
// Google Play → Subscriptions
// RevenueCat Dashboard → Products + Entitlements
```

The most likely cause: products haven't been created and approved in App Store Connect / Google Play Console yet, so RevenueCat returns empty offerings.

#### ❌ What Else Is Wrong

**1. No feature list on paywall**
The paywall shows plans but doesn't show WHAT the user gets. This is a major conversion killer. Users need to see the value before paying.

**Fix:** Add the 8-feature checklist (AR try-on, Skin Analysis, etc.) above the plan selector. This is the most important part of a paywall psychologically.

**2. No hero section / animation**
The paywall opens directly to plan cards. There's no emotional hook — no animation, no headline, no "here's what you're unlocking" moment.

**Fix:** Add the Lottie crown animation + "Unlock Your Full Blueprint" headline at the top before the plan cards.

**3. Social proof quote attribution says "Beta user" not a real name**
Minor but matters. Change to "— James K., verified user" as specified in the blueprint.

**4. Annual plan price not shown = no decoy effect**
Without seeing "$4.16/month" under the annual plan, the psychological pricing strategy completely fails. The user has nothing to compare.

---

### 🌙 Screen 5 & 6 — Night Routine & Morning Routine
**Score: 6/10 — Functional but static and empty**

#### ✅ What's Working
- Step numbering (1, 2, 3) is clear
- Step title + description format is correct
- Back navigation with step count is right

#### ❌ What's Wrong / Missing

**1. Steps are not tappable / completable**
This is the core function of the routine screen — users need to tap steps to check them off. Currently there's no checkbox, no tap interaction, nothing to complete. The screen is completely static.

**Fix:** Each step needs a tappable circle on the left that animates to a gold checkmark when tapped. This is the #1 missing feature on this screen.

**2. Hardcoded steps — Is this okay?**
You asked about this specifically. **For v1, yes it's acceptable IF** the steps are seeded correctly from the user's skin type during onboarding. What's not acceptable is if every user sees the same 3 steps regardless of their profile. Test this: create two users with different skin types and verify they get different routines. If they get the same steps, the seeding logic is broken.

**3. No progress bar at the top**
The "0/3 steps completed" text is there but there's no visual progress bar. Add a thin gold bar under the header that fills as steps are completed.

**4. No affiliate product cards under steps**
Each step should have a compact "💡 Try: [Product] → $14.99" card below it. This is both helpful UX AND your affiliate revenue. It's missing entirely.

**5. Empty bottom half of screen**
After 3 steps there's a large empty black void. This looks unfinished.

**Fix:** After steps, add: an affiliate product section ("Recommended for this routine"), a "Add a step" button (premium), and a motivational completion CTA that appears once all steps are done.

**6. No completion celebration**
When all 3 steps are checked, nothing happens. There should be a confetti animation + "Routine Complete! +50 XP" toast.

---

## Priority Fix List (Give This to Your Team)

### 🔴 P0 — Shipblocker (Fix Before Anything Else)
| # | Issue | Screen |
|---|---|---|
| 1 | RevenueCat not returning prices — paywall broken | Paywall |
| 2 | Routine steps are not tappable/completable | Routines |

### 🟠 P1 — High Priority (Fix Before Launch)
| # | Issue | Screen |
|---|---|---|
| 3 | Hairstyle cards need real photos, not placeholder icons | Barber |
| 4 | Paywall missing feature list (conversion killer) | Paywall |
| 5 | Paywall missing hero section/animation | Paywall |
| 6 | Badge grid — switch to 2 columns, show progress on locked badges | Progress |
| 7 | Routine completion — add confetti + XP toast on finish | Routines |
| 8 | Affiliate product cards missing under routine steps | Routines |

### 🟡 P2 — Should Have (Before Marketing/Launch)
| # | Issue | Screen |
|---|---|---|
| 9 | Stat cards need gold border + gold number color | Home |
| 10 | Routine cards need progress bars | Home |
| 11 | Screen entrance animations (FadeInDown stagger) | All |
| 12 | Weekly activity contribution grid | Progress |
| 13 | Badge tap → bottom sheet with unlock requirement + progress | Progress |
| 14 | Rarity borders on locked badges | Progress |
| 15 | Routine steps need progress bar in header | Routines |

### 🟢 P3 — Nice to Have (Post-Launch)
| # | Issue | Screen |
|---|---|---|
| 16 | Empty state below routine steps | Routines |
| 17 | Add "Beard" filter chip | Barber |
| 18 | AR try-on button on barber screen | Barber |
| 19 | XP bar labels (current / target) everywhere | Home + Progress |

---

## Psychological Gaps (Critical for Retention)

These are not UI bugs but missing psychological triggers that will directly hurt retention:

1. **No dopamine loop on routine completion** — users complete steps and nothing exciting happens. This will kill daily retention within a week. Fix: completion animation is P0.

2. **Badges have no progress visibility** — users don't know how close they are to the next badge. This kills the "just one more day" motivation loop. Fix: show progress % or "X days away" on every locked badge.

3. **No streak loss warning** — if a user misses a day, there's no recovery mechanism or warning notification. Duolingo's biggest retention driver is streak anxiety. Fix: 8PM push notification "Don't lose your streak tonight."

4. **Paywall has no urgency or loss framing** — "Start Premium" is weak. "Your 7-day trial ends in 2 days — don't lose access" is 3x more effective. Fix: show trial days remaining prominently.

---

## What's Genuinely Good (Don't Change)
- Dark theme + gold direction is exactly right — premium feel
- App name / tagline placement is clean
- Barber Translator concept and layout is solid
- Bottom tab bar is clean and correctly structured
- The overall information architecture is correct

---

## Final Honest Verdict

Your developer team has built the **skeleton correctly**. The bones are right. But right now it's a skeleton — it needs muscle (interactions), skin (animations), and a heartbeat (the dopamine loop of completing routines and earning rewards). The two P0 issues (broken paywall, non-tappable steps) must be fixed before showing this to anyone. Fix P0 and P1 and this becomes a shippable, strong v1.
