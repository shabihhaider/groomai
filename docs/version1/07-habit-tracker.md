# Habit Tracker & Gamification

## Overview
This is the **daily retention engine**. The gamification system must be dopamine-driven — every action should feel rewarding. Think Duolingo's streak system meets Apple Fitness's achievement badges, but designed for men's grooming.

---

## Psychological Framework
- **Variable reward** — Not every action gives XP equally. Surprise bonuses keep users engaged.
- **Loss aversion** — Streak warnings ("You'll lose your 7-day streak tonight!") drive action.
- **Progress visibility** — XP bar, level, badges all visible on home screen and tracker tab.
- **Social proof** — Show an activity counter on the home screen, e.g. "Thousands of men completed their routine today" — use real approximate DB counts queried daily, or use generic copy. **Do NOT hardcode a specific number like "12,400" — Apple/Google review will flag this as misleading if it does not reflect real data.**
- **Commitment device** — When users set a streak goal ("I want a 30-day streak"), completion rates increase significantly.

---

## XP System

| Action | XP |
|---|---|
| Complete one routine step | +10 |
| Complete full morning routine | +50 |
| Complete full night routine | +50 |
| Complete both routines in a day | +30 (bonus) |
| 7-day streak milestone | +200 |
| 30-day streak milestone | +500 |
| First scan with product scanner | +100 |
| First AR try-on (v2) | +100 |
| First skin analysis | +100 |
| Upload hair loss photo | +75 |
| Save first hairstyle | +50 |
| Complete onboarding | +150 |

---

## Level System

| Level | XP Required | Title |
|---|---|---|
| 1 | 0 | Rookie |
| 2 | 100 | Beginner |
| 3 | 250 | Getting There |
| 4 | 500 | Consistent |
| 5 | 1,000 | Groomed |
| 6 | 2,000 | Sharp |
| 7 | 4,000 | Refined |
| 8 | 7,000 | Distinguished |
| 9 | 11,000 | Elite |
| 10 | 16,000 | The Blueprint |

Level title appears on profile and home screen. Level 10 unlocks a special profile border.

---

## Badge System (Full List)

```typescript
// constants/badges.ts
export const BADGES = [
  // Streak Badges
  { slug: 'first-checkin', name: 'Day One', description: 'Completed your first routine', xp: 50, rarity: 'common', condition: { type: 'checkin_count', value: 1 } },
  { slug: 'week-warrior', name: 'Week Warrior', description: '7-day streak', xp: 150, rarity: 'common', condition: { type: 'streak', value: 7 } },
  { slug: 'fortnight', name: 'Fortnight', description: '14-day streak', xp: 250, rarity: 'rare', condition: { type: 'streak', value: 14 } },
  { slug: 'month-master', name: 'Month Master', description: '30-day streak', xp: 500, rarity: 'epic', condition: { type: 'streak', value: 30 } },
  { slug: 'century', name: 'Century', description: '100-day streak', xp: 1500, rarity: 'legendary', condition: { type: 'streak', value: 100 } },

  // Grooming Badges
  { slug: 'skin-starter', name: 'Skin Starter', description: 'Completed 10 skincare steps', xp: 100, rarity: 'common', condition: { type: 'steps_category', category: 'face', value: 10 } },
  { slug: 'skin-guru', name: 'Skin Guru', description: 'Completed 100 skincare steps', xp: 300, rarity: 'rare', condition: { type: 'steps_category', category: 'face', value: 100 } },
  { slug: 'beard-baron', name: 'Beard Baron', description: 'Completed 50 beard care steps', xp: 200, rarity: 'rare', condition: { type: 'steps_category', category: 'beard', value: 50 } },
  { slug: 'hair-hero', name: 'Hair Hero', description: 'Completed 50 hair care steps', xp: 200, rarity: 'rare', condition: { type: 'steps_category', category: 'hair', value: 50 } },
  { slug: 'full-package', name: 'Full Package', description: 'Completed steps in all 4 categories', xp: 250, rarity: 'epic', condition: { type: 'all_categories' } },

  // Feature Badges
  { slug: 'barber-ready', name: 'Barber Ready', description: 'Generated your first barber card', xp: 100, rarity: 'common', condition: { type: 'barber_card', value: 1 } },
  { slug: 'style-hunter', name: 'Style Hunter', description: 'Saved 5 hairstyles', xp: 75, rarity: 'common', condition: { type: 'saved_styles', value: 5 } },
  { slug: 'ar-explorer', name: 'AR Explorer', description: 'Tried on 3 hairstyles in AR', xp: 150, rarity: 'rare', condition: { type: 'ar_tryon', value: 3 } },
  { slug: 'skin-scanner', name: 'Skin Scanner', description: 'Completed first AI skin analysis', xp: 100, rarity: 'common', condition: { type: 'skin_analysis', value: 1 } },
  { slug: 'ingredient-inspector', name: 'Ingredient Inspector', description: 'Scanned 5 products', xp: 100, rarity: 'rare', condition: { type: 'product_scans', value: 5 } },
  { slug: 'hair-tracker', name: 'Hair Tracker', description: 'Logged 3 months of hair photos', xp: 300, rarity: 'epic', condition: { type: 'hair_loss_logs', value: 3 } },

  // Milestone Badges
  { slug: 'blueprint', name: 'The Blueprint', description: 'Reached Level 10', xp: 2000, rarity: 'legendary', condition: { type: 'level', value: 10 } },
  { slug: 'early-adopter', name: 'Early Adopter', description: 'Joined in the first 1000 users', xp: 500, rarity: 'legendary', condition: { type: 'user_rank', value: 1000 } },
]
```

