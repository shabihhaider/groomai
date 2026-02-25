// constants/defaultRoutines.ts
// Default routines seeded for new users based on their skin type from onboarding.
// Each skin type gets a morning and night routine with 3 steps each.

export interface DefaultStep {
    title: string
    description: string
    duration_seconds: number
    category: 'face' | 'hair' | 'beard' | 'body' | 'other'
}

export const DEFAULT_ROUTINES: Record<string, { morning: DefaultStep[]; night: DefaultStep[] }> = {
    oily: {
        morning: [
            { title: 'Foaming Cleanser', description: 'Wash face with a gel/foaming cleanser', duration_seconds: 60, category: 'face' },
            { title: 'Toner', description: 'Apply alcohol-free toner to balance skin', duration_seconds: 30, category: 'face' },
            { title: 'Light Moisturizer', description: 'Use oil-free, non-comedogenic moisturizer', duration_seconds: 30, category: 'face' },
        ],
        night: [
            { title: 'Double Cleanse', description: 'Oil cleanser first, then foaming cleanser', duration_seconds: 120, category: 'face' },
            { title: 'Salicylic Acid', description: 'Apply BHA to target excess oil and pores', duration_seconds: 30, category: 'face' },
            { title: 'Lightweight Night Cream', description: 'Hydrate without clogging pores', duration_seconds: 30, category: 'face' },
        ],
    },
    dry: {
        morning: [
            { title: 'Gentle Cream Cleanser', description: 'Never strip moisture from skin', duration_seconds: 60, category: 'face' },
            { title: 'Hyaluronic Acid Serum', description: 'Apply to damp skin for maximum hydration', duration_seconds: 30, category: 'face' },
            { title: 'Rich Moisturizer + SPF', description: 'Lock in hydration + sun protection', duration_seconds: 45, category: 'face' },
        ],
        night: [
            { title: 'Cream Cleanser', description: 'Gentle cleanse, preserve natural oils', duration_seconds: 60, category: 'face' },
            { title: 'Retinol (2-3x/week)', description: 'Anti-aging, use every other night to start', duration_seconds: 30, category: 'face' },
            { title: 'Heavy Night Cream', description: 'Barrier repair while you sleep', duration_seconds: 30, category: 'face' },
        ],
    },
    combination: {
        morning: [
            { title: 'Gentle Gel Cleanser', description: 'Cleanse without over-stripping dry areas', duration_seconds: 60, category: 'face' },
            { title: 'Niacinamide Serum', description: 'Balance oil production and hydrate', duration_seconds: 30, category: 'face' },
            { title: 'Lightweight Moisturizer + SPF', description: 'Hydrate all zones evenly', duration_seconds: 40, category: 'face' },
        ],
        night: [
            { title: 'Micellar Water', description: 'Remove dirt and makeup gently', duration_seconds: 60, category: 'face' },
            { title: 'AHA/BHA Exfoliant (2x/week)', description: 'Target T-zone oiliness and dry patches', duration_seconds: 30, category: 'face' },
            { title: 'Night Moisturizer', description: 'Medium-weight cream for overnight repair', duration_seconds: 30, category: 'face' },
        ],
    },
    sensitive: {
        morning: [
            { title: 'Fragrance-Free Cleanser', description: 'Ultra-gentle wash, no irritants', duration_seconds: 60, category: 'face' },
            { title: 'Centella Serum', description: 'Soothe and calm sensitive skin', duration_seconds: 30, category: 'face' },
            { title: 'Mineral Sunscreen', description: 'Physical SPF, no chemical filters', duration_seconds: 40, category: 'face' },
        ],
        night: [
            { title: 'Micellar Cleanse', description: 'No-rinse gentle cleansing', duration_seconds: 45, category: 'face' },
            { title: 'Ceramide Serum', description: 'Rebuild skin barrier overnight', duration_seconds: 30, category: 'face' },
            { title: 'Calming Night Balm', description: 'Rich barrier cream for repair', duration_seconds: 30, category: 'face' },
        ],
    },
    normal: {
        morning: [
            { title: 'Daily Cleanser', description: 'Standard face wash to start the day fresh', duration_seconds: 60, category: 'face' },
            { title: 'Vitamin C Serum', description: 'Brighten and protect from free radicals', duration_seconds: 30, category: 'face' },
            { title: 'Moisturizer + SPF', description: 'Hydrate and protect from UV damage', duration_seconds: 40, category: 'face' },
        ],
        night: [
            { title: 'Evening Cleanser', description: 'Remove the day\'s buildup', duration_seconds: 60, category: 'face' },
            { title: 'Retinol (3x/week)', description: 'Anti-aging and cell turnover', duration_seconds: 30, category: 'face' },
            { title: 'Night Cream', description: 'Replenish moisture while you sleep', duration_seconds: 30, category: 'face' },
        ],
    },
    acne_prone: {
        morning: [
            { title: 'Salicylic Acid Cleanser', description: 'BHA cleanser to clear pores and reduce breakouts', duration_seconds: 60, category: 'face' },
            { title: 'Niacinamide Serum', description: 'Reduce inflammation and control sebum', duration_seconds: 30, category: 'face' },
            { title: 'Oil-Free Moisturizer + SPF', description: 'Lightweight, non-comedogenic hydration', duration_seconds: 40, category: 'face' },
        ],
        night: [
            { title: 'Gentle Foaming Cleanser', description: 'Remove impurities without irritation', duration_seconds: 60, category: 'face' },
            { title: 'Benzoyl Peroxide (spot treat)', description: 'Target active breakouts only', duration_seconds: 30, category: 'face' },
            { title: 'Lightweight Night Gel', description: 'Oil-free overnight hydration', duration_seconds: 30, category: 'face' },
        ],
    },
}
