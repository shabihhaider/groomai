# API Services Layer

## Overview
All data fetching goes through a service layer — never call Supabase directly from components. This keeps code clean, testable, and easy to maintain. Services are plain TypeScript functions called from React Query hooks.

---

## React Query Setup (`lib/queryClient.ts`)

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes — data considered fresh
      gcTime: 1000 * 60 * 30,     // 30 minutes — keep in memory
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    }
  }
})
```

Wrap app in `QueryClientProvider` in `app/_layout.tsx`.

---

## Auth Service (`services/auth.service.ts`)

```typescript
import { supabase } from '@/lib/supabase'

export const authService = {
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}
```

---

## Profile Service (`services/profile.service.ts`)

```typescript
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async completeOnboarding(userId: string, profileData: ProfileUpdate) {
    return this.updateProfile(userId, {
      ...profileData,
      onboarding_completed: true,
      onboarding_step: 6
    })
  },

  async uploadAvatar(userId: string, imageUri: string) {
    const response = await fetch(imageUri)
    const blob = await response.blob()
    const fileName = `${userId}/avatar.jpg`

    const { error: uploadError } = await supabase.storage
      .from('profile-avatars')
      .upload(fileName, blob, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) throw uploadError

    const avatarUrl = supabase.storage
      .from('profile-avatars')
      .getPublicUrl(fileName).data.publicUrl

    return this.updateProfile(userId, { avatar_url: avatarUrl })
  }
}
```

---

## Routine Service (`services/routine.service.ts`)

```typescript
import { supabase } from '@/lib/supabase'

export const routineService = {
  async getUserRoutines(userId: string) {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        *,
        routine_steps (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at')

    if (error) throw error
    return data
  },

  async createRoutine(userId: string, routine: { name: string; type: string }) {
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: userId, ...routine })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async addStep(routineId: string, step: {
    title: string
    description?: string
    category: string
    step_order: number
    duration_seconds?: number
  }) {
    const { data, error } = await supabase
      .from('routine_steps')
      .insert({ routine_id: routineId, ...step })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async seedDefaultRoutines(userId: string, skinType: string) {
    // NOTE: `@/constants/defaultRoutines` must be created manually.
    // Structure expected:
    // export default {
    //   oily: { morning: [RoutineStep[], ...], night: [RoutineStep[], ...] },
    //   dry: { morning: [...], night: [...] },
    //   combination: { morning: [...], night: [...] },
    //   normal: { morning: [...], night: [...] },   // fallback
    //   sensitive: { morning: [...], night: [...] },
    // }
    // Each step: { title, description, category, duration_seconds, product_affiliate_url? }
    const { default: defaults } = await import('@/constants/defaultRoutines')
    const routine = defaults[skinType as keyof typeof defaults] || defaults.normal

    // Create morning and night routines in parallel, then batch-insert steps
    const [morning, night] = await Promise.all([
      this.createRoutine(userId, { name: 'Morning Routine', type: 'morning' }),
      this.createRoutine(userId, { name: 'Night Routine', type: 'night' }),
    ])

    // Batch insert steps (one DB call per routine, not N calls)
    const morningSteps = routine.morning.map((s: any, i: number) => ({ ...s, routine_id: morning.id, step_order: i + 1 }))
    const nightSteps = routine.night.map((s: any, i: number) => ({ ...s, routine_id: night.id, step_order: i + 1 }))

    await Promise.all([
      supabase.from('routine_steps').insert(morningSteps),
      supabase.from('routine_steps').insert(nightSteps),
    ])
  },

  async generateAIRoutine(userId: string, profile: any) {
    const { data, error } = await supabase.functions.invoke('generate-routine', {
      body: { profile }
    })
    if (error) throw error
    return data
  }
}
```

---

## Habit Service (`services/habit.service.ts`)

```typescript
import { supabase } from '@/lib/supabase'
import { badgeService } from './badge.service'

export const habitService = {
  async getTodayLogs(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('logged_date', today)

    if (error) throw error
    return data
  },

  async completeStep(userId: string, stepId: string) {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('habit_logs')
      .upsert({
        user_id: userId,
        routine_step_id: stepId,
        logged_date: today,
        completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,routine_step_id,logged_date' })
      .select()
      .single()

    if (error) throw error

    // Side effects (run in background)
    Promise.all([
      this.awardXP(userId, 10),
      this.updateStreak(userId),
      badgeService.checkAndAward(userId)
    ])

    return data
  },

  async uncompleteStep(userId: string, stepId: string) {
    const today = new Date().toISOString().split('T')[0]
    const { error } = await supabase
      .from('habit_logs')
      .update({ completed: false, completed_at: null })
      .eq('user_id', userId)
      .eq('routine_step_id', stepId)
      .eq('logged_date', today)

    if (error) throw error
    // Deduct XP but guard against going below 0.
    // The increment_xp SQL function must use: SET total_xp = GREATEST(0, total_xp + amount)
    // so negative amounts cannot make total_xp go below zero.
    await this.awardXP(userId, -10)
  },

  async awardXP(userId: string, amount: number) {
    await supabase.rpc('increment_xp', { user_id: userId, amount })
  },

  async updateStreak(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!streak || streak.last_active_date === today) return

    const newStreak = streak.last_active_date === yesterday
      ? streak.current_streak + 1
      : 1

    await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_active_date: today,
        total_days_completed: streak.total_days_completed + 1
      })
      .eq('user_id', userId)
  },

  async getStreak(userId: string) {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  },

  async getWeeklyActivity(userId: string) {
    const twelveWeeksAgo = new Date(Date.now() - 84 * 86400000).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('habit_logs')
      .select('logged_date')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('logged_date', twelveWeeksAgo)

    if (error) throw error

    // Group by date
    const activeDates = new Set(data.map(l => l.logged_date))
    return activeDates
  }
}
```

---

## Badge Service (`services/badge.service.ts`)

```typescript
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'

