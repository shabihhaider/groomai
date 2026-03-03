// constants/defaultRoutines.ts
// Default routines seeded for new users based on their skin type from onboarding.
// Each skin type gets a morning and night routine with face + hair steps.
// Beard steps are added conditionally based on user profile.

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
            { title: 'Style Hair', description: 'Apply product and style — matte clay for texture or pomade for hold', duration_seconds: 90, category: 'hair' },
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
            { title: 'Style Hair', description: 'Use a hydrating cream or oil to tame dryness while styling', duration_seconds: 90, category: 'hair' },
        ],
        night: [
            { title: 'Cream Cleanser', description: 'Gentle cleanse, preserve natural oils', duration_seconds: 60, category: 'face' },
            { title: 'Retinol (2-3x/week)', description: 'Anti-aging, use every other night to start', duration_seconds: 30, category: 'face' },
            { title: 'Heavy Night Cream', description: 'Barrier repair while you sleep', duration_seconds: 30, category: 'face' },
            { title: 'Hair Oil Treatment', description: 'Apply argan or jojoba oil to ends to prevent dryness and breakage', duration_seconds: 30, category: 'hair' },
        ],
    },
    combination: {
        morning: [
            { title: 'Gentle Gel Cleanser', description: 'Cleanse without over-stripping dry areas', duration_seconds: 60, category: 'face' },
            { title: 'Niacinamide Serum', description: 'Balance oil production and hydrate', duration_seconds: 30, category: 'face' },
            { title: 'Lightweight Moisturizer + SPF', description: 'Hydrate all zones evenly', duration_seconds: 40, category: 'face' },
            { title: 'Style Hair', description: 'Apply product and style — choose based on your hair type', duration_seconds: 90, category: 'hair' },
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
            { title: 'Style Hair', description: 'Use a fragrance-free, gentle styling product', duration_seconds: 90, category: 'hair' },
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
            { title: 'Style Hair', description: 'Apply your preferred styling product and shape your look', duration_seconds: 90, category: 'hair' },
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
            { title: 'Style Hair', description: 'Keep products away from hairline to avoid breakouts — use gel or light wax', duration_seconds: 90, category: 'hair' },
        ],
        night: [
            { title: 'Gentle Foaming Cleanser', description: 'Remove impurities without irritation', duration_seconds: 60, category: 'face' },
            { title: 'Benzoyl Peroxide (spot treat)', description: 'Target active breakouts only', duration_seconds: 30, category: 'face' },
            { title: 'Lightweight Night Gel', description: 'Oil-free overnight hydration', duration_seconds: 30, category: 'face' },
        ],
    },
}

// Beard steps — added conditionally when user has_beard is true
export const BEARD_STEPS: { morning: DefaultStep[]; night: DefaultStep[] } = {
    morning: [
        { title: 'Beard Oil', description: 'Apply 3-5 drops of beard oil and work through with fingers', duration_seconds: 45, category: 'beard' },
        { title: 'Brush & Shape Beard', description: 'Use a boar-bristle brush to train and shape your beard', duration_seconds: 30, category: 'beard' },
    ],
    night: [
        { title: 'Beard Wash', description: 'Use a gentle beard-specific shampoo (2-3x/week, rinse only on other days)', duration_seconds: 60, category: 'beard' },
        { title: 'Beard Balm', description: 'Apply beard balm to lock in moisture and tame overnight', duration_seconds: 30, category: 'beard' },
    ],
}

// ── Routine Templates ──────────────────────────────────────────────────────
// Goal-based templates users can browse and activate with one tap.
// These give users more variety beyond skin-type defaults.