---

## Badge Unlock Animation

When a badge is earned, trigger a full-screen celebration:

```tsx
// app/badge-unlock.tsx
import LottieView from 'lottie-react-native'
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

export default function BadgeUnlock() {
  const { badge } = useLocalSearchParams()
  
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [])

  return (
    <View style={styles.overlay}>
      {/* Confetti Lottie behind everything */}
      <LottieView
        source={require('@/assets/animations/confetti.json')}
        autoPlay loop={false}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View entering={ZoomIn.springify().damping(10)} style={styles.card}>
        <Text style={styles.label}>BADGE UNLOCKED</Text>
        
        {/* Badge icon with glow effect */}
        <View style={styles.badgeGlow}>
          <LottieView
            source={{ uri: badge.lottieUrl }}
            autoPlay loop={false}
            style={styles.badgeAnimation}
          />
        </View>

        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
        <Text style={styles.xpReward}>+{badge.xpReward} XP</Text>
        
        <RarityPill rarity={badge.rarity} />

        <Button onPress={() => router.back()} label="Awesome!" style={styles.cta} />
      </Animated.View>
    </View>
  )
}
```

---

## Streak Logic

```typescript
// utils/streaks.ts
export async function updateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) return

  let newStreak = streak.current_streak

  if (streak.last_active_date === today) {
    return // Already updated today
  } else if (streak.last_active_date === yesterday) {
    newStreak = streak.current_streak + 1 // Consecutive day
  } else {
    newStreak = 1 // Streak broken, restart
  }

  const longestStreak = Math.max(newStreak, streak.longest_streak)

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_active_date: today,
      total_days_completed: streak.total_days_completed + 1,
    })
    .eq('user_id', userId)

  // Update profile for quick access
  await supabase
    .from('profiles')
    .update({ current_streak: newStreak, longest_streak: longestStreak })
    .eq('id', userId)

  // Check streak milestones
  const milestones = [7, 14, 30, 60, 100]
  if (milestones.includes(newStreak)) {
    await checkAndAwardBadge(userId, `streak_${newStreak}`)
  }
}
```

---

## Streak Warning Notification

Send at 8PM if user hasn't checked in that day:

```typescript
// utils/notifications.ts
import * as Notifications from 'expo-notifications'

export async function scheduleStreakWarning(streakCount: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ Don't lose your ${streakCount}-day streak!`,
      body: "You haven't completed today's routine yet. 2 minutes is all it takes.",
      sound: true,
      data: { screen: 'routines' }
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: false
    }
  })
}

// Morning motivation
export async function scheduleMorningReminder(time: string) {
  const [hour, minute] = time.split(':').map(Number)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Good morning 🌅",
      body: "Start your day right. Your morning routine is waiting.",
      data: { screen: 'routines' }
    },
    trigger: { hour, minute, repeats: true }
  })
}
```

---

## Tracker Tab Screen (`app/(tabs)/tracker.tsx`)

```
Header: "Your Progress"

[Streak Section]
  🔥 12-Day Streak
  ████████████░░░░░░░░░░ 12/30 to next milestone
  "Keep going — 18 days to Month Master badge"

[XP + Level]
  Level 4 — Consistent
  ████████████░░░░░░░░░░ 480/500 XP to Level 5
  "Only 20 XP away from leveling up!"

[Weekly Activity Grid]
  S  M  T  W  T  F  S
  ✓  ✓  ✓  ✓  ✓  ✓  ○   ← GitHub-style contribution grid, last 12 weeks

[Badges]
  [Earned: 4]                      [Locked: 16]
  [Day One]  [Week Warrior]  [Barber Ready]  [Skin Starter]
  [?]  [?]  [?]  ... (show locked badges greyed out with progress %)
  "Week Warrior: 5/7 days complete"
```

---

## Home Screen XP Toast (Micro-reward)

Every time a step is checked off, show a floating toast:

```tsx
// components/ui/XPToast.tsx
import Animated, {
  useAnimatedStyle, useSharedValue,
  withDelay, withSequence, withSpring, withTiming
} from 'react-native-reanimated'

export function XPToast({ amount }: { amount: number }) {
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(1)

  useEffect(() => {
    translateY.value = withSequence(
      withSpring(-40, { damping: 8 }),
      withDelay(800, withTiming(-80, { duration: 400 }))
    )
    opacity.value = withDelay(900, withTiming(0, { duration: 300 }))
  }, [])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }))

  return (
    <Animated.View style={[styles.toast, style]}>
      <Text style={styles.text}>+{amount} XP ⚡</Text>
    </Animated.View>
  )
}
```
