import { supabase } from '@/lib/supabase'
import { DEFAULT_ROUTINES, type DefaultStep, ROUTINE_TEMPLATES, type RoutineTemplate } from '@/constants/defaultRoutines'

export const routineService = {
    async getRoutines(userId: string) {
        const { data, error } = await supabase
            .from('routines')
            .select('*, routine_steps(id, step_order, title, description, category, duration_seconds)')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('type', { ascending: true })

        if (error) throw error
        return data ?? []
    },

    async getRoutineSteps(routineId: string) {
        const { data, error } = await supabase
            .from('routine_steps')
            .select('*')
            .eq('routine_id', routineId)
            .order('step_order', { ascending: true })

        if (error) throw error
        return data ?? []
    },

    async seedDefaultRoutines(userId: string, skinType: string) {
        const routineData = DEFAULT_ROUTINES[skinType] ?? DEFAULT_ROUTINES['normal']

        // Create morning + night routines in parallel
        const [morningResult, nightResult] = await Promise.all([
            supabase
                .from('routines')
                .insert({ user_id: userId, name: 'Morning Routine', type: 'morning' })
                .select()
                .single(),
            supabase
                .from('routines')
                .insert({ user_id: userId, name: 'Night Routine', type: 'night' })
                .select()
                .single(),
        ])

        if (morningResult.error) throw morningResult.error
        if (nightResult.error) throw nightResult.error

        const morningRoutine = morningResult.data
        const nightRoutine = nightResult.data

        // Build step rows for both routines
        const morningSteps = routineData.morning.map((step: DefaultStep, index: number) => ({
            routine_id: morningRoutine.id,
            step_order: index + 1,
            title: step.title,
            description: step.description,
            category: step.category,
            duration_seconds: step.duration_seconds,
        }))

        const nightSteps = routineData.night.map((step: DefaultStep, index: number) => ({
            routine_id: nightRoutine.id,
            step_order: index + 1,
            title: step.title,
            description: step.description,
            category: step.category,
            duration_seconds: step.duration_seconds,
        }))

        // Insert all steps in parallel
        const [morningStepsResult, nightStepsResult] = await Promise.all([
            supabase.from('routine_steps').insert(morningSteps),
            supabase.from('routine_steps').insert(nightSteps),
        ])

        if (morningStepsResult.error) throw morningStepsResult.error
        if (nightStepsResult.error) throw nightStepsResult.error

        return { morning: morningRoutine, night: nightRoutine }
    },

    async createRoutine(userId: string, data: { name: string; type: 'morning' | 'night' | 'custom' }) {
        const { data: routine, error } = await supabase
            .from('routines')
            .insert({ user_id: userId, ...data })
            .select()
            .single()

        if (error) throw error
        return routine
    },

    async addStep(routineId: string, stepData: {
        title: string
        description?: string
        category?: string
        duration_seconds?: number
        step_order: number
    }) {
        const { data, error } = await supabase
            .from('routine_steps')
            .insert({ routine_id: routineId, ...stepData })
            .select()
            .single()

        if (error) throw error
        return data
    },

    async deleteRoutine(routineId: string) {
        const { error } = await supabase
            .from('routines')
            .delete()
            .eq('id', routineId)

        if (error) throw error
    },

    /**
     * Activate a routine template — creates a custom routine with all template steps.
     */
    async activateTemplate(userId: string, template: RoutineTemplate) {
        // Create the routine
        const { data: routine, error: routineErr } = await supabase
            .from('routines')
            .insert({
                user_id: userId,
                name: `${template.emoji} ${template.name}`,
                type: 'custom',
            })
            .select()
            .single()

        if (routineErr) throw routineErr

        // Insert all steps
        const stepRows = template.steps.map((step, index) => ({
            routine_id: routine.id,
            step_order: index + 1,
            title: step.title,
            description: step.description,
            category: step.category,
            duration_seconds: step.duration_seconds,
        }))

        const { error: stepsErr } = await supabase
            .from('routine_steps')
            .insert(stepRows)

        if (stepsErr) throw stepsErr

        return routine
    },
}
