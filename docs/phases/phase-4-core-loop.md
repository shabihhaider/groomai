# Phase 4 — Core Loop

## Goal
The main daily driver is fully functional. Users can view their routines, check off steps, earn XP, level up, maintain streaks, and earn badges. Push notifications remind them to complete their routine. This is the feature that drives daily retention — it must feel satisfying and polished before moving on.

## Complexity: High
## Estimated Time: 5–7 days

---

## Reference Docs
- `05-routine-builder.md` — routine screens, step completion, AI generator, default routines
- `07-habit-tracker.md` — XP system, level titles, badges, streak logic, notifications
- `15-api-services.md` — `habitService`, `badgeService`, `routineService`, React Query hooks

---

## Step-by-Step Tasks

### 4.1 — Service Layer (Routines & Habits)
- [ ] Implement `services/routine.service.ts`:
  - `getRoutines(userId)` — fetch user's active routines
  - `getRoutineSteps(routineId)` — fetch steps with today's completion status
  - `seedDefaultRoutines(userId, skinType)` — batch insert from `constants/defaultRoutines.ts` using `Promise.all` (see `15-api-services.md`)
  - `createRoutine(userId, data)` — create custom routine (premium)
  - `addStep(routineId, stepData)` — add step to routine
- [ ] Implement `services/habit.service.ts`:
  - `completeStep(stepId, userId)` — upsert `habit_logs`, call `awardXP`, `updateStreak`, `checkBadges`
  - `uncompleteStep(stepId, userId)` — upsert with `completed: false`, deduct XP (GREATEST(0,...) guard in SQL handles negative prevention)
  - `getTodayLogs(userId)` — fetch all logs for today
  - `updateStreak(userId)` — logic: check `last_active_date`, increment or reset
- [ ] Implement `constants/defaultRoutines.ts` — all 6 skin types with morning/night steps (see `05-routine-builder.md`)

### 4.2 — XP & Badge Service
- [ ] Implement `badgeService.checkAndAward(userId)` — queries DB, compares against badge unlock conditions, inserts to `user_badges`, returns `badge | null` to the caller (does NOT call `router.push` — callers handle navigation)
- [ ] Implement `awardXP(userId, amount)` — calls `supabase.rpc('increment_xp', ...)`
- [ ] Implement `services/habit.service.ts` → `updateStreak()` — compare today vs `last_active_date`, handle day boundaries correctly using `date-fns`
- [ ] Seed the `badges` table with all 20 badge definitions from `07-habit-tracker.md` (slug, name, description, xp_reward, rarity, unlock_condition)
- [ ] Verify badge slugs use hyphens: `first-checkin`, `week-warrior`, `skin-guru`, etc.

### 4.3 — React Query Hooks
- [ ] `hooks/useRoutine.ts` — `useRoutines()`, `useRoutineSteps(routineId)`, `useCompleteStep()` mutation
- [ ] `hooks/useHabits.ts` — `useTodayLogs()`, `getCompletionRatio(routineId)`
- [ ] All hooks use correct imports from `15-api-services.md` — do NOT import `router` inside service layer

### 4.4 — Routines Tab Screen
- [ ] `app/(tabs)/routines.tsx`
  - [ ] Time-aware greeting: "Good morning, [Name]." / "Good evening, [Name]."
  - [ ] Morning routine card + Night routine card side by side
  - [ ] Animated progress bar on each card (`components/routine/RoutineCard.tsx`)
  - [ ] "Routine complete ✓" state when all steps done
  - [ ] "+ Create Custom Routine" button — premium-gated
- [ ] `components/routine/RoutineCard.tsx` — animated card with `AnimatedProgressBar` (see `05-routine-builder.md`)

### 4.5 — Routine Detail Screen
- [ ] `app/routine-editor.tsx` — list of steps for a specific routine
- [ ] Each step is a tappable row:
  - [ ] Tap → circle animates to ✓ with spring animation + light haptic
  - [ ] Step card dims slightly when completed
  - [ ] Progress bar at top increments
  - [ ] Floating "+10 XP" toast appears (`components/tracker/XPToast.tsx`)
- [ ] When ALL steps complete:
  - [ ] Confetti Lottie animation plays
  - [ ] "Routine complete! +50 XP" celebration text
  - [ ] Streak is incremented
- [ ] `components/routine/StepTimer.tsx` — countdown timer per step, premium-gated (see `05-routine-builder.md`)

### 4.6 — Habit Tracker Tab Screen
- [ ] `app/(tabs)/tracker.tsx`
  - [ ] XP progress bar: current XP → next level threshold (animated)
  - [ ] Current level title displayed (e.g. "Level 4 — Consistent")
  - [ ] Current streak counter with flame icon
  - [ ] Badge grid — earned badges glow, unearned are locked/dimmed
- [ ] `app/badge-unlock.tsx` — full-screen celebration modal when a badge is earned (transparent modal, Lottie animation)
- [ ] Badge unlock flow: `badgeService.checkAndAward` returns badge → caller pushes to `/badge-unlock` with badge data

### 4.7 — Gamification Constants
- [ ] `constants/badges.ts` — full 20-badge definitions array matching DB seed data, same slugs
- [ ] `utils/streaks.ts` — `updateStreak(userId)`, `getStreakStatus()` helpers
- [ ] `components/tracker/XPToast.tsx` — floating "+10 XP" animated toast using Reanimated (FadeInUp + FadeOutUp)

### 4.8 — Push Notifications
- [ ] Request notification permissions on first app open (after onboarding)
- [ ] `utils/notifications.ts`:
  - [ ] `scheduleMorningReminder(time)` — schedules daily at user's chosen time
  - [ ] `scheduleNightReminder(time)` — schedules nightly
  - [ ] `scheduleStreakWarning()` — scheduled at 8 PM if today's routine not yet completed: "You'll lose your X-day streak tonight!"
- [ ] `notification_settings` table: save user's preferred times, read on app launch to schedule
- [ ] Notification tap → deep link to `/(tabs)/routines`

### 4.9 — Home Tab (Skeleton)
- [ ] `app/(tabs)/home.tsx` — dashboard showing:
  - [ ] Today's streak count
  - [ ] Morning/night routine completion preview
  - [ ] "Daily tip" card (static text for now — rotating copy)
  - [ ] XP bar mini version

---

## Done When
- [ ] New user gets default routine seeded based on their skin type from onboarding
- [ ] User can complete routine steps and XP increments in real-time
- [ ] Completing all steps triggers confetti + streak increment
- [ ] After 7 days, `week-warrior` badge is awarded and the unlock modal fires
- [ ] Uncompleting a step reduces XP (but total XP never goes below 0)
- [ ] Push notification fires at scheduled time if routine is not yet complete
- [ ] Routine state persists across app restarts (React Query + Supabase)