export const badgeService = {
  async getAllBadges() {
    const { data, error } = await supabase.from('badges').select('*').order('rarity')
    if (error) throw error
    return data
  },

  async getUserBadges(userId: string) {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    if (error) throw error
    return data
  },

  async checkAndAward(userId: string) {
    // Fetch user stats
    const [streak, profile, logs] = await Promise.all([
      supabase.from('streaks').select('*').eq('user_id', userId).single(),
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('habit_logs').select('routine_step_id, routine_steps(category)').eq('user_id', userId).eq('completed', true)
    ])

    const stats = {
      streak: streak.data?.current_streak || 0,
      totalCheckins: logs.data?.length || 0,
      level: profile.data?.level || 1,
    }

    const allBadges = await this.getAllBadges()
    const earnedBadges = await this.getUserBadges(userId)
    const earnedSlugs = new Set(earnedBadges.map(b => b.badge.slug))

    for (const badge of allBadges) {
      if (earnedSlugs.has(badge.slug)) continue

      const condition = badge.unlock_condition as { type: string; value: number }
      let earned = false

      if (condition.type === 'streak' && stats.streak >= condition.value) earned = true
      if (condition.type === 'checkin_count' && stats.totalCheckins >= condition.value) earned = true
      if (condition.type === 'level' && stats.level >= condition.value) earned = true

      if (earned) {
        await this.awardBadge(userId, badge.id)
        // NOTE: Do NOT call router.push() here. Services must not know about navigation.
        // Return the earned badge to the caller (hook) and let the component trigger navigation.
        return badge  // Caller checks this return value and triggers /badge-unlock
        // break is implicit — returning exits the loop
      }
    }
    return null  // No new badge earned
  },

  async awardBadge(userId: string, badgeId: string) {
    await supabase.from('user_badges').insert({ user_id: userId, badge_id: badgeId })
    // Also award XP
    const { data: badge } = await supabase.from('badges').select('xp_reward').eq('id', badgeId).single()
    if (badge?.xp_reward) {
      await supabase.rpc('increment_xp', { user_id: userId, amount: badge.xp_reward })
    }
  }
}
```

---

## React Query Hooks (`hooks/`)

```typescript
// hooks/useRoutines.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { routineService } from '@/services/routine.service'
import { useUserStore } from '@/stores/user.store'

export function useRoutines() {
  const { user } = useUserStore()

  return useQuery({
    queryKey: ['routines', user?.id],
    queryFn: () => routineService.getUserRoutines(user!.id),
    enabled: !!user?.id
  })
}

// hooks/useCompleteStep.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { habitService } from '@/services/habit.service'
import { badgeService } from '@/services/badge.service'
import { useUserStore } from '@/stores/user.store'
import { router } from 'expo-router'

export function useCompleteStep() {
  const qc = useQueryClient()
  const { user } = useUserStore()

  return useMutation({
    mutationFn: (stepId: string) => habitService.completeStep(user!.id, stepId),
    onSuccess: async () => {
      // Invalidate related queries so UI updates
      qc.invalidateQueries({ queryKey: ['habit-logs'] })
      qc.invalidateQueries({ queryKey: ['streak'] })
      // Check for badge unlock — service returns earned badge or null
      const earnedBadge = await badgeService.checkAndAward(user!.id)
      if (earnedBadge) {
        router.push({ pathname: '/badge-unlock', params: { badgeId: earnedBadge.id } })
      }
    }
  })
}

// hooks/useStreak.ts
export function useStreak() {
  const { user } = useUserStore()

  return useQuery({
    queryKey: ['streak', user?.id],
    queryFn: () => habitService.getStreak(user!.id),
    enabled: !!user?.id,
    refetchInterval: 60000  // Refetch every minute while app is open
  })
}
```

---

## Error Handling Pattern

```typescript
// utils/handleError.ts
import { Toast } from '@/components/ui/Toast'

export function handleServiceError(error: unknown, context: string) {
  const message = error instanceof Error ? error.message : 'Something went wrong'
  console.error(`[${context}]`, error)
  Toast.show({ type: 'error', text: message })
}

// Usage:
try {
  await routineService.createRoutine(...)
} catch (error) {
  handleServiceError(error, 'createRoutine')
}
```
