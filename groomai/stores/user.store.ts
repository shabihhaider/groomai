import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// ── Onboarding temp state (accumulated across steps) ──
// Written to Supabase incrementally at each step (not just step 6)
interface OnboardingData {
    fullName: string
    faceShape: string
    faceShapeMethod: 'selfie' | 'quiz'
    skinType: string
    skinConcerns: string[]
    hairType: string
    hairThickness: string
    hairConcerns: string[]
    hasBeard: boolean
    groomingGoals: string[]
    dailyTimeAvailable: string
    budgetRange: string
}

const EMPTY_ONBOARDING: OnboardingData = {
    fullName: '',
    faceShape: '',
    faceShapeMethod: 'quiz',
    skinType: '',
    skinConcerns: [],
    hairType: '',
    hairThickness: '',
    hairConcerns: [],
    hasBeard: false,
    groomingGoals: [],
    dailyTimeAvailable: '',
    budgetRange: '',
}

// ── Profile (mirrors DB row) ──
interface UserProfile {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    face_shape: string | null
    skin_type: string | null
    skin_tone: string | null
    skin_concerns: string[] | null
    hair_type: string | null
    hair_thickness: string | null
    hair_concerns: string[] | null
    has_beard: boolean
    beard_style: string | null
    grooming_goals: string[] | null
    daily_time_available: string | null
    budget_range: string | null
    subscription_status: string
    trial_ends_at: string | null
    total_xp: number
    level: number
    current_streak: number
    longest_streak: number
    onboarding_completed: boolean
    onboarding_step: number
}

interface UserStore {
    // Auth
    session: Session | null
    setSession: (session: Session | null) => void

    // Profile
    profile: UserProfile | null
    isLoading: boolean
    setProfile: (profile: UserProfile | null) => void
    updateProfile: (updates: Partial<UserProfile>) => void
    setLoading: (loading: boolean) => void

    // Onboarding
    onboarding: OnboardingData
    updateOnboarding: (updates: Partial<OnboardingData>) => void

    // Per-step Supabase saves (each step calls its own method)
    saveStep1: () => Promise<void>       // full_name
    saveStep2: () => Promise<void>       // face_shape
    saveStep3: () => Promise<void>       // skin_type, skin_concerns
    saveStep4: () => Promise<void>       // hair_type, hair_thickness, hair_concerns, has_beard
    saveStep5: () => Promise<void>       // grooming_goals, daily_time_available, budget_range
    completeOnboarding: () => Promise<void> // sets onboarding_completed=true (step 6 only)

    // Reset
    reset: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
    // ── Auth ──
    session: null,
    setSession: (session) => set({ session }),

    // ── Profile ──
    profile: null,
    isLoading: true,
    setProfile: (profile) => set({ profile, isLoading: false }),
    updateProfile: (updates) =>
        set((state) => ({
            profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
    setLoading: (isLoading) => set({ isLoading }),

    // ── Onboarding ──
    onboarding: { ...EMPTY_ONBOARDING },

    updateOnboarding: (updates) =>
        set((state) => ({
            onboarding: { ...state.onboarding, ...updates },
        })),

    // ── Save Step 1: Basic Info (full_name) ──
    saveStep1: async () => {
        const { session, onboarding } = get()
        if (!session?.user?.id) throw new Error('No authenticated user')
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: onboarding.fullName, onboarding_step: 1 })
            .eq('id', session.user.id)
        if (error) throw error
    },

    // ── Save Step 2: Face Shape ──
    saveStep2: async () => {
        const { session, onboarding } = get()
        if (!session?.user?.id) throw new Error('No authenticated user')
        const { error } = await supabase
            .from('profiles')
            .update({ face_shape: onboarding.faceShape || null, onboarding_step: 2 })
            .eq('id', session.user.id)
        if (error) throw error
    },

    // ── Save Step 3: Skin Type & Concerns ──
    saveStep3: async () => {
        const { session, onboarding } = get()
        if (!session?.user?.id) throw new Error('No authenticated user')
        const { error } = await supabase
            .from('profiles')
            .update({
                skin_type: onboarding.skinType || null,
                skin_concerns: onboarding.skinConcerns.length > 0 ? onboarding.skinConcerns : null,
                onboarding_step: 3,
            })
            .eq('id', session.user.id)
        if (error) throw error
    },

    // ── Save Step 4: Hair Profile ──
    saveStep4: async () => {
        const { session, onboarding } = get()
        if (!session?.user?.id) throw new Error('No authenticated user')
        const { error } = await supabase
            .from('profiles')
            .update({
                hair_type: onboarding.hairType || null,
                hair_thickness: onboarding.hairThickness || null,
                hair_concerns: onboarding.hairConcerns.length > 0 ? onboarding.hairConcerns : null,
                has_beard: onboarding.hasBeard,
                onboarding_step: 4,
            })
            .eq('id', session.user.id)
        if (error) throw error
    },

    // ── Save Step 5: Goals, Time & Budget ──
    saveStep5: async () => {
        const { session, onboarding } = get()
        if (!session?.user?.id) throw new Error('No authenticated user')
        const { error } = await supabase
            .from('profiles')
            .update({
                grooming_goals: onboarding.groomingGoals.length > 0 ? onboarding.groomingGoals : null,
                daily_time_available: onboarding.dailyTimeAvailable || null,
                budget_range: onboarding.budgetRange || null,
                onboarding_step: 5,
            })
            .eq('id', session.user.id)
        if (error) throw error
    },

    // ── Complete Onboarding (Step 6 — only sets completion flag) ──
    // Per docs (04-onboarding.md): "only updates onboarding_completed: true, onboarding_step: 6"
    // The trial was already set by the DB trigger on signup.
    // All profile data was saved at each preceding step.
    completeOnboarding: async () => {
        const { session } = get()
        if (!session?.user?.id) throw new Error('No authenticated user')
        const { error } = await supabase
            .from('profiles')
            .update({ onboarding_completed: true, onboarding_step: 6 })
            .eq('id', session.user.id)
        if (error) throw error

        // Award onboarding XP (non-critical — don't fail onboarding if XP call fails)
        try {
            await supabase.rpc('increment_xp', { user_id: session.user.id, amount: 150 })
        } catch (xpErr) {
            console.warn('Failed to award onboarding XP:', xpErr)
        }
    },

    // ── Reset ──
    reset: () =>
        set({
            session: null,
            profile: null,
            isLoading: false,
            onboarding: { ...EMPTY_ONBOARDING },
        }),
}))