export interface RoutineTemplate {
    id: string
    name: string
    emoji: string
    description: string
    tagline: string
    steps: DefaultStep[]
    isPremium: boolean
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
    {
        id: 'pre-date-prep',
        name: 'Pre-Date Prep',
        emoji: '💅',
        description: 'Look and smell your absolute best for a special occasion.',
        tagline: 'First impressions matter',
        isPremium: false,
        steps: [
            { title: 'Hot Shower Steam', description: 'Start with a hot shower — steam opens pores and softens beard hair', duration_seconds: 300, category: 'body' },
            { title: 'Exfoliating Scrub', description: 'Gently exfoliate face to remove dead skin and brighten complexion', duration_seconds: 60, category: 'face' },
            { title: 'Moisturize & Prime', description: 'Apply a hydrating moisturizer — let it absorb before applying anything else', duration_seconds: 45, category: 'face' },
            { title: 'Cologne Application', description: 'Apply 2-3 sprays on pulse points: wrists, neck, behind ears', duration_seconds: 30, category: 'body' },
            { title: 'Style Hair Carefully', description: 'Take your time. Use product that gives hold without looking crunchy', duration_seconds: 120, category: 'hair' },
            { title: 'Final Mirror Check', description: 'Check nose hairs, eyebrows, teeth, and collar. You got this.', duration_seconds: 60, category: 'other' },
        ],
    },
    {
        id: 'gym-day-recovery',
        name: 'Gym Day Recovery',
        emoji: '💪',
        description: 'Post-workout skin & hair care to prevent breakouts and damage.',
        tagline: 'Sweat now, glow later',
        isPremium: false,
        steps: [
            { title: 'Rinse Face Immediately', description: 'Splash cold water on face within 10 min of finishing your workout', duration_seconds: 30, category: 'face' },
            { title: 'Gentle Cleanser', description: 'Use a mild cleanser to remove sweat, oil, and bacteria buildup', duration_seconds: 60, category: 'face' },
            { title: 'Rinse Hair (No Shampoo)', description: 'Just water-rinse hair — daily shampoo strips natural oils', duration_seconds: 60, category: 'hair' },
            { title: 'Lightweight Moisturizer', description: 'Rehydrate skin with an oil-free moisturizer post-cleanse', duration_seconds: 30, category: 'face' },
            { title: 'Deodorant Refresh', description: 'Reapply deodorant on clean skin after showering', duration_seconds: 15, category: 'body' },
        ],
    },
    {
        id: 'weekly-deep-clean',
        name: 'Weekly Deep Clean',
        emoji: '🧼',
        description: 'Sunday reset ritual for a fresh start to the week.',
        tagline: 'Restart every Sunday',
        isPremium: false,
        steps: [
            { title: 'Clarifying Shampoo', description: 'Use a deep-cleansing shampoo to remove weekly product buildup', duration_seconds: 120, category: 'hair' },
            { title: 'Hair Mask / Deep Conditioner', description: 'Leave on for 5 minutes while you do other steps', duration_seconds: 300, category: 'hair' },
            { title: 'Face Mask', description: 'Clay mask for oily areas, hydrating mask for dry zones', duration_seconds: 600, category: 'face' },
            { title: 'Exfoliate Body', description: 'Use a loofah or body scrub on rough areas: elbows, knees, feet', duration_seconds: 120, category: 'body' },
            { title: 'Trim Nails', description: 'Trim and file fingernails and toenails', duration_seconds: 180, category: 'other' },
            { title: 'Beard Trim & Shape', description: 'Clean up neckline and cheek line. Even if you don\'t have a beard, check for stray hairs', duration_seconds: 180, category: 'beard' },
            { title: 'Full Moisturize', description: 'Moisturize face and body — lock in all the work you just did', duration_seconds: 60, category: 'body' },
        ],
    },
    {
        id: 'interview-ready',
        name: 'Interview Ready',
        emoji: '👔',
        description: 'Clean, professional, and confident. Nail that first impression.',
        tagline: 'Confidence starts with grooming',
        isPremium: true,
        steps: [
            { title: 'Clean Shave or Trim', description: 'Shave clean or sharpen your beard edges — no stubble in between', duration_seconds: 300, category: 'beard' },
            { title: 'Cleanse & Tone', description: 'Wash face with cleanser, then apply toner to reduce redness', duration_seconds: 90, category: 'face' },
            { title: 'Anti-Shine Moisturizer', description: 'Use mattifying moisturizer to prevent face shine under office lights', duration_seconds: 30, category: 'face' },
            { title: 'Professional Hairstyle', description: 'Use a medium-hold product for a clean, polished look. Side part or slick back.', duration_seconds: 120, category: 'hair' },
            { title: 'Subtle Fragrance', description: 'One spray of a clean, professional scent. Less is more.', duration_seconds: 15, category: 'body' },
        ],
    },
    {
        id: 'travel-essentials',
        name: 'Travel Essentials',
        emoji: '✈️',
        description: 'Minimal routine for when you\'re on the road.',
        tagline: 'Grooming doesn\'t take a vacation',
        isPremium: true,
        steps: [
            { title: 'Micellar Water Cleanse', description: 'No-rinse cleansing — perfect for hotel rooms and airports', duration_seconds: 45, category: 'face' },
            { title: 'Multi-Purpose Moisturizer', description: 'One product for face, hands, and dry patches', duration_seconds: 30, category: 'face' },
            { title: 'Dry Shampoo', description: 'Refresh hair without washing — absorbs oil and adds volume', duration_seconds: 30, category: 'hair' },
            { title: 'SPF Application', description: 'Never skip sunscreen, especially in new climates', duration_seconds: 30, category: 'face' },
        ],
    },
    {
        id: 'hangover-recovery',
        name: 'Hangover Recovery',
        emoji: '😅',
        description: 'When you need to look human again, fast.',
        tagline: 'Damage control mode',
        isPremium: false,
        steps: [
            { title: 'Drink Water First', description: 'Down a full glass of water before touching your face', duration_seconds: 30, category: 'other' },
            { title: 'Cold Water Face Splash', description: 'Splash ice-cold water on face 10 times — de-puffs and wakes you up', duration_seconds: 30, category: 'face' },
            { title: 'Eye Treatment', description: 'Caffeine eye cream or cold spoons on eyelids for 2 minutes to reduce puffiness', duration_seconds: 120, category: 'face' },
            { title: 'Hydrating Moisturizer', description: 'Alcohol dehydrates skin — apply a rich, hydrating cream', duration_seconds: 30, category: 'face' },
            { title: 'Dry Shampoo + Cap Optional', description: 'Quick volume refresh or just rock the cap. No judgment.', duration_seconds: 30, category: 'hair' },
        ],
    },
    {
        id: 'sun-protection',
        name: 'Sun Protection Day',
        emoji: '☀️',
        description: 'Beach day, outdoor event, or summer routine upgrade.',
        tagline: 'UV is the #1 aging factor',
        isPremium: true,
        steps: [
            { title: 'Antioxidant Serum', description: 'Vitamin C serum boosts SPF effectiveness and fights free radicals', duration_seconds: 30, category: 'face' },
            { title: 'SPF 50+ Sunscreen', description: 'Apply generously — 2 finger-lengths for face alone. Reapply every 2 hours.', duration_seconds: 45, category: 'face' },
            { title: 'UV Lip Balm', description: 'Lips burn too! Use an SPF 30+ lip balm', duration_seconds: 10, category: 'face' },
            { title: 'Hair UV Spray', description: 'Protect hair color and moisture from sun damage', duration_seconds: 15, category: 'hair' },
            { title: 'After-Sun Cool Down', description: 'At end of day: aloe vera gel on any sun-exposed skin', duration_seconds: 60, category: 'body' },
        ],
    },
    {
        id: 'winter-shield',
        name: 'Winter Shield',
        emoji: '❄️',
        description: 'Cold weather defense for skin and hair.',
        tagline: 'Beat the winter dryness',
        isPremium: true,
        steps: [
            { title: 'Cream Cleanser (Not Gel)', description: 'Switch to cream-based cleanser in winter — gel strips too much moisture', duration_seconds: 60, category: 'face' },
            { title: 'Hyaluronic Acid Layer', description: 'Apply to damp skin — it pulls moisture in and seals it', duration_seconds: 30, category: 'face' },
            { title: 'Rich Barrier Cream', description: 'Thick moisturizer with ceramides to protect against wind and cold', duration_seconds: 30, category: 'face' },
            { title: 'Leave-In Conditioner', description: 'Prevent hat hair and static with a lightweight leave-in', duration_seconds: 30, category: 'hair' },
            { title: 'Hand & Lip Care', description: 'Heavy hand cream + lip balm — extremities lose moisture first', duration_seconds: 30, category: 'body' },
        ],
    },
]
